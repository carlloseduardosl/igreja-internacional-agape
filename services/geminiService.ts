
import { GoogleGenAI } from "@google/genai";

// Inicialização seguindo estritamente as diretrizes do SDK
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyWord = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Dê uma palavra profética e curta (máximo 300 caracteres) de encorajamento baseada na Bíblia para os membros da Igreja Internacional Ágape hoje. Use um tom acolhedor e termine com uma citação bíblica curta.',
      config: {
        temperature: 0.8,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao buscar palavra diária:", error);
    return "Que o amor de Deus (Ágape) preencha seu coração hoje. 'O Senhor é o meu pastor; nada me faltará.' (Salmo 23:1)";
  }
};

export const getPastoralAssistantResponse = async (question: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é o Assistente Virtual da Igreja Internacional Ágape. Responda à seguinte dúvida de um membro de forma bíblica e amorosa: ${question}`,
      config: {
        systemInstruction: "Você é um assistente pastoral sábio, calmo e que usa referências bíblicas. Suas respostas devem ser acolhedoras e baseadas nos princípios da Igreja Ágape. Sempre termine a resposta abençoando o usuário.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Erro no assistente pastoral:", error);
    return "Desculpe, tive um problema técnico para acessar a orientação agora. Por favor, procure um de nossos pastores pessoalmente ou tente novamente em instantes.";
  }
};
