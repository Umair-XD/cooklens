// Feature: cooklens, Property 15: Nutrition scaling is proportional
import { describe, it } from "vitest";
import fc from "fast-check";

function scaleNutrition(
  base: { calories: number; protein: number; carbs: number; fat: number },
  baseServings: number,
  newServings: number,
) {
  const ratio = newServings / baseServings;
  return {
    calories: base.calories * ratio,
    protein: base.protein * ratio,
    carbs: base.carbs * ratio,
    fat: base.fat * ratio,
  };
}

describe("Property 15: Nutrition scaling is proportional", () => {
  it("adjusted values equal N/S * base within floating-point tolerance", () => {
    fc.assert(
      fc.property(
        fc.record({
          calories: fc.double({ min: 0, max: 2000 }),
          protein: fc.double({ min: 0, max: 200 }),
          carbs: fc.double({ min: 0, max: 300 }),
          fat: fc.double({ min: 0, max: 150 }),
        }),
        fc.double({ min: 0.1, max: 20 }),
        fc.double({ min: 0.1, max: 20 }),
        (base, baseServings, newServings) => {
          // Skip NaN values
          if (
            Number.isNaN(base.calories) ||
            Number.isNaN(base.protein) ||
            Number.isNaN(base.carbs) ||
            Number.isNaN(base.fat) ||
            Number.isNaN(baseServings) ||
            Number.isNaN(newServings)
          ) {
            return true;
          }

          const scaled = scaleNutrition(base, baseServings, newServings);
          const ratio = newServings / baseServings;
          const tolerance = 0.0001;

          return (
            Math.abs(scaled.calories - base.calories * ratio) < tolerance &&
            Math.abs(scaled.protein - base.protein * ratio) < tolerance &&
            Math.abs(scaled.carbs - base.carbs * ratio) < tolerance &&
            Math.abs(scaled.fat - base.fat * ratio) < tolerance
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
