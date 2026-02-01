
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || ''; // Fallback checking
const ai = new GoogleGenAI({ apiKey });

export const generateProfessionalSummary = async (data: any) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash', // Updated to stable model or use flash-preview if preferred
            contents: `Gere um breve perfil profissional em português para um colaborador com os seguintes dados: ${JSON.stringify(data)}. Seja formal e use no máximo 3 frases.`,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Não foi possível gerar o resumo profissional.";
    }
};

export const generateRoleDescription = async (roleName: string, cbo: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Como um especialista em RH e EHS, descreva as principais responsabilidades e requisitos para o cargo de "${roleName}" que possui o CBO "${cbo}". Seja técnico e objetivo. Use no máximo 4 parágrafos.`,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Não foi possível gerar a descrição automática.";
    }
};

export const getCidDescription = async (cidCode: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Você é um médico do trabalho. Forneça uma descrição curta e técnica (máximo 150 caracteres) para o CID-10 "${cidCode}". Foque apenas no nome da patologia e se há recomendação padrão de repouso. Não use introduções.`,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Descrição técnica do CID indisponível.";
    }
};

export const suggestRolesAndFunctions = async (industry: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Sugira 5 cargos e 5 funções comuns no setor de ${industry} para um sistema de RH. Retorne apenas JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        roles: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        functions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Gemini Error:", error);
        return { roles: [], functions: [] };
    }
};
