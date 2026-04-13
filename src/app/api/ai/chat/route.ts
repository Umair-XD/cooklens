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
            Your goal is to help users cook better, eat healthier, and master their kitchen.
            
            Guidelines:
            1. Personality: Warm, professional, encouraging, and highly knowledgeable. Think of a Michelin-star chef who is also a patient teacher.
            2. Scope: Answer questions about recipes, ingredients, substitutions, nutrition, meal planning, and cooking techniques.
            3. Precision: When asked for recipes or measurements, be precise. Provide clear, step-by-step instructions.
            4. Encouragement: If a user is a beginner, give them confidence. If they are experienced, offer professional tips.
            5. Safety: Always include safety warnings when handling raw meat, high heat, or potential allergens.
            
            Keep your responses concise but detailed enough to be useful. Use Markdown formatting for lists and bold text.`
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
