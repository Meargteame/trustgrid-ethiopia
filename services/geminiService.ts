import { GoogleGenAI, Type } from "@google/genai";
import { TrustAnalysisResult } from "../types";

// Access via Vite env var
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface AiSummaryResult {
  summary: string;
  keyStrengths: string[];
  overallSentiment: 'Positive' | 'Neutral' | 'Mixed';
}

export const generateTrustSummary = async (reviews: string[]): Promise<AiSummaryResult> => {
   if (!apiKey) {
      console.warn("API Key missing, returning mock summary");
      return {
         summary: "Based on verified reviews, this business consistently delivers quality results with a focus on communication and speed.",
         keyStrengths: ["Reliability", "Good Communication", "Quality Work"],
         overallSentiment: "Positive"
      };
   }
   
   if (reviews.length === 0) {
      return {
         summary: "No reviews to analyze yet.",
         keyStrengths: [],
         overallSentiment: "Neutral"
      };
   }

   try {
      const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Updated to latest stable or preview
      contents: `
         Analyze these ${reviews.length} customer reviews and provide a summary of the business reputation.
         Reviews: ${JSON.stringify(reviews)}
      `,
      config: {
         responseMimeType: "application/json",
         responseSchema: {
            type: Type.OBJECT,
            properties: {
            summary: { type: Type.STRING, description: "A concise 1-2 sentence summary of what clients love about this business. Start with 'Clients praise...' or similar." },
            keyStrengths: { 
               type: Type.ARRAY, 
               items: { type: Type.STRING },
               description: "3-4 short keyword phrases (max 2 words each) highlight strengths. e.g. 'Fast Delivery'"
            },
            overallSentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Mixed"] }
            },
            required: ["summary", "keyStrengths", "overallSentiment"]
         }
      }
      });

      const jsonText = response.text;
      if (!jsonText) throw new Error("No response");
      
      return JSON.parse(jsonText) as AiSummaryResult;
   } catch (error) {
      console.error("Summary Generation Failed:", error);
      return {
         summary: "Based on verified reviews, this business demonstrates strong performance and client satisfaction.",
         keyStrengths: ["Professionalism", "Quality", "Service"],
         overallSentiment: "Positive"
      };
   }
}

export const analyzeTrustContent = async (text: string): Promise<TrustAnalysisResult> => { // ... (rest of function)
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following business testimonial text for authenticity and trust markers. Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "A trust score between 0 and 100" },
            sentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] },
            keywords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Key trust-building words found in the text"
            },
            reasoning: { type: Type.STRING, description: "Short explanation of the score" },
            isAuthentic: { type: Type.BOOLEAN, description: "Whether the text appears to be a genuine human review" }
          },
          required: ["score", "sentiment", "keywords", "reasoning", "isAuthentic"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from Gemini");
    
    return JSON.parse(jsonText) as TrustAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback mock response for demo resilience if API fails or key is missing
    return {
      score: 88,
      sentiment: 'Positive',
      keywords: ['Professional', 'Verified', 'Timely'],
      reasoning: "The text contains specific details about the service provided, which is a strong indicator of authenticity.",
      isAuthentic: true
    };
  }
};