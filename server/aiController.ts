
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
// Using global fetch which is available in Node > 18

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY;

// Gemini Client
const geminiAi = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

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
        throw new Error(`API Error: ${response.statusText}`);
    }

    const data: any = await response.json();
    return data.choices[0].message.content;
}

// Unified Generation Function
async function robustGenerate(prompt: string, systemContext: string = "Você é um especialista em RH e Segurança do Trabalho."): Promise<string> {
    // 1. Try Grok if available (User asked for Grok)
    // Using xAI API endpoint: https://api.x.ai/v1
    if (GROK_API_KEY) {
        try {
            console.log("Tentando gerar com Grok...");
            return await generateWithOpenAICompatible(GROK_API_KEY, 'https://api.x.ai/v1', 'grok-beta', prompt, systemContext);
        } catch (e) {
            console.error("Erro no Grok, tentando fallback...", e);
        }
    }

    // 2. Try Gemini
    if (geminiAi) {
        try {
            console.log("Tentando gerar com Gemini...");
            const response = await geminiAi.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `${systemContext}\n\n${prompt}`,
            });
            return response.text || "Sem resposta.";
        } catch (e) {
            console.error("Erro no Gemini:", e);
        }
    }

    return "Não foi possível gerar o conteúdo. Verifique as chaves de API (Grok/Gemini).";
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

// For JSON structure we might prefer Gemini's structured output if available, or force JSON in prompt for others
export const suggestRolesAndFunctions = async (industry: string) => {
    // Keeping Gemini specific for JSON schema feature for now as it's more robust, 
    // but could be polyfilled with simple JSON parsing from text for Grok if needed.
    if (geminiAi) {
        try {
            const response = await geminiAi.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `Sugira 5 cargos e 5 funções comuns no setor de ${industry} para um sistema de RH. Retorne apenas JSON.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            roles: { type: Type.ARRAY, items: { type: Type.STRING } },
                            functions: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            return JSON.parse(response.text || '{}');
        } catch (error) {
            console.error("Gemini JSON Error:", error);
        }
    }

    // Fallback simple JSON attempt
    try {
        const text = await robustGenerate(`Sugira 5 cargos e 5 funções comuns no setor de ${industry}. Retorne apenas um JSON puro com chaves "roles" e "functions" contendo arrays de strings.`);
        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
        return JSON.parse(jsonStr);
    } catch (e) {
        return { roles: [], functions: [] };
    }
};
