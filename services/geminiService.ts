
import { GoogleGenAI } from "@google/genai";

// Multiple API keys for automatic rotation/fallback
const API_KEYS = [
  process.env.API_KEY_1,
  process.env.API_KEY_2,
  process.env.API_KEY_3,
  process.env.API_KEY_4,
  process.env.API_KEY, // Fallback to original env var if set
].filter(Boolean) as string[];

console.log('🔑 API Keys loaded:', API_KEYS.length);
console.log('🔑 Keys available:', API_KEYS.map((key, i) => `Key ${i + 1}: ${key?.substring(0, 20)}...`));

if (API_KEYS.length === 0) {
  console.error("❌ No API keys found in environment variables.");
} else {
  console.log(`✅ ${API_KEYS.length} API key(s) ready for rotation`);
}

// TEMPORARY: Test with just the first key
console.log('⚠️ TESTING MODE: Using only first API key, rotation disabled');
const SINGLE_KEY = API_KEYS[0];
console.log('🔑 Using key:', SINGLE_KEY?.substring(0, 25) + '...');

// Track current key index for rotation
let currentKeyIndex = 0;

// Helper to get the next API key
const getNextApiKey = (): string | null => {
  if (API_KEYS.length === 0) return null;
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
};

// Helper to check if error is quota/rate limit related
const isQuotaError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorString = String(error).toLowerCase();

  return (
    errorMessage.includes('quota') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('resource exhausted') ||
    errorMessage.includes('429') ||
    errorString.includes('quota') ||
    errorString.includes('rate limit')
  );
};

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
  // Using Gemini 2.0 Flash Experimental with image generation
  const model = 'gemini-2.0-flash-exp';
  console.log('🎨 Using model:', model);

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

  // Define the single execution function with retry logic
  const generateSingleImage = async (): Promise<string> => {
    // TEMPORARY: Simplified to use just one key
    const apiKey = SINGLE_KEY;

    if (!apiKey) {
      throw new Error("No API key available");
    }

    console.log(`🚀 Attempting image generation with first API key only`);

    // Create a new AI instance with the current key
    const ai = new GoogleGenAI({ apiKey });

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

    console.log('📥 API Response received:', {
      hasCandidates: !!response.candidates,
      candidatesLength: response.candidates?.length,
      firstCandidate: response.candidates?.[0] ? 'exists' : 'missing'
    });

    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          console.log(`✓ Success!`);
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    console.error('⚠️ Response structure unexpected:', JSON.stringify(response, null, 2));
    throw new Error("No image generated in the response.");
  };

  try {
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
