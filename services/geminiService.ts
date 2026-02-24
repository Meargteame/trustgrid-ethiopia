import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { TrustAnalysisResult } from "../types";

// Access via Vite env var
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize the Google Generative AI client
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface AiSummaryResult {
  summary: string;
  keyStrengths: string[];
  overallSentiment: 'Positive' | 'Neutral' | 'Mixed';
}

/**
 * Summarizes a batch of reviews to generate an overall business reputation card.
 */
export const generateTrustSummary = async (reviews: string[]): Promise<AiSummaryResult> => {
   // Fallback Mock Data
   const mockSummary: AiSummaryResult = {
      summary: "Based on verified reviews, this business consistently delivers quality results with a focus on communication and speed.",
      keyStrengths: ["Reliability", "Good Communication", "Quality Work"],
      overallSentiment: "Positive"
   };

   if (!apiKey || !genAI) {
      console.warn("API Key missing, returning mock summary");
      return mockSummary;
   }
   
   if (reviews.length === 0) {
      return {
         summary: "No reviews to analyze yet.",
         keyStrengths: [],
         overallSentiment: "Neutral"
      };
   }

   try {
      // Use 1.5 Flash for speed and broader access
      const model = genAI.getGenerativeModel({
         model: "gemini-1.5-flash", 
         generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
               type: SchemaType.OBJECT,
               properties: {
                  summary: { type: SchemaType.STRING, description: "A concise 1-2 sentence summary of what clients love about this business." },
                  keyStrengths: { 
                     type: SchemaType.ARRAY, 
                     items: { type: SchemaType.STRING },
                  },
                  overallSentiment: { type: SchemaType.STRING, enum: ["Positive", "Neutral", "Mixed"] }
               },
               required: ["summary", "keyStrengths", "overallSentiment"]
            }
         }
      });

      const prompt = `Analyze these ${reviews.length} customer reviews and provide a summary of the business reputation. Reviews: ${JSON.stringify(reviews)}`;
      const result = await model.generateContent(prompt);
      const output = result.response.text();
      
      return JSON.parse(output) as AiSummaryResult;
   } catch (error) {
      console.error("Summary Generation Failed:", error);
      return mockSummary;
   }
}

/**
 * Analyzes a SINGLE testimonial to detect spam, sentiment, and trust score.
 */
export const analyzeTrustContent = async (text: string): Promise<TrustAnalysisResult> => {
   
   const getFallbackResult = (inputText: string = ''): TrustAnalysisResult => {
      const safeText = inputText || '';
      // Simple heuristic: longer text might imply more detailed/trustworthy content
      // Base score 60, add 1 point per 10 characters, max 95.
      const lengthScore = Math.min(60 + Math.floor(safeText.length / 10), 95);

      return {
         score: lengthScore,
         sentiment: 'Neutral',
         keywords: ['Pending Analysis'], 
         reasoning: `Analysis unavailable (API Key missing). Estimated score based on text length.`,
         isAuthentic: true, 
         // Ensure fallback matches interface
         is_authentic: true 
      } as any;
   };

   if (!apiKey || !genAI) {
      console.warn("API Key missing, returning mock analysis");
      return getFallbackResult(text);
   }

   try {
      const model = genAI.getGenerativeModel({
         model: "gemini-1.5-flash",
         generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
               type: SchemaType.OBJECT,
               properties: {
                  score: { type: SchemaType.NUMBER, description: "Trust score 0-100 based on detail, specificity, and tone. Higher is better." },
                  sentiment: { type: SchemaType.STRING, enum: ["Positive", "Neutral", "Negative"] },
                  keywords: { 
                     type: SchemaType.ARRAY, 
                     items: { type: SchemaType.STRING },
                  },
                  reasoning: { type: SchemaType.STRING },
                  isAuthentic: { type: SchemaType.BOOLEAN }
               },
               required: ["score", "sentiment", "keywords", "reasoning", "isAuthentic"]
            }
         }
      });

      const prompt = `Analyze this testimonial for trust and authenticity.
      
      Review Text: "${text}"`;

      const result = await model.generateContent(prompt);
      const output = result.response.text();
      
      const parsed = JSON.parse(output);
      
      // Map back to our exact Typescript interface if needed
      return {
          score: parsed.score,
          sentiment: parsed.sentiment,
          keywords: parsed.keywords,
          reasoning: parsed.reasoning,
          isAuthentic: parsed.isAuthentic
      };

   } catch (error) {
      console.error("Gemini Analysis Failed:", error);
      const fallback = getFallbackResult(text);
      return {
         ...fallback,
         reasoning: "AI Analysis failed due to an error. Score estimated."
      };
   }
};

// Alias specifically for consumers expecting this name
export const analyzeSingleTestimonial = analyzeTrustContent;
