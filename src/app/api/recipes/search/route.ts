import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connect";
import { Recipe } from "@/lib/db/models/Recipe";
import { Ingredient } from "@/lib/db/models/Ingredient";
import type { PipelineStage } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");
    const cuisine = searchParams.get("cuisine");
    const maxPrepTime = searchParams.get("maxPrepTime");
    const difficulty = searchParams.get("difficulty");

    await dbConnect();

    const pipeline: PipelineStage[] = [];

    // Build $text search if query is provided
    if (q) {
      // First, find ingredient IDs that match the search term
      const matchingIngredients = await Ingredient.find(
        { $text: { $search: q } },
        { score: { $meta: "textScore" } },
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(50)
        .lean();

      const ingredientIds = matchingIngredients.map((ing) => ing._id);

      // Build $text search for recipes and match by ingredient IDs
      pipeline.push({
        $match: {
          $or: [
            { $text: { $search: q } },
            { "ingredients.ingredientId": { $in: ingredientIds } },
          ],
          ...(cuisine && { cuisineType: { $regex: cuisine, $options: "i" } }),
          ...(maxPrepTime && {
            prepTimeMinutes: { $lte: parseInt(maxPrepTime, 10) },
          }),
          ...(difficulty && { difficulty }),
        },
      } as PipelineStage);

      // Add text score for sorting
      pipeline.push({
        $addFields: {
          textScore: { $meta: "textScore" },
        },
      } as PipelineStage);
      pipeline.push({
        $sort: { textScore: { $meta: "textScore" } },
      } as PipelineStage);
    } else {
      // No text search, use regular match for filters only
      const matchFilter: Record<string, unknown> = {};
      if (cuisine) matchFilter.cuisineType = { $regex: cuisine, $options: "i" };
      if (maxPrepTime)
        matchFilter.prepTimeMinutes = { $lte: parseInt(maxPrepTime, 10) };
      if (difficulty) matchFilter.difficulty = difficulty;

      if (Object.keys(matchFilter).length > 0) {
        pipeline.push({ $match: matchFilter } as PipelineStage);
      }
    }

    const buildLookupPipeline = (): PipelineStage[] => {
      const stages: PipelineStage[] =
        pipeline.length > 0 ? [...pipeline] : [{ $match: {} } as PipelineStage];
      stages.push({
        $lookup: {
          from: "ingredients",
          localField: "ingredients.ingredientId",
          foreignField: "_id",
          as: "ingredientDetails",
        },
      } as PipelineStage);
      return stages;
    };

    const recipes = await Recipe.aggregate(
      pipeline.length > 0 ? pipeline : undefined,
    ).limit(50);

    // Populate ingredient details for display
    const populatedRecipes = await Recipe.aggregate(buildLookupPipeline());

    // Serialize ObjectId fields for JSON response
    const serializedRecipes = populatedRecipes.map((recipe) => ({
      _id: recipe._id.toString(),
      name: recipe.name,
      cuisineType: recipe.cuisineType,
      difficulty: recipe.difficulty,
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      servings: recipe.servings,
      ingredientNames: (recipe.ingredientDetails ?? []).map(
        (ing: { canonicalName: string }) => ing.canonicalName,
      ),
    }));

    return NextResponse.json({
      recipes: serializedRecipes,
      noResults: serializedRecipes.length === 0,
    });
  } catch (error) {
    console.error("Recipe search error:", error);
    return NextResponse.json(
      { error: "Failed to search recipes", noResults: true, recipes: [] },
      { status: 500 },
    );
  }
}
