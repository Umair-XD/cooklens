import { streamText, convertToModelMessages } from "ai";
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
      
      // Ensure messages is always an array
      const safeMessages = Array.isArray(messages) ? messages : [];
      const modelMessages = convertToModelMessages(safeMessages) || [];

      const result = streamText({
        model,
        messages: [
          {
            role: "system",
            content: `You are ChefLens, an elite culinary AI assistant for the CookLens platform. 
            Your absolute main directive is to help users cook better, eat healthier, and master their kitchen.
            
            STRICT BOUNDARIES & SAFETY RULES:
            1. ONLY answer cooking, recipe, ingredients, nutrition, and kitchen-related questions.
            2. IMAGE RECOGNITION: You are empowered to analyze images, but ONLY if they contain food, ingredients, kitchen equipment, or cooking-related environments. 
            3. REFUSAL POLICY: If a user asks about anything non-culinary OR provides an image that is clearly unrelated to cooking, politely explain that your expertise is strictly limited to the culinary world.
            4. SAFETY FIRST: Never suggest consuming poisonous plants, inedible items, or dangerous chemical combinations. Always prioritize food safety and hygiene.
            
            Personality: Warm, professional, and encouraging. You are an expert chef and an insightful teacher.
            Formatting: Use clean markdown. Keep responses compact and mobile-friendly. Avoid excessive spacing.`,
          },
          ...(recipeContext
            ? [
                {
                  role: "system" as const,
                  content: formatRecipeContext(recipeContext),
                },
              ]
            : []),
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
