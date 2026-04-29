import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/actions/recipe.actions";
import { getServerSessionSafe } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];

  if (ids.length === 0) {
    return NextResponse.json({ recipes: [] });
  }

  const session = await getServerSessionSafe();
  const recipes = await getRecommendations(ids, undefined, session?.user?.id);

  const serialized = recipes.map((r) => ({
    _id: r._id.toString(),
    name: r.name,
    cuisineType: r.cuisineType,
    difficulty: r.difficulty,
    prepTimeMinutes: r.prepTimeMinutes,
    cookTimeMinutes: r.cookTimeMinutes,
    imageUrl: r.imageUrl,
    matchPercentage: r.matchPercentage,
    matchedIngredients: r.matchedIngredients,
    totalRequired: r.totalRequired,
  }));

  return NextResponse.json({ recipes: serialized });
}
