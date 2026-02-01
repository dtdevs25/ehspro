
// Client-side service that calls the backend API
// This replaces the direct Usage of @google/genai in the browser

const API_BASE = '/api'; // In production, this is relative. In dev with proxy, it works.

export const generateProfessionalSummary = async (data: any) => {
  try {
    const response = await fetch(`${API_BASE}/ai/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Não foi possível gerar o resumo profissional com a IA.";
  }
};

export const generateRoleDescription = async (roleName: string, cbo: string) => {
  try {
    const response = await fetch(`${API_BASE}/ai/role-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleName, cbo })
    });
    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Erro ao gerar descrição.";
  }
};

export const getCidDescription = async (cidCode: string) => {
  try {
    const response = await fetch(`${API_BASE}/ai/cid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid: cidCode })
    });
    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Erro ao buscar CID.";
  }
};

export const suggestRolesAndFunctions = async (industry: string) => {
  try {
    const response = await fetch(`${API_BASE}/ai/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry })
    });
    return await response.json();
  } catch (error) {
    console.error("AI Service Error:", error);
    return { roles: [], functions: [] };
  }
};
