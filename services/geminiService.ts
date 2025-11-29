import { GoogleGenAI } from "@google/genai";
import { Vault } from '../types';
import { getAssociationById } from '../constants';

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
  const association = getAssociationById(vault.associationId);

  const prompt = `
    You are a senior impact investment analyst specializing in environmental causes.
    Analyze the following investment vault data concisely for a potential investor.
    
    Vault Details:
    - Vault Name: ${vault.name}
    - Association: ${association?.name || 'Unknown'}
    - Category: ${association?.category || 'Environmental'}
    - Current Net APY: ${vault.netApy}%
    - Utilization Rate: ${vault.utilization}%
    - Total Value Locked: $${vault.totalSupply.toLocaleString()}
    - Available Liquidity: $${vault.liquidity.toLocaleString()}
    - Risk Factor Assessment: ${vault.riskFactor}
    - Lock Period: ${vault.lockPeriod || 'No lock'}

    Please provide:
    1. A brief explanation of how returns are generated for this environmental vault.
    2. Key risks associated with this investment (e.g., utilization risk, lock period considerations).
    3. A strategic recommendation for impact-conscious investors.

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
