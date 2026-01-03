
import { GoogleGenAI, Type } from "@google/genai";

export const getVTInsights = async (inputValue: number, vtValue: number, finalValue: number) => {
  try {
    // A inicialização da IA foi movida para dentro desta função.
    // Isso garante que o app não quebre ao carregar se a API_KEY não estiver presente.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `O usuário converteu ${inputValue} para ${vtValue} VT (fórmula: valor/4 + 1). 
                 Com o multiplicador aplicado, o valor final é ${finalValue}. 
                 Dê uma breve análise sarcástica ou divertida sobre este investimento em "Moeda VT" em português.`,
      config: {
        maxOutputTokens: 150,
        temperature: 0.8,
      }
    });
    return response.text || "Sem insights no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "A IA está ocupada contando seus VTs.";
  }
};
