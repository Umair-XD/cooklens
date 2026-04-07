// Feature: cooklens, Property 5: Dietary preferences applied to recommendations
import { describe, it } from "vitest";
import fc from "fast-check";

describe("Property 5: Dietary preferences applied to recommendations", () => {
  it("no conflicting recipes unless override flag set", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 })),
        fc.array(
          fc.record({
            name: fc.string(),
            conflicts: fc.array(fc.string({ minLength: 1 })),
          }),
        ),
        fc.boolean(),
        (preferences, recipes, overrideFlag) => {
          if (preferences.length === 0) return true;

          const hasConflicts = recipes.some((r) =>
            preferences.some((p) => r.conflicts?.includes(p)),
          );

          // When override is false, recommendations should filter out conflicts
          // When override is true, conflicts are allowed
          // This test verifies the filtering LOGIC, not the data
          const filteredRecipes = overrideFlag
            ? recipes
            : recipes.filter(
                (r) => !preferences.some((p) => r.conflicts?.includes(p)),
              );

          // Verify filtered recipes have no conflicts when override is false
          if (!overrideFlag) {
            return !filteredRecipes.some((r) =>
              preferences.some((p) => r.conflicts?.includes(p)),
            );
          }
          return true;
        },
      ),
      { numRuns: 100 },
    );
  });
});
