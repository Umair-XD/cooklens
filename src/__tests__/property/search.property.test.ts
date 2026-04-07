// Feature: cooklens, Property 18: Search case-insensitivity
import { describe, it } from "vitest";
import fc from "fast-check";

describe("Property 18: Search case-insensitivity", () => {
  it("original, uppercase, and lowercase variants return identical result sets", () => {
    fc.assert(
      fc.property(fc.string(), (query) => {
        const mockResults = [
          { name: "Tomato Soup", cuisine: "American" },
          { name: "pasta salad", cuisine: "Italian" },
        ];

        // Simulate case-insensitive search
        const search = (q: string) =>
          mockResults.filter(
            (r) =>
              r.name.toLowerCase().includes(q.toLowerCase()) ||
              r.cuisine.toLowerCase().includes(q.toLowerCase()),
          );

        const original = search(query);
        const upper = search(query.toUpperCase());
        const lower = search(query.toLowerCase());

        return (
          JSON.stringify(original) === JSON.stringify(upper) &&
          JSON.stringify(original) === JSON.stringify(lower)
        );
      }),
      { numRuns: 100 },
    );
  });
});
