/**
 * Activity level multipliers for TDEE calculation
 */
export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra_active: 1.9,
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor
 * equation multiplied by an activity-level multiplier.
 *
 *   BMR (male)   = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
 *   BMR (female) = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
 *   TDEE         = BMR * activityMultiplier
 */
export function calculateTDEE(
  age: number,
  weightKg: number,
  heightCm: number,
  sex: "male" | "female",
  activityLevel: string,
): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;

  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr += sex === "male" ? 5 : -161;

  return Math.round(bmr * multiplier);
}
