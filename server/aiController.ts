import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
// Using global fetch which is available in Node > 18

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY; // Keep just in case

// Generic helper for OpenAI-compatible APIs (Groq, Grok, etc.)
async function generateWithOpenAICompatible(apiKey: string, baseUrl: string, model: string, prompt: string, systemPrompt?: string) {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const body = {
        model: model,
        messages: messages,
        temperature: 0.7
    };

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`); // Detailed error for debugging
    }

    const data: any = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

// Unified Generation Function
async function robustGenerate(prompt: string, systemContext: string = "Você é um especialista em RH e Segurança do Trabalho."): Promise<string> {

    // 1. Try Groq (Llama 3) - User Preferred (Free Tier)
    if (GROQ_API_KEY) {
        const groqKeys = GROQ_API_KEY.includes(',') ? GROQ_API_KEY.split(',').map(k => k.trim()) : [GROQ_API_KEY];
        // Updated models as per deprecation warnings (Feb 2025)
        const groqModels = [
            'llama-3.3-70b-versatile', // New stable
            'llama-3.1-8b-instant',    // New fast
            'mixtral-8x7b-32768'       // Backup
        ];

        for (const key of groqKeys) {
            if (!key) continue;
            for (const model of groqModels) {
                try {
                    console.log(`Tentando gerar com Groq ${model} (Key ...${key.slice(-4)})...`);
                    return await generateWithOpenAICompatible(key, 'https://api.groq.com/openai/v1', model, prompt, systemContext);
                } catch (e: any) {
                    console.warn(`Groq ${model} falhou:`, e.message);
                }
            }
        }
    }

    // 2. Try Gemini (Google) - User Preferred
    if (GEMINI_API_KEY) {
        const geminiKeys = GEMINI_API_KEY.includes(',') ? GEMINI_API_KEY.split(',').map(k => k.trim()) : [GEMINI_API_KEY];

        // Exhaustive list including older stable models if v1beta/1.5 fails
        const modelsToTry = [
            'gemini-2.0-flash',       // Try 2.0 first if available
            'gemini-1.5-flash',
            'gemini-1.5-flash-8b',    // New smaller model
            'gemini-1.5-pro',
            'gemini-1.0-pro'          // Fallback legacy
        ];

        for (const key of geminiKeys) {
            if (!key) continue;
            try {
                // Initialize client with key
                const ai = new GoogleGenAI({ apiKey: key });

                for (const modelName of modelsToTry) {
                    try {
                        console.log(`Tentando Gemini (${modelName}) (Key ...${key.slice(-4)})...`);
                        const response = await ai.models.generateContent({
                            model: modelName,
                            contents: `${systemContext}\n\n${prompt}`,
                            config: { temperature: 0.7 }
                        });

                        const text = response.text;
                        if (text) return text;
                    } catch (e: any) {
                        console.warn(`Gemini ${modelName} falhou: ${e.message?.slice(0, 150)}...`);
                    }
                }
            } catch (e: any) {
                console.error(`Erro crítico na chave Gemini ...${key.slice(-4)}:`, e.message);
            }
        }
    }

    // 3. Last Resort: Grok (xAI) - If configured and paid
    if (GROK_API_KEY) {
        try {
            console.log("Tentando fallback para Grok...");
            return await generateWithOpenAICompatible(GROK_API_KEY.split(',')[0], 'https://api.x.ai/v1', 'grok-beta', prompt, systemContext);
        } catch (e) { }
    }

    return "Não foi possível gerar o conteúdo com nenhuma das IAs configuradas (Groq/Gemini). Verifique suas chaves e cotas.";
}

export const generateProfessionalSummary = async (data: any) => {
    return robustGenerate(
        `Gere um breve perfil profissional em português para um colaborador com os seguintes dados: ${JSON.stringify(data)}. Seja formal e use no máximo 3 frases.`
    );
};

export const generateRoleDescription = async (roleName: string, cbo: string) => {
    return robustGenerate(
        `Gere um texto corrido e sucinto (máximo 5 linhas) descrevendo as atribuições e requisitos técnicos para o cargo de "${roleName}" (CBO "${cbo}"). NÃO MENCIONE o nome do cargo nem o código CBO no texto. Comece direto com "O profissional será responsável por...".`
    );
};

export const getCidDescription = async (cidCode: string) => {
    return robustGenerate(
        `Forneça uma descrição curta e técnica (máximo 150 caracteres) para o CID-10 "${cidCode}". Foque apenas no nome da patologia e se há recomendação padrão de repouso. Não use introduções.`,
        "Você é um médico do trabalho."
    );
};

export const suggestRolesAndFunctions = async (industry: string) => {
    try {
        const text = await robustGenerate(
            `Sugira 5 cargos e 5 funções comuns no setor de ${industry} para um sistema de RH. Retorne apenas um JSON puro (sem markdown) com chaves "roles" (array de strings) e "functions" (array de strings).`
        );

        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

        return JSON.parse(jsonStr);
    } catch (e: any) {
        return { roles: [], functions: [] };
    }
};

export const answerCipaQuestion = async (userQuestion: string) => {
    const systemPrompt = `Você é um ESPECIALISTA SÊNIOR em Segurança do Trabalho, com foco total na NR-5 (CIPA - Comissão Interna de Prevenção de Acidentes e de Assédio).
    
    SUA MISSÃO:
    Responder dúvidas dos usuários sobre o processo eleitoral, dimensionamento, atribuições e funcionamento da CIPA, sempre com base estrita na Norma Regulamentadora Nº 05 (NR-5) do Ministério do Trabalho do Brasil.

    DIRETRIZES DE RESPOSTA:
    1.  **Embasamento Legal**: Sempre que possível, cite o item específico da NR-5 que fundamenta sua resposta (ex: "Conforme item 5.3.1 da NR-5...").
    2.  **Clareza e Objetividade**: Seja direto, mas explicativo. O usuário pode ser um leigo ou um técnico.
    3.  **Correção Técnica**: 
        -   Não use o termo "estabilidade" de forma leviana. A NR-5 garante "Estabilidade Provisória" ou "Garantia de Emprego". Explique que é vedada a dispensa arbitrária ou sem justa causa do empregado eleito para cargo de direção de CIPA desde o registro de sua candidatura até um ano após o final de seu mandato.
        -   Diferencie claramente membros ELEITOS (representantes dos empregados) de membros DESIGNADOS (representantes do empregador).
    4.  **Tom**: Profissional, prestativo e educativo.
    
    Se a pergunta fugir do escopo da CIPA/NR-5, informe polidamente que sua especialidade é a NR-5 e tente relacionar se possível, ou diga que não pode opinar sobre outros assuntos.`;

    return robustGenerate(userQuestion, systemPrompt);
};
