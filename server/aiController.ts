import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
// Using global fetch which is available in Node > 18

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY;

// Gemini Client
const geminiClient = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Generic helper for OpenAI-compatible APIs (Grok, etc.)
async function generateWithOpenAICompatible(apiKey: string, baseUrl: string, model: string, prompt: string, systemPrompt?: string) {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            messages,
            model: model,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText} (${response.status})`);
    }

    const data: any = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

// Unified Generation Function
async function robustGenerate(prompt: string, systemContext: string = "Você é um especialista em RH e Segurança do Trabalho."): Promise<string> {
    // 1. Try Grok if available (User asked for Grok)
    // Using xAI API endpoint: https://api.x.ai/v1
    if (GROK_API_KEY) {
        try {
            console.log("Tentando gerar com Grok...");
            return await generateWithOpenAICompatible(GROK_API_KEY, 'https://api.x.ai/v1', 'grok-beta', prompt, systemContext);
        } catch (e: any) {
            console.error("Erro no Grok, tentando fallback...", e.message);
        }
    }

    // 2. Try Gemini with Fallback Strategy
    if (geminiClient) {
        const modelsToTry = [
            'gemini-1.5-flash',
            'gemini-2.0-flash',
            'gemini-1.5-pro',
            'gemini-pro'
        ];

        for (const modelName of modelsToTry) {
            try {
                console.log(`Tentando gerar com Gemini (${modelName})...`);
                const model = geminiClient.getGenerativeModel({ model: modelName });

                // Gemini SDK doesn't support system instructions in 1.0 reliably in all regions,
                // but 1.5+ does. We can prepend it to prompt just to be safe and compatible across versions.
                const fullPrompt = `${systemContext}\n\n${prompt}`;

                const result = await model.generateContent(fullPrompt);
                const response = await result.response;
                const text = response.text();

                if (text) return text;
                throw new Error("Resposta vazia.");

            } catch (e: any) {
                // Log specific error for debugging but continue to next model
                const isQuota = e?.stack?.includes('429') || e?.message?.includes('429') || e?.toString().includes('Quota');
                const isNotFound = e?.stack?.includes('404') || e?.message?.includes('404') || e?.message?.includes('not found');

                console.warn(`Falha no modelo ${modelName}: ${isQuota ? 'Cota Excedida' : (isNotFound ? 'Modelo não encontrado' : e.message)}`);

                // If it's the last model, log the full error
                if (modelName === modelsToTry[modelsToTry.length - 1]) {
                    console.error("Todas as tentativas no Gemini falharam.");
                }
            }
        }
    }

    return "Não foi possível gerar o conteúdo. (Cotas excedidas ou Chaves inválidas).";
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

        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

        return JSON.parse(jsonStr);
    } catch (e: any) {
        console.error("Erro ao gerar JSON de sugestões:", e.message);
        return { roles: [], functions: [] };
    }
};
