"use server";

import { dbConnect } from "@/lib/db/connect";
import { Recipe, IRecipe } from "@/lib/db/models/Recipe";
import { User, IUser } from "@/lib/db/models/User";
import { Favorite } from "@/lib/db/models/Favorite";
import { Types } from "mongoose";

export interface RecipeFilters {
  maxPrepTime?: number;
  difficulty?: string;
  cuisineType?: string;
}

export interface RankedRecipe
  extends Omit<IRecipe, "_id">, Record<string, unknown> {
  _id: Types.ObjectId;
  matchedIngredients: number;
  totalRequired: number;
  matchPercentage: number;
}

/**
 * Get recipe recommendations based on provided ingredients.
 * Ranks recipes by matchedIngredients/totalRequired descending.
 * Applies dietary exclusions from user preferences unless overrideDietary is true.
 * Applies optional filters for prep time, difficulty, and cuisine type.
 */
export async function getRecommendations(
  ingredientIds: string[],
  filters?: RecipeFilters,
  userId?: string,
  overrideDietary?: boolean,
): Promise<RankedRecipe[]> {
  if (!ingredientIds || ingredientIds.length === 0) {
    return [];
  }

  try {
    await dbConnect();

    const ingredientObjectIds = ingredientIds.map(
      (id) => new Types.ObjectId(id),
    );

    // Build the aggregation pipeline
    const pipeline: Record<string, unknown>[] = [];

    // Match recipes that contain at least one of the provided ingredients
    pipeline.push({
      $match: {
        "ingredients.ingredientId": { $in: ingredientObjectIds },
      },
    });

    // Apply dietary exclusions from user preferences unless overridden
    if (userId && !overrideDietary) {
      const user = await User.findById(userId).select(
        "preferences.dietaryRestrictions preferences.dislikedIngredients",
      );
      if (user) {
        const userPrefs = user as IUser;
        const dietaryRestrictions =
          userPrefs.preferences?.dietaryRestrictions || [];
        const dislikedIngredients =
          userPrefs.preferences?.dislikedIngredients || [];

        // Exclude recipes whose cuisineType matches a dietary restriction
        // (e.g., if user has "non-veg" as restriction, exclude non-veg cuisine)
        if (dietaryRestrictions.length > 0) {
          pipeline.push({
            $match: {
              cuisineType: { $nin: dietaryRestrictions },
            },
          });
        }

        // Exclude recipes containing disliked ingredients
        if (dislikedIngredients.length > 0) {
          const dislikedIngredientIds = dislikedIngredients
            .filter(
              (id): id is string =>
                typeof id === "string" && Types.ObjectId.isValid(id),
            )
            .map((id) => new Types.ObjectId(id));

          if (dislikedIngredientIds.length > 0) {
            pipeline.push({
              $match: {
                "ingredients.ingredientId": { $nin: dislikedIngredientIds },
              },
            });
          }
        }
      }
    }

    // Apply filters
    if (filters) {
      const filterQuery: Record<string, unknown> = {};
      if (filters.maxPrepTime !== undefined) {
        filterQuery.prepTimeMinutes = { $lte: filters.maxPrepTime };
      }
      if (filters.difficulty) {
        filterQuery.difficulty = filters.difficulty;
      }
      if (filters.cuisineType) {
        filterQuery.cuisineType = filters.cuisineType;
      }
      if (Object.keys(filterQuery).length > 0) {
        pipeline.push({ $match: filterQuery });
      }
    }

    // Calculate match metrics
    pipeline.push({
      $addFields: {
        matchedIngredients: {
          $size: {
            $filter: {
              input: "$ingredients",
              as: "ing",
              cond: { $in: ["$$ing.ingredientId", ingredientObjectIds] },
            },
          },
        },
        totalRequired: { $size: "$ingredients" },
      },
    });

    // Calculate match percentage
    pipeline.push({
      $addFields: {
        matchPercentage: {
          $round: [
            {
              $multiply: [
                { $divide: ["$matchedIngredients", "$totalRequired"] },
                100,
              ],
            },
            0,
          ],
        },
      },
    });

    // Sort by match percentage descending, then by matched ingredients descending
    pipeline.push({
      $sort: {
        matchPercentage: -1,
        matchedIngredients: -1,
      },
    });

    const results = await Recipe.aggregate(pipeline as any);

    return results as RankedRecipe[];
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
}

/**
 * Search recipes by dish name using MongoDB $text search.
 * Supports optional filters for prep time, difficulty, and cuisine type.
 */
export async function searchByDishName(
  query: string,
  filters?: RecipeFilters,
): Promise<IRecipe[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    await dbConnect();

    const searchPipeline: Record<string, unknown>[] = [
      {
        $match: {
          $text: { $search: query.trim() },
        },
      },
      {
        $addFields: {
          score: { $meta: "textScore" },
        },
      },
    ];

    // Apply filters
    if (filters) {
      const filterQuery: Record<string, unknown> = {};
      if (filters.maxPrepTime !== undefined) {
        filterQuery.prepTimeMinutes = { $lte: filters.maxPrepTime };
      }
      if (filters.difficulty) {
        filterQuery.difficulty = filters.difficulty;
      }
      if (filters.cuisineType) {
        filterQuery.cuisineType = filters.cuisineType;
      }
      if (Object.keys(filterQuery).length > 0) {
        searchPipeline.push({ $match: filterQuery });
      }
    }

    // Sort by text score descending
    searchPipeline.push({
      $sort: {
        score: { $meta: "textScore" },
      },
    });

    const results = await Recipe.aggregate(searchPipeline as any);

    return results as IRecipe[];
  } catch (error) {
    console.error("Error searching recipes:", error);
    return [];
  }
}

/**
 * Toggle a recipe as favorite for a given user.
 * Returns the new favorite state (true if now favorited, false if removed).
 */
export async function toggleFavorite(
  userId: string,
  recipeId: string,
): Promise<{ success: boolean; isFavorite?: boolean; error?: string }> {
  if (!userId || !recipeId) {
    return { success: false, error: "User ID and Recipe ID are required" };
  }

  try {
    await dbConnect();

    const existing = await Favorite.findOne({
      userId: new Types.ObjectId(userId),
      recipeId: new Types.ObjectId(recipeId),
    });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return { success: true, isFavorite: false };
    } else {
      await Favorite.create({
        userId: new Types.ObjectId(userId),
        recipeId: new Types.ObjectId(recipeId),
      });
      return { success: true, isFavorite: true };
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { success: false, error: "Failed to toggle favorite" };
  }
}

/**
 * Check if a recipe is favorited by a user.
 */
export async function checkFavorite(
  userId: string,
  recipeId: string,
): Promise<boolean> {
  if (!userId || !recipeId) {
    return false;
  }

  try {
    await dbConnect();

    const existing = await Favorite.findOne({
      userId: new Types.ObjectId(userId),
      recipeId: new Types.ObjectId(recipeId),
    });

    return !!existing;
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
}
