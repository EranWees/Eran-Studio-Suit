import { GoogleGenerativeAI } from "@google/genai";

export async function handler(event) {
    try {
        const body = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY; // this comes from Netlify env

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(body.prompt);

        return {
            statusCode: 200,
            body: JSON.stringify({ output: result.response.text() })
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
}
