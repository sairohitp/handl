import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateHandleSuggestions = async (startupName: string): Promise<string[]> => {
  if (!startupName.trim()) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a branding expert. Generate 5 creative, short, modern, and brandable social media handle variations for a startup named "${startupName}". 
      
      Strategies to use:
      1. Prefixes: get, use, try, join, go
      2. Suffixes: app, hq, io, lab, co, inc
      3. Creative misspellings or shortenings (if readable)
      
      Return ONLY a JSON array of strings.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return ["try" + startupName, "get" + startupName, startupName + "app", startupName + "hq", startupName + "co"]; // Fallback
  }
};