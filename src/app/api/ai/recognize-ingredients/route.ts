import { NextRequest, NextResponse } from "next/server";
import { generateText, createGateway } from "ai";

const TIMEOUT_MS = 10_000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body as { image?: string };

    if (!image) {
      return NextResponse.json(
        {
          error:
            "No image provided. Please include a base64-encoded image in the request body.",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "AI service is currently unavailable. Please try again later.",
        },
        { status: 503 },
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const gateway = createGateway({ apiKey });
      const model = gateway.languageModel("recognize-ingredients");

      const { text } = await generateText({
        model,
        prompt: `Analyze this image and identify ingredients. Return JSON: {"ingredients": [{"ingredient": "name", "confidence": 0.0}]}`,
        abortSignal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: "Failed to parse recognition results. Please try again." },
          { status: 502 },
        );
      }

      const ingredients: Array<{ ingredient: string; confidence: number }> =
        Array.isArray(data?.ingredients)
          ? data.ingredients.filter(
              (i: { ingredient: string; confidence: number }) =>
                typeof i.ingredient === "string" &&
                typeof i.confidence === "number" &&
                i.confidence >= 0.7,
            )
          : [];

      return NextResponse.json({ ingredients });
    } catch (aiError: unknown) {
      clearTimeout(timeoutId);

      if (aiError instanceof DOMException && aiError.name === "AbortError") {
        return NextResponse.json(
          {
            error:
              "The request took too long. Please try again with a smaller image.",
          },
          { status: 408 },
        );
      }

      return NextResponse.json(
        {
          error:
            "Something went wrong while recognizing ingredients. Please try again.",
        },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Please provide a valid image." },
      { status: 400 },
    );
  }
}
