
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getVTInsights = async (inputValue: number, vtValue: number, finalValue: number) => {
  try {
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
