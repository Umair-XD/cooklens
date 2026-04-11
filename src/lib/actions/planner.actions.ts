"use server";

import { dbConnect } from "@/lib/db/connect";
import {
  MealPlan,
  IMealPlan,
  IMealSlot,
  MealType,
} from "@/lib/db/models/MealPlan";
import { Recipe, IRecipe } from "@/lib/db/models/Recipe";
import { Types } from "mongoose";
import { calculateTDEE } from "@/lib/utils/tdee";
import {
  PlanGoal,
  goalCalorieAdjustment,
  GeneratePlanSchema,
  SwapMealSchema,
  type GeneratePlanInput,
  type SwapMealInput,
} from "@/lib/schemas/planner.schema";

// ---------------------------------------------------------------------------
// Serialize Mongoose documents to plain JSON-safe objects
// ---------------------------------------------------------------------------

function serializePlan(plan: any): any {
  return JSON.parse(
    JSON.stringify(plan, (_key, value) => {
      // Mongoose ObjectId: has _bsontype or buffer array
      if (value && typeof value === "object" && !Array.isArray(value)) {
        if (value._bsontype === "ObjectId" || value._bsontype === "ObjectID") {
          return value.toString();
        }
        if (value.buffer && Array.isArray(value.buffer)) {
          return value.id || Buffer.from(value.buffer).toString("hex");
        }
      }
      if (value instanceof Date) return value.toISOString();
      return value;
    }),
  );
}

// ---------------------------------------------------------------------------
// Helper: distribute daily calories across 3 meals
// ---------------------------------------------------------------------------

const MEAL_RATIOS: Record<MealType, number> = {
  BREAKFAST: 0.25,
  LUNCH: 0.35,
  DINNER: 0.4,
};

// ---------------------------------------------------------------------------
// Helper: get start-of-week Monday date
// ---------------------------------------------------------------------------

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  now.setDate(now.getDate() + diff);
  now.setHours(0, 0, 0, 0);
  return now;
}

// ---------------------------------------------------------------------------
// generatePlan
// ---------------------------------------------------------------------------

export async function generatePlan(
  raw: GeneratePlanInput,
): Promise<{ success: boolean; plan?: IMealPlan; error?: string }> {
  const parsed = GeneratePlanSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors[0] };
  }

  const { age, weightKg, heightCm, sex, activityLevel, goal, userId } =
    parsed.data;

  try {
    await dbConnect();

    const tdee = calculateTDEE(age, weightKg, heightCm, sex, activityLevel);
    const dailyTarget = goalCalorieAdjustment(tdee, goal);

    // Fetch all recipes from DB
    const allRecipes = await Recipe.find({}).lean<IRecipe[]>();
    if (allRecipes.length === 0) {
      return { success: false, error: "No recipes available to build a plan." };
    }

    const DAYS = 7;
    const MEALS: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];
    const CALORIE_TOLERANCE = 0.1; // 10 %

    // Per-meal calorie targets
    const mealTargets: Record<string, number> = {};
    for (const meal of MEALS) {
      mealTargets[meal] = dailyTarget * MEAL_RATIOS[meal];
    }

    // Helper: pick a random recipe within tolerance for a meal type
    const pickRecipe = (
      mealType: MealType,
      excludeIds: Set<string>,
    ): Types.ObjectId | null => {
      const target = mealTargets[mealType];
      const lower = target * (1 - CALORIE_TOLERANCE);
      const upper = target * (1 + CALORIE_TOLERANCE);

      const candidates = allRecipes.filter(
        (r) =>
          r.nutrition?.caloriesPerServing != null &&
          r.nutrition.caloriesPerServing >= lower &&
          r.nutrition.caloriesPerServing <= upper &&
          !excludeIds.has(r._id.toString()),
      );

      if (candidates.length === 0) {
        // Fallback: pick any recipe not excluded
        const fallback = allRecipes.filter(
          (r) => !excludeIds.has(r._id.toString()),
        );
        if (fallback.length === 0) return null;
        return fallback[Math.floor(Math.random() * fallback.length)]._id;
      }

      return candidates[Math.floor(Math.random() * candidates.length)]._id;
    };

    // Build 21 slots (7 days x 3 meals), avoiding duplicate recipe per day
    const slots: IMealSlot[] = [];
    for (let day = 0; day < DAYS; day++) {
      const usedToday = new Set<string>();
      for (const meal of MEALS) {
        const recipeId = pickRecipe(meal, usedToday);
        if (!recipeId) continue;
        usedToday.add(recipeId.toString());
        slots.push({ dayIndex: day, mealType: meal, recipeId });
      }
    }

    if (slots.length === 0) {
      return { success: false, error: "Could not generate any meal slots." };
    }

    const weekStart = getWeekStart();

    const plan = await MealPlan.create({
      userId: new Types.ObjectId(userId),
      weekStart,
      slots,
    });

    const populated = await MealPlan.findById(plan._id)
      .populate("slots.recipeId")
      .lean();

    return {
      success: true,
      plan: serializePlan(populated) as unknown as IMealPlan,
    };
  } catch (err) {
    console.error("Error generating plan:", err);
    return { success: false, error: "Failed to generate meal plan." };
  }
}

// ---------------------------------------------------------------------------
// swapMeal
// ---------------------------------------------------------------------------

export async function swapMeal(
  raw: SwapMealInput,
): Promise<{ success: boolean; plan?: IMealPlan; error?: string }> {
  const parsed = SwapMealSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().formErrors[0] };
  }

  const { planId, slotId, alternativeRecipeId, userId } = parsed.data;

  try {
    await dbConnect();

    const plan = await MealPlan.findOne({
      _id: new Types.ObjectId(planId),
      userId: new Types.ObjectId(userId),
    });

    if (!plan) {
      return { success: false, error: "Meal plan not found." };
    }

    const slotIndex = plan.slots.findIndex(
      (s: IMealSlot & { _id: Types.ObjectId }) => s._id.toString() === slotId,
    );
    if (slotIndex === -1) {
      return { success: false, error: "Slot not found." };
    }

    const slot = plan.slots[slotIndex];

    // Get current recipe calories for tolerance check
    const currentRecipe = await Recipe.findById(slot.recipeId).lean<IRecipe>();
    const newRecipe =
      await Recipe.findById(alternativeRecipeId).lean<IRecipe>();

    if (!currentRecipe || !newRecipe) {
      return { success: false, error: "Recipe not found." };
    }

    const currentCalories = currentRecipe.nutrition?.caloriesPerServing ?? 0;
    const newCalories = newRecipe.nutrition?.caloriesPerServing ?? 0;

    const CALORIE_TOLERANCE = 0.1;
    const lower = currentCalories * (1 - CALORIE_TOLERANCE);
    const upper = currentCalories * (1 + CALORIE_TOLERANCE);

    if (newCalories < lower || newCalories > upper) {
      return {
        success: false,
        error: `Alternative recipe is outside the 10% calorie tolerance (${currentCalories} ± 10%).`,
      };
    }

    plan.slots[slotIndex].recipeId = new Types.ObjectId(alternativeRecipeId);
    await plan.save();

    const populated = await MealPlan.findById(plan._id)
      .populate("slots.recipeId")
      .lean();

    return {
      success: true,
      plan: serializePlan(populated) as unknown as IMealPlan,
    };
  } catch (err) {
    console.error("Error swapping meal:", err);
    return { success: false, error: "Failed to swap meal." };
  }
}

// ---------------------------------------------------------------------------
// getPlan – helper to retrieve a user's latest plan
// ---------------------------------------------------------------------------

export async function getPlan(
  userId: string,
): Promise<{ success: boolean; plan?: IMealPlan; error?: string }> {
  try {
    await dbConnect();
    const plan = await MealPlan.findOne({
      userId: new Types.ObjectId(userId),
    })
      .sort({ weekStart: -1 })
      .populate("slots.recipeId")
      .lean();

    if (!plan) {
      return { success: false, error: "No plan found." };
    }

    // Serialize all ObjectId fields to strings
    const serialized = JSON.parse(
      JSON.stringify(plan, (_key, value) =>
        value?._bsontype === "ObjectId"
          ? value.toString()
          : value instanceof Date
            ? value.toISOString()
            : value,
      ),
    );

    return { success: true, plan: serialized as unknown as IMealPlan };
  } catch (err) {
    console.error("Error fetching plan:", err);
    return { success: false, error: "Failed to fetch plan." };
  }
}

// ---------------------------------------------------------------------------
// getAlternatives – helper to fetch alternative recipes for a slot
// ---------------------------------------------------------------------------

export async function getAlternatives(
  slotId: string,
  planId: string,
  userId: string,
): Promise<{ success: boolean; alternatives?: IRecipe[]; error?: string }> {
  try {
    await dbConnect();

    const plan = await MealPlan.findOne({
      _id: new Types.ObjectId(planId),
      userId: new Types.ObjectId(userId),
    });

    if (!plan) {
      return { success: false, error: "Plan not found." };
    }

    const slot = plan.slots.find(
      (s: IMealSlot & { _id: Types.ObjectId }) => s._id.toString() === slotId,
    );
    if (!slot) {
      return { success: false, error: "Slot not found." };
    }

    const currentRecipe = await Recipe.findById(slot.recipeId).lean<IRecipe>();
    if (!currentRecipe) {
      return { success: false, error: "Current recipe not found." };
    }

    const currentCalories = currentRecipe.nutrition?.caloriesPerServing ?? 0;
    const CALORIE_TOLERANCE = 0.1;
    const lower = currentCalories * (1 - CALORIE_TOLERANCE);
    const upper = currentCalories * (1 + CALORIE_TOLERANCE);

    // Find recipes within tolerance that match the same meal type calorie profile
    const alternatives = await Recipe.find({
      _id: { $ne: slot.recipeId },
      "nutrition.caloriesPerServing": { $gte: lower, $lte: upper },
    })
      .limit(20)
      .lean<IRecipe[]>();

    return { success: true, alternatives };
  } catch (err) {
    console.error("Error fetching alternatives:", err);
    return { success: false, error: "Failed to fetch alternatives." };
  }
}
