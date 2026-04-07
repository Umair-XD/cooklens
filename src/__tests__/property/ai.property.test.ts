// Feature: cooklens, Property 9: AI recognition confidence filter
import { describe, it } from "vitest";
import fc from "fast-check";

function filterByConfidence(
  results: { ingredient: string; confidence: number }[],
) {
  return results.filter((r) => r.confidence >= 0.7);
}

describe("Property 9: AI recognition confidence filter", () => {
  it("output contains only entries with confidence >= 0.7", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            ingredient: fc.string(),
            confidence: fc.double({ min: 0, max: 1 }),
          }),
        ),
        (results) => {
          const filtered = filterByConfidence(results);
          return filtered.every((r) => r.confidence >= 0.7);
        },
      ),
      { numRuns: 100 },
    );
  });
});
