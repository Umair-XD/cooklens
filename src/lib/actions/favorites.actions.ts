"use server";

import { dbConnect } from "@/lib/db/connect";
import { Favorite } from "@/lib/db/models/Favorite";
import { Recipe } from "@/lib/db/models/Recipe";
import { Types } from "mongoose";

export async function getUserFavorites(userId: string) {
  try {
    await dbConnect();

    const favorites = await Favorite.find({
      userId: new Types.ObjectId(userId),
    })
      .populate("recipeId")
      .sort({ createdAt: -1 });

    return favorites.map((fav) => ({
      id: (fav.recipeId as any)._id.toString(),
      name: (fav.recipeId as any).name,
      cuisineType: (fav.recipeId as any).cuisineType,
      difficulty: (fav.recipeId as any).difficulty,
      prepTimeMinutes: (fav.recipeId as any).prepTimeMinutes,
      cookTimeMinutes: (fav.recipeId as any).cookTimeMinutes,
      nutrition: (fav.recipeId as any).nutrition,
    }));
  } catch (error) {
    console.error("Get favorites error:", error);
    return [];
  }
}
