
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

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
  aspectRatio: string = "1:1",
  accessToken?: string | null
): Promise<string[]> => {
  try {
    const modelName = 'gemini-2.0-flash'; // Updated to latest model if available, or stick to 1.5-flash

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
      if (accessToken) {
        // Use REST API with Access Token
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: {
              parts: buildParts()
            },
            generationConfig: {
              responseMimeType: "text/plain" // We want text/image description back? No, we want image editing? 
              // Wait, the original code was using generateContent which returns text/multimodal.
              // If we are doing image editing/generation, we expect an image back?
              // The original code was parsing `part.inlineData.data`. 
              // Does gemini-1.5-flash return images directly? 
              // The original code suggests it does: `return data:image/png;base64,${part.inlineData.data}`
              // So we should keep the config similar.
            },
            systemInstruction: {
              parts: [
                { text: "You are a professional photo editor. Your task is to modify the input image according to the user's prompt. Return ONLY the modified image. Maintain high quality and realistic lighting." }
              ]
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
          for (const part of data.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
        throw new Error("No image generated in the response.");

      } else {
        // Use SDK with API Key (Legacy/Fallback)
        if (!API_KEY) {
          throw new Error("Missing API Key and no Access Token provided.");
        }
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
          model: modelName,
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
      }
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
