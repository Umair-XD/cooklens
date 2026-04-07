import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

export const TDEESchema = z.object({
  age: z.number().min(1, "Age must be positive").max(120),
  weightKg: z.number().min(1, "Weight must be positive").max(500),
  heightCm: z.number().min(50, "Height must be positive").max(300),
  sex: z.enum(["male", "female"]),
  activityLevel: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extra_active",
  ]),
});

export type TDEEInput = z.infer<typeof TDEESchema>;

export const PlanGoalSchema = z.enum([
  "lose_weight",
  "maintain",
  "gain_weight",
]);

export type PlanGoal = z.infer<typeof PlanGoalSchema>;

export const GeneratePlanSchema = z.object({
  age: z.number().min(1).max(120),
  weightKg: z.number().min(1).max(500),
  heightCm: z.number().min(50).max(300),
  sex: z.enum(["male", "female"]),
  activityLevel: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extra_active",
  ]),
  goal: PlanGoalSchema,
  userId: z.string().min(1),
});

export type GeneratePlanInput = z.infer<typeof GeneratePlanSchema>;

export const SwapMealSchema = z.object({
  planId: z.string().min(1),
  slotId: z.string().min(1),
  alternativeRecipeId: z.string().min(1),
  userId: z.string().min(1),
});

export type SwapMealInput = z.infer<typeof SwapMealSchema>;

// ---------------------------------------------------------------------------
// Helper: adjust target calories based on goal
// ---------------------------------------------------------------------------

export function goalCalorieAdjustment(tdee: number, goal: PlanGoal): number {
  switch (goal) {
    case "lose_weight":
      return tdee - 500;
    case "gain_weight":
      return tdee + 500;
    default:
      return tdee;
  }
}
