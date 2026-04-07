import { streamText, createGateway } from "ai";

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

    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "AI service is currently unavailable. Please try again later.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }

    const gateway = createGateway({ apiKey });
    const model = gateway.languageModel("chat");

    const result = streamText({
      model,
      messages,
      timeout: {
        totalMs: 15_000,
      },
      onError: (error) => {
        console.error("Stream text error:", error);
      },
    });

    return result.toUIMessageStreamResponse();
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
