"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSessionSafe } from "@/lib/auth";
import { dbConnect } from "@/lib/db/connect";
import { Recipe, IRecipe, IRecipeIngredient, IRecipeStep, INutrition, Difficulty } from "@/lib/db/models/Recipe";
import { Ingredient, IIngredient } from "@/lib/db/models/Ingredient";
import { User } from "@/lib/db/models/User";
import { Types } from "mongoose";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function requireAdmin() {
  const session = await getServerSessionSafe();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized: ADMIN role required" };
  }
  return { success: true } as const;
}

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const recipeStepSchema = z.object({
  stepNumber: z.number().min(1, "Step number must be at least 1"),
  instruction: z.string().min(1, "Step instruction is required"),
});

const recipeIngredientSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient is required"),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  unit: z.string().min(1, "Unit is required"),
});

const nutritionSchema = z.object({
  caloriesPerServing: z.number().min(0, "Calories must be 0 or greater"),
  proteinGrams: z.number().min(0, "Protein must be 0 or greater"),
  carbsGrams: z.number().min(0, "Carbs must be 0 or greater"),
  fatGrams: z.number().min(0, "Fat must be 0 or greater"),
});

const recipeFormSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  cuisineType: z.string().min(1, "Cuisine type is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"] as const),
  prepTimeMinutes: z.number().min(0, "Prep time must be 0 or greater"),
  cookTimeMinutes: z.number().min(0, "Cook time must be 0 or greater"),
  servings: z.number().min(1, "Servings must be at least 1"),
  utensils: z.array(z.string()).min(1, "At least one utensil is required"),
  steps: z.array(recipeStepSchema).min(1, "At least one step is required"),
  ingredients: z.array(recipeIngredientSchema).min(1, "At least one ingredient is required"),
  nutrition: nutritionSchema,
});

const ingredientFormSchema = z.object({
  canonicalName: z.string().min(1, "Canonical name is required"),
  aliases: z.array(z.string()),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;
export type IngredientFormValues = z.infer<typeof ingredientFormSchema>;

// ---------------------------------------------------------------------------
// Recipe CRUD
// ---------------------------------------------------------------------------

export async function createRecipe(values: RecipeFormValues) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const validation = recipeFormSchema.safeParse(values);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }

  try {
    await dbConnect();

    const recipe = await Recipe.create({
      name: values.name,
      cuisineType: values.cuisineType,
      difficulty: values.difficulty,
      prepTimeMinutes: values.prepTimeMinutes,
      cookTimeMinutes: values.cookTimeMinutes,
      servings: values.servings,
      utensils: values.utensils,
      steps: values.steps.map((s) => ({
        stepNumber: s.stepNumber,
        instruction: s.instruction,
      })),
      ingredients: values.ingredients.map((i) => ({
        ingredientId: new Types.ObjectId(i.ingredientId),
        quantity: i.quantity,
        unit: i.unit,
      })),
      nutrition: values.nutrition,
    });

    revalidatePath("/admin/recipes");
    return { success: true, recipe: JSON.parse(JSON.stringify(recipe)) };
  } catch (error) {
    console.error("Error creating recipe:", error);
    return { success: false, errors: [{ field: "general", message: "Failed to create recipe" }] };
  }
}

export async function updateRecipe(id: string, values: RecipeFormValues) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const validation = recipeFormSchema.safeParse(values);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }

  try {
    await dbConnect();

    const recipe = await Recipe.findByIdAndUpdate(
      id,
      {
        name: values.name,
        cuisineType: values.cuisineType,
        difficulty: values.difficulty,
        prepTimeMinutes: values.prepTimeMinutes,
        cookTimeMinutes: values.cookTimeMinutes,
        servings: values.servings,
        utensils: values.utensils,
        steps: values.steps.map((s) => ({
          stepNumber: s.stepNumber,
          instruction: s.instruction,
        })),
        ingredients: values.ingredients.map((i) => ({
          ingredientId: new Types.ObjectId(i.ingredientId),
          quantity: i.quantity,
          unit: i.unit,
        })),
        nutrition: values.nutrition,
      },
      { new: true, runValidators: true },
    );

    if (!recipe) {
      return { success: false, errors: [{ field: "general", message: "Recipe not found" }] };
    }

    revalidatePath("/admin/recipes");
    return { success: true, recipe: JSON.parse(JSON.stringify(recipe)) };
  } catch (error) {
    console.error("Error updating recipe:", error);
    return { success: false, errors: [{ field: "general", message: "Failed to update recipe" }] };
  }
}

export async function deleteRecipe(id: string) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  if (!id || !Types.ObjectId.isValid(id)) {
    return { success: false, errors: [{ field: "general", message: "Invalid recipe ID" }] };
  }

  try {
    await dbConnect();

    const recipe = await Recipe.findByIdAndDelete(id);
    if (!recipe) {
      return { success: false, errors: [{ field: "general", message: "Recipe not found" }] };
    }

    revalidatePath("/admin/recipes");
    return { success: true };
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return { success: false, errors: [{ field: "general", message: "Failed to delete recipe" }] };
  }
}

// ---------------------------------------------------------------------------
// Ingredient CRUD
// ---------------------------------------------------------------------------

export async function createIngredient(values: IngredientFormValues) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const validation = ingredientFormSchema.safeParse(values);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }

  try {
    await dbConnect();

    const ingredient = await Ingredient.create({
      canonicalName: values.canonicalName,
      aliases: values.aliases,
    });

    revalidatePath("/admin/ingredients");
    return { success: true, ingredient: JSON.parse(JSON.stringify(ingredient)) };
  } catch (error: unknown) {
    console.error("Error creating ingredient:", error);
    const message = (error as { code?: number; message?: string })?.code === 11000
      ? "An ingredient with this name already exists"
      : "Failed to create ingredient";
    return { success: false, errors: [{ field: "general", message }] };
  }
}

export async function updateIngredient(id: string, values: IngredientFormValues) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const validation = ingredientFormSchema.safeParse(values);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }

  try {
    await dbConnect();

    const ingredient = await Ingredient.findByIdAndUpdate(
      id,
      {
        canonicalName: values.canonicalName,
        aliases: values.aliases,
      },
      { new: true, runValidators: true },
    );

    if (!ingredient) {
      return { success: false, errors: [{ field: "general", message: "Ingredient not found" }] };
    }

    revalidatePath("/admin/ingredients");
    return { success: true, ingredient: JSON.parse(JSON.stringify(ingredient)) };
  } catch (error: unknown) {
    console.error("Error updating ingredient:", error);
    const message = (error as { code?: number; message?: string })?.code === 11000
      ? "An ingredient with this name already exists"
      : "Failed to update ingredient";
    return { success: false, errors: [{ field: "general", message }] };
  }
}

export async function deleteIngredient(id: string) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  if (!id || !Types.ObjectId.isValid(id)) {
    return { success: false, errors: [{ field: "general", message: "Invalid ingredient ID" }] };
  }

  try {
    await dbConnect();

    const ingredient = await Ingredient.findByIdAndDelete(id);
    if (!ingredient) {
      return { success: false, errors: [{ field: "general", message: "Ingredient not found" }] };
    }

    revalidatePath("/admin/ingredients");
    return { success: true };
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    return { success: false, errors: [{ field: "general", message: "Failed to delete ingredient" }] };
  }
}

// ---------------------------------------------------------------------------
// User Management
// ---------------------------------------------------------------------------

export async function updateUserRole(id: string, role: "USER" | "ADMIN") {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  if (!id || !Types.ObjectId.isValid(id)) {
    return { success: false, errors: [{ field: "general", message: "Invalid user ID" }] };
  }

  try {
    await dbConnect();
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!user) {
      return { success: false, errors: [{ field: "general", message: "User not found" }] };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, errors: [{ field: "general", message: "Failed to update user role" }] };
  }
}

export async function deleteUser(id: string) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  if (!id || !Types.ObjectId.isValid(id)) {
    return { success: false, errors: [{ field: "general", message: "Invalid user ID" }] };
  }

  try {
    await dbConnect();

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return { success: false, errors: [{ field: "general", message: "User not found" }] };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, errors: [{ field: "general", message: "Failed to delete user" }] };
  }
}

// ---------------------------------------------------------------------------
// Fetch helpers used by admin pages
// ---------------------------------------------------------------------------

export async function getAllRecipes() {
  const auth = await requireAdmin();
  if (!auth.success) return [];

  await dbConnect();
  const recipes = await Recipe.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(recipes)) as (IRecipe & { _id: string })[];
}

export async function getAllIngredients() {
  const auth = await requireAdmin();
  if (!auth.success) return [];

  await dbConnect();
  const ingredients = await Ingredient.find().sort({ canonicalName: 1 }).lean();
  return JSON.parse(JSON.stringify(ingredients)) as (IIngredient & { _id: string })[];
}
