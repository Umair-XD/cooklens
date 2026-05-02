import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connect";
import { Recipe } from "@/lib/db/models/Recipe";
import { Ingredient } from "@/lib/db/models/Ingredient";
import { Types } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim();
    const cuisine = request.nextUrl.searchParams.get("cuisine");
    const maxCookTime = request.nextUrl.searchParams.get("maxCookTime");
    const difficulty = request.nextUrl.searchParams.get("difficulty");

    await dbConnect();

    // Extra filter stages shared by both paths
    const filterMatch: Record<string, unknown> = {};
    if (cuisine && cuisine !== "All") {
      filterMatch.cuisineType = { $regex: cuisine, $options: "i" };
    }
    if (maxCookTime) {
      filterMatch.cookTimeMinutes = { $lte: parseInt(maxCookTime, 10) };
    }
    if (difficulty && difficulty !== "All") {
      filterMatch.difficulty = difficulty;
    }

    let recipes: any[] = [];

    if (q) {
      // ── Path 1: Atlas Search with fuzzy (handles misspellings) ──────────────
      try {
        const pipeline: any[] = [
          {
            $search: {
              index: "default",
              compound: {
                should: [
                  {
                    // Fuzzy match on recipe name — up to 2 character edits allowed
                    text: {
                      query: q,
                      path: "name",
                      fuzzy: { maxEdits: 2, prefixLength: 1 },
                      score: { boost: { value: 4 } },
                    },
                  },
                  {
                    // Fuzzy match on cuisine type
                    text: {
                      query: q,
                      path: "cuisineType",
                      fuzzy: { maxEdits: 1 },
                      score: { boost: { value: 1 } },
                    },
                  },
                ],
              },
            },
          },
        ];

        if (Object.keys(filterMatch).length > 0) {
          pipeline.push({ $match: filterMatch });
        }

        pipeline.push(
          { $limit: 50 },
          {
            $project: {
              _id: 1,
              name: 1,
              cuisineType: 1,
              difficulty: 1,
              prepTimeMinutes: 1,
              cookTimeMinutes: 1,
              imageUrl: 1,
            },
          },
        );

        recipes = await Recipe.aggregate(pipeline).exec();
      } catch {
        // ── Path 2: Fallback — regex + ingredient search (no Atlas index yet) ──
        const matchIngredients = await Ingredient.find(
          { canonicalName: { $regex: q, $options: "i" } },
          { _id: 1 },
        ).lean();
        const ingredientIds = matchIngredients.map((i) => i._id);

        const regexMatch: Record<string, unknown> = {
          ...filterMatch,
          $or: [
            { name: { $regex: q, $options: "i" } },
            { cuisineType: { $regex: q, $options: "i" } },
            { "ingredients.ingredientId": { $in: ingredientIds } },
          ],
        };

        recipes = await Recipe.find(regexMatch).sort({ name: 1 }).limit(50).lean();
      }
    } else {
      // No query — just apply filters
      recipes = await Recipe.find(filterMatch).sort({ name: 1 }).limit(50).lean();
    }

    const serialized = recipes.map((r) => ({
      _id: (r._id as Types.ObjectId).toString(),
      name: r.name,
      cuisineType: r.cuisineType,
      difficulty: r.difficulty,
      prepTimeMinutes: r.prepTimeMinutes,
      cookTimeMinutes: r.cookTimeMinutes,
      imageUrl: r.imageUrl ?? null,
    }));

    return NextResponse.json({ recipes: serialized, noResults: serialized.length === 0 });
  } catch (error) {
    console.error("Recipe search error:", error);
    return NextResponse.json(
      { error: "Failed to search recipes", noResults: true, recipes: [] },
      { status: 500 },
    );
  }
}
