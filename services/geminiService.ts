
import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBsB3KhtUM2yr7gYpegVdFIZ22UkpSGvrg";

if (!API_KEY) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

// Helper to convert base64 to Blob-like structure expected by some parts of the API if needed,
// but for inlineData we just need the string.
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

const getMimeType = (base64: string) => {
  const match = base64.match(/^data:image\/(png|jpeg|jpg|webp);base64,/);
  return match ? `image/${match[1]}` : 'image/jpeg';
};

export const editImage = async (
  imageBase64: string,
  prompt: string,
  referenceImageBase64?: string | null,
  variationCount: number = 1,
  aspectRatio: string = "1:1"
): Promise<string[]> => {
  try {
    const model = 'gemini-2.5-flash-image';

    // Build parts array for a single request
    const buildParts = () => {
      const parts: any[] = [
        {
          inlineData: {
            mimeType: getMimeType(imageBase64),
            data: cleanBase64(imageBase64),
          },
        }
      ];

      // If a reference image (asset) is provided, add it to the request
      if (referenceImageBase64) {
        parts.push({
          inlineData: {
            mimeType: getMimeType(referenceImageBase64),
            data: cleanBase64(referenceImageBase64),
          },
        });
      }

      // Add prompt
      parts.push({ text: prompt });
      return parts;
    };

    // Define the single execution function
    const generateSingleImage = async (): Promise<string> => {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: buildParts(),
        },
        config: {
          systemInstruction: "You are a professional photo editor. Your task is to modify the input image according to the user's prompt. Return ONLY the modified image. Maintain high quality and realistic lighting.",
          imageConfig: {
            aspectRatio: aspectRatio as any
          }
        }
      });

      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      throw new Error("No image generated in the response.");
    };

    // Create an array of promises based on variationCount
    const promises = Array.from({ length: variationCount }, () => generateSingleImage());

    // Execute in parallel
    const results = await Promise.all(promises);
    return results;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
