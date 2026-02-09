
import { GoogleGenAI } from "@google/genai";

export const generateBusinessBio = async (businessName: string, category: string, keywords: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Write a professional, catchy, and concise micro-business bio for a business named "${businessName}" in the category "${category}". Focus on these keywords: ${keywords}. Keep it under 150 characters for a directory listing.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
