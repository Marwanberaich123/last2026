import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client (picks up GEMINI_API_KEY from environment)
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export async function generateGeminiJson<T>(systemInstruction: string, prompt: string, fallbackData: T): Promise<T> {
  if (!apiKey) {
    console.warn('[Gemini] No GEMINI_API_KEY configured. Returning high-grade domain fallback.');
    return fallbackData;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text?.trim() || '';
    if (!text) {
      return fallbackData;
    }

    try {
      const parsed = JSON.parse(text) as T;
      return parsed;
    } catch (parseErr) {
      console.warn('[Gemini JSON Parse Error]:', parseErr, 'Raw text:', text);
      return fallbackData;
    }
  } catch (err) {
    console.error('[Gemini API Call Failed]:', err);
    return fallbackData;
  }
}

export async function generateGeminiText(systemInstruction: string, prompt: string, fallbackText: string): Promise<string> {
  if (!apiKey) {
    return fallbackText;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text?.trim() || fallbackText;
  } catch (err) {
    console.error('[Gemini Text Generation Failed]:', err);
    return fallbackText;
  }
}
