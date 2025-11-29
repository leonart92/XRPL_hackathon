import { GoogleGenAI } from "@google/genai";
import { Vault } from '../types';

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    const apiKey = (import.meta as any).env?.GEMINI_API_KEY ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      (typeof process !== 'undefined' && (process.env.API_KEY || process.env.GEMINI_API_KEY)) ||
      '';

    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables');
    }

    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

export const analyzeVault = async (vault: Vault): Promise<string> => {
  const ai = getClient();
  const prompt = `
    You are a senior DeFi risk analyst for the Morpho Protocol.
    Analyze the following lending vault data concisely for a potential investor.
    
    Vault Details:
    - Asset: ${vault.token.name} (${vault.token.symbol})
    - Protocol: ${vault.protocol}
    - Current Net APY: ${vault.netApy}%
    - Utilization Rate: ${vault.utilization}%
    - Total Supply: $${vault.totalSupply.toLocaleString()}
    - Liquidity Available: $${vault.liquidity.toLocaleString()}
    - Risk Factor Assessment: ${vault.riskFactor}

    Please provide:
    1. A brief explanation of the yield source.
    2. Key risks associated with this specific setup (e.g., high utilization, smart contract risk).
    3. A strategic recommendation (e.g., "Good for long term stablecoin yield" or "Monitoring required").

    Keep the tone professional, objective, and concise (max 150 words). Format with clear bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Analysis unavailable at this time.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Unable to generate risk analysis. Please try again later.";
  }
};
