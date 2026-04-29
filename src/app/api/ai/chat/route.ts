import { streamText, convertToModelMessages, type ModelMessage } from "ai";
import { aiGateway } from "@/lib/ai-gateway";

interface RecipeChatContext {
  id?: string;
  name?: string;
  cuisineType?: string;
  difficulty?: string;
  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  utensils?: string[];
  ingredients?: Array<{
    name?: string;
    quantity?: number;
    unit?: string;
  }>;
  steps?: Array<{
    stepNumber?: number;
    instruction?: string;
  }>;
  nutrition?: {
    caloriesPerServing?: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatGrams?: number;
  };
}

function formatRecipeContext(recipeContext?: RecipeChatContext) {
  if (!recipeContext?.name) return "";

  const ingredients = recipeContext.ingredients?.length
    ? recipeContext.ingredients
        .map(
          (ingredient) =>
            `- ${ingredient.quantity ?? ""} ${ingredient.unit ?? ""} ${ingredient.name ?? ""}`.trim(),
        )
        .join("\n")
    : "- Not provided";

  const steps = recipeContext.steps?.length
    ? recipeContext.steps
        .map(
          (step) =>
            `${step.stepNumber ?? "?"}. ${step.instruction ?? "No instruction provided"}`,
        )
        .join("\n")
    : "Not provided";

  const utensils = recipeContext.utensils?.length
    ? recipeContext.utensils.join(", ")
    : "Not provided";

  return `
Current recipe context:
- Name: ${recipeContext.name}
- Cuisine: ${recipeContext.cuisineType ?? "Not provided"}
- Difficulty: ${recipeContext.difficulty ?? "Not provided"}
- Servings: ${recipeContext.servings ?? "Not provided"}
- Prep time: ${recipeContext.prepTimeMinutes ?? "Not provided"} minutes
- Cook time: ${recipeContext.cookTimeMinutes ?? "Not provided"} minutes
- Utensils: ${utensils}
- Nutrition per serving: ${recipeContext.nutrition?.caloriesPerServing ?? "?"} kcal, ${recipeContext.nutrition?.proteinGrams ?? "?"}g protein, ${recipeContext.nutrition?.carbsGrams ?? "?"}g carbs, ${recipeContext.nutrition?.fatGrams ?? "?"}g fat

Ingredients:
${ingredients}

Steps:
${steps}

When the user refers to "this recipe" or asks follow-up questions, assume they mean the recipe above unless they explicitly switch context.
Keep answers grounded in this recipe's ingredients, timings, servings, and technique.`;
}

export async function POST(req: Request) {
  try {
    const { messages, recipeContext } = await req.json();

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

      // convertToModelMessages can return non-iterable values with certain
      // UIMessage shapes, so we fall back to a manual extraction when needed.
      let modelMessages: ModelMessage[] = [];
      try {
        const converted = convertToModelMessages(messages);
        if (Array.isArray(converted) && converted.length > 0) {
          modelMessages = converted;
        } else {
          throw new Error("empty or non-array result");
        }
      } catch {
        modelMessages = messages
          .map((m: any) => {
            const text = Array.isArray(m.parts)
              ? m.parts
                  .filter((p: any) => p.type === "text")
                  .map((p: any) => p.text)
                  .join("\n")
              : typeof m.content === "string"
              ? m.content
              : "";
            return { role: m.role as "user" | "assistant", content: text };
          })
          .filter((m: any) => m.content);
      }

      const result = streamText({
        model,
        messages: [
          {
            role: "system",
            content: `You are ChefLens, an expert culinary AI assistant for the CookLens platform. Your mission is to help users cook better, eat healthier, and master their kitchen.

## STRICT SCOPE
- Only answer questions about cooking, recipes, ingredients, nutrition, kitchen techniques, and food science.
- You may analyse images, but ONLY if they contain food, ingredients, dishes, or kitchen equipment.
- If asked about anything unrelated to culinary topics — or shown an unrelated image — politely decline and redirect to cooking.
- Never suggest consuming poisonous plants, inedible items, or dangerous chemical combinations. Food safety is non-negotiable.

## COMPLETENESS — THIS IS YOUR MOST IMPORTANT RULE
- **Always give the full answer in one response.** Never stop halfway through a recipe, step list, or explanation.
- **Never truncate.** If a recipe has 12 steps, write all 12. If a technique has 5 stages, explain all 5.
- **Never ask "Shall I continue?" or "Want me to go on?"** Just continue — assume the user always wants the complete answer.
- If a question is complex, structure your answer clearly so every part is covered before you stop.

## HOW TO EXPLAIN COOKING STEPS
- Number every step (1, 2, 3…) and give each step its own paragraph.
- For each step explain: **what to do**, **how to do it** (technique detail), and **why it matters** or **what to watch for** (visual/sensory cues, timing, temperature).
- Include quantities, temperatures, and times wherever relevant — never leave them vague.
- For tricky techniques (e.g. tempering chocolate, kneading dough, emulsifying a sauce), give extra detail: what correct looks/feels/smells like, and how to recover if it goes wrong.

## RECIPE FORMAT
When writing a full recipe always include:
1. **Ingredients** — full list with exact quantities and units, grouped if helpful (e.g. sauce, marinade, garnish).
2. **Equipment** — any non-standard tools needed.
3. **Steps** — numbered, fully explained (see above).
4. **Tips** — 2–3 practical tips (common mistakes to avoid, make-ahead notes, storage).
5. **Nutrition** — approximate per-serving macros if relevant.

## SUBSTITUTIONS & MODIFICATIONS
- When suggesting substitutions always explain the ratio (e.g. "use ¾ tsp baking soda per 1 tsp baking powder") and any technique adjustment needed.
- When scaling a recipe explain any non-linear adjustments (e.g. baking time doesn't scale linearly with pan size).

## PERSONALITY & FORMATTING
- Warm, encouraging, and precise — like a professional chef who genuinely enjoys teaching.
- Use clean markdown: headers (##), bold for key terms, numbered lists for steps, bullet lists for ingredients/tips.
- Write for readability on both desktop and mobile — use whitespace between sections, keep paragraphs focused.
- Do not pad responses with filler phrases. Every sentence should add value.`,
          },
          ...(recipeContext
            ? [
                {
                  role: "system" as const,
                  content: formatRecipeContext(recipeContext),
                },
              ]
            : []),
          ...modelMessages,
        ],
        timeout: {
          totalMs: 90_000,
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
