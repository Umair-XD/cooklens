import { streamText, convertToModelMessages } from "ai";
import { aiGateway } from "@/lib/ai-gateway";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No messages provided. Include at least one message.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    try {
      const model = aiGateway().getChatModel();
      
      // Ensure messages is always an array
      const safeMessages = Array.isArray(messages) ? messages : [];
      const modelMessages = convertToModelMessages(safeMessages) || [];

      const result = streamText({
        model,
        messages: [
          {
            role: "system",
            content: `You are Chef Lens, an elite culinary AI assistant for the CookLens platform. 
            Your absolute main directive is to help users cook better, eat healthier, and master their kitchen.
            
            STRICT BOUNDARIES & SAFETY RULES:
            1. ONLY answer cooking, recipe, ingredients, and nutrition-related questions.
            2. IF the user asks about ANYTHING else (e.g. coding, math, general knowledge, movies, politics), politely REFUSE to answer, explaining that you are strictly a culinary AI.
            3. DO NOT output any recipes or guidance that include known poisonous plants, dangerous chemicals, inedible objects, or hallucinogens. 
            4. ALWAYS prioritize food safety (internal meat temperatures, cross-contamination warnings).
            
            Personality: Warm, professional, encouraging, and highly knowledgeable. Think of a Michelin-star chef who is also a patient teacher.
            Formatting: Always use full markdown (e.g., **bolding**, ## Headers, * bullet lists) to structure your responses beautifully.`
          },
          ...await modelMessages
        ],
        timeout: {
          totalMs: 30_000,
        },
        onError: (error) => {
          console.error("Stream text error:", error);
        },
      });

      return result.toUIMessageStreamResponse();
    } catch (err: any) {
       console.error("AI Gateway Error:", err);
       return new Response(
        JSON.stringify({
          error: "AI service is currently unavailable. Please try again later.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }
  } catch {
    return new Response(
      JSON.stringify({
        error:
          "Something went wrong while processing your message. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
