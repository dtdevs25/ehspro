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
        // Models to try: Llama 3 70B (High Quality) -> 8B (Fast/Backup)
        const groqModels = ['llama3-70b-8192', 'llama3-8b-8192'];

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
        // Use standard names. 'gemini-pro' is 1.0. 'gemini-1.5-flash' is 1.5.
        // If v1beta doesn't support 1.5 in this region/sdk, fallback to 1.0 (gemini-pro).
        const modelsToTry = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro',       // 1.0 Pro (Standard)
            'gemini-1.0-pro'    // Alias
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
                            config: {
                                temperature: 0.7
                            }
                        });

                        const text = response.text;
                        if (text) return text;
                    } catch (e: any) {
                        // Log warning but continue to next model
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
        `Descreva as principais responsabilidades e requisitos para o cargo de "${roleName}" que possui o CBO "${cbo}". Seja técnico e objetivo. Use no máximo 4 parágrafos.`
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
