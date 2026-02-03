
import { GoogleGenAI } from "@google/genai";

// Use process.env.API_KEY directly when initializing the @google/genai client instance
export const interpretSign = async (imageBase64) => {
    try {
        // Initializing the AI client within the function to ensure the latest API key is used
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: imageBase64.split(',')[1],
                        },
                    },
                    {
                        text: "Interpret this sign language gesture. What does it mean? Provide a concise, clear answer for a hearing/speaking challenged user. If no clear sign is detected, politely ask them to try again.",
                    },
                ],
            },
            config: {
                systemInstruction: "You are an expert Sign Language interpreter. Your goal is to translate visual signs into clear text.",
            }
        });

        // response.text is a property, not a method.
        return response.text || "I couldn't interpret that. Please try moving closer to the camera.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Error interpreting sign. Please check your connection.";
    }
};
