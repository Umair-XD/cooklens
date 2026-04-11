import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connect";
import { Recipe } from "@/lib/db/models/Recipe";
import { Ingredient } from "@/lib/db/models/Ingredient";
import { Types } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q");
    const cuisine = request.nextUrl.searchParams.get("cuisine");
    const maxCookTime = request.nextUrl.searchParams.get("maxCookTime");
    const difficulty = request.nextUrl.searchParams.get("difficulty");

    await dbConnect();

    // Build mongo query
    const match: Record<string, unknown> = {};

    if (q) {
      // Search by name (case-insensitive) and ingredient names
      const matchIngredients = await Ingredient.find(
        { canonicalName: { $regex: q, $options: "i" } },
        { _id: 1 },
      ).lean();
      const ingredientIds = matchIngredients.map((i) => i._id);

      match.$or = [
        { name: { $regex: q, $options: "i" } },
        { cuisineType: { $regex: q, $options: "i" } },
        { "ingredients.ingredientId": { $in: ingredientIds } },
      ];
    }

    if (cuisine) {
      match.cuisineType = { $regex: cuisine, $options: "i" };
    }
    if (maxCookTime) {
      const mins = parseInt(maxCookTime, 10);
      match.cookTimeMinutes = { $lte: mins };
    }
    if (difficulty) {
      match.difficulty = difficulty;
    }

    let query = Recipe.find(match).sort({ name: 1 }).limit(50).lean();

    const recipes = await query;

    const serialized = recipes.map((r) => ({
      _id: (r._id as Types.ObjectId).toString(),
      name: r.name,
      cuisineType: r.cuisineType,
      difficulty: r.difficulty,
      prepTimeMinutes: r.prepTimeMinutes,
      cookTimeMinutes: r.cookTimeMinutes,
    }));

    return NextResponse.json({
      recipes: serialized,
      noResults: serialized.length === 0,
    });
  } catch (error) {
    console.error("Recipe search error:", error);
    return NextResponse.json(
      { error: "Failed to search recipes", noResults: true, recipes: [] },
      { status: 500 },
    );
  }
}
