import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey: apiKey });
} else {
  console.warn("VITE_GEMINI_API_KEY is not set. AI features will be disabled.");
}

export const generateHandleSuggestions = async (startupName: string): Promise<string[]> => {
  if (!startupName.trim()) return [];

  if (!ai) {
    console.log("AI service is not initialized. Returning fallback suggestions.");
    return ["try" + startupName, "get" + startupName, startupName + "app", startupName + "hq", startupName + "co"];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
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