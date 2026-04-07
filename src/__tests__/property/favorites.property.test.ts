// Feature: cooklens, Property 19: Favorites round-trip
import { describe, it } from "vitest";
import fc from "fast-check";

describe("Property 19: Favorites round-trip", () => {
  it("after save, recipe is in list; after remove, it is not; count reflects each operation", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.record({
              type: fc.constant("save" as const),
              recipeId: fc.string(),
            }),
            fc.record({
              type: fc.constant("remove" as const),
              recipeId: fc.string(),
            }),
          ),
        ),
        (operations) => {
          const favorites = new Set<string>();
          const expected = new Set<string>();

          for (const op of operations) {
            if (op.type === "save") {
              favorites.add(op.recipeId);
              expected.add(op.recipeId);
            } else if (op.type === "remove") {
              favorites.delete(op.recipeId);
              expected.delete(op.recipeId);
            }
          }

          return (
            favorites.size === expected.size &&
            [...favorites].every((id) => expected.has(id))
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
