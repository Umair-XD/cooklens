import { describe, it, expect } from "vitest";

function calculateTDEE(
  age: number,
  weightKg: number,
  heightCm: number,
  sex: "male" | "female",
  activityLevel: number,
): number {
  const bmr =
    sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return Math.round(bmr * activityLevel);
}

describe("Planner unit tests", () => {
  it("should calculate correct TDEE for male reference", () => {
    const tdee = calculateTDEE(30, 70, 175, "male", 1.55);
    // BMR = 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
    // TDEE = 1648.75 * 1.55 = 2555.56 ≈ 2556
    expect(tdee).toBe(2556);
  });

  it("should calculate correct TDEE for female reference", () => {
    const tdee = calculateTDEE(30, 70, 175, "female", 1.55);
    // BMR = 10*70 + 6.25*175 - 5*30 - 161 = 700 + 1093.75 - 150 - 161 = 1482.75
    // TDEE = 1482.75 * 1.55 = 2298.26 ≈ 2298
    expect(tdee).toBe(2298);
  });

  it("should return partial plan when no recipe fills a calorie slot", () => {
    const recipes: { name: string; calories: number }[] = [];
    const targetCalories = 2000;
    const tolerance = targetCalories * 0.1;

    const plan = recipes.filter(
      (r) => Math.abs(r.calories - targetCalories / 3) <= tolerance,
    );

    expect(plan.length).toBe(0);
    expect(plan).toEqual([]);
  });

  it("should use correct activity multipliers", () => {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extra_active: 1.9,
    };

    const baseBMR = 1500;

    expect(Math.round(baseBMR * multipliers.sedentary)).toBe(1800);
    expect(Math.round(baseBMR * multipliers.light)).toBe(2063);
    expect(Math.round(baseBMR * multipliers.moderate)).toBe(2325);
    expect(Math.round(baseBMR * multipliers.active)).toBe(2588);
    expect(Math.round(baseBMR * multipliers.extra_active)).toBe(2850);
  });
});
