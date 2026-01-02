import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_CORE, SYSTEM_PROMPT_GATEKEEPER } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGatekeeperResponse = async (history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  if (!process.env.API_KEY) return "ERRO: CHAVE DE API NÃO DETECTADA. SISTEMA COMPROMETIDO.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: history,
      config: {
        systemInstruction: SYSTEM_PROMPT_GATEKEEPER,
        temperature: 0.7,
        // Removed maxOutputTokens to follow guidelines and avoid truncation
      }
    });
    return response.text || "Silêncio no barramento de dados...";
  } catch (error) {
    console.error("Gatekeeper error:", error);
    return "Erro de conexão neural. Tente novamente.";
  }
};

export const generateCoreResponse = async (prompt: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
    if (!process.env.API_KEY) return "ERRO CRÍTICO: MÓDULO NEURAL DESCONECTADO (API KEY AUSENTE).";
  
    try {
      // We reconstruct history for context, appending the new prompt
      const contents = [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // More powerful model for the "Core"
        contents: contents,
        config: {
          systemInstruction: SYSTEM_PROMPT_CORE,
          temperature: 0.9, // Higher creativity
          thinkingConfig: { thinkingBudget: 1024 }, // Enable thinking for complex tasks
        }
      });
      return response.text || "Processamento concluído. Sem saída de dados.";
    } catch (error) {
      console.error("Core error:", error);
      return "Falha na sinapse central. Verifique sua conexão com a Matrix.";
    }
  };