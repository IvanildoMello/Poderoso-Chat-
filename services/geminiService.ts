
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_CORE, SYSTEM_PROMPT_GATEKEEPER } from '../constants';

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    console.error("MÓDULO CRÍTICO: Chave de API ausente.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateGatekeeperResponse = async (history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "ERRO DE PROTOCOLO: Chave de segurança não detectada.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: history,
      config: {
        systemInstruction: SYSTEM_PROMPT_GATEKEEPER,
        temperature: 0.7,
      }
    });
    return response.text || "Sem resposta.";
  } catch (error: any) {
    console.error("Falha no Gatekeeper:", error);
    return "Erro de conexão neural. As sinapses do Guardião estão instáveis.";
  }
};

export const generateCoreResponse = async (prompt: string, history: {role: string, parts: {text: string}[]}[]) => {
    const ai = getAIClient();
    if (!ai) return { text: "ERRO CRÍTICO: Núcleo neural desativado.", chunks: [] };
  
    try {
      const contents = [
          ...history,
          { role: 'user', parts: [{ text: prompt }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Flash para velocidade extrema com busca
        contents: contents,
        config: {
          systemInstruction: SYSTEM_PROMPT_CORE,
          temperature: 0.3, // Menor temperatura para maior precisão factual
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: 0 }, // 0 para resposta instantânea em tarefas simples
        }
      });
      
      const text = response.text || "Processamento concluído.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      return { text, chunks };
    } catch (error: any) {
      console.error("Falha no Núcleo Central:", error);
      return { text: "FALHA NA SINAPSE CENTRAL: Link de dados interrompido.", chunks: [] };
    }
  };
