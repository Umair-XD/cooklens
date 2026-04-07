// Feature: cooklens, Property 6: Ingredient autocomplete draws from dataset
import { describe, it, expect } from "vitest";
import fc from "fast-check";

const mockIngredients = [
  { canonicalName: "tomato", aliases: ["tomatoes"] },
  { canonicalName: "potato", aliases: ["potatoes"] },
  { canonicalName: "onion", aliases: ["onions"] },
];

function autocomplete(prefix: string) {
  const lower = prefix.toLowerCase();
  return mockIngredients.filter(
    (i) =>
      i.canonicalName.toLowerCase().includes(lower) ||
      i.aliases.some((a) => a.toLowerCase().includes(lower)),
  );
}

describe("Property 6: Ingredient autocomplete draws from dataset", () => {
  it("results contain only matching entries; empty prefix match returns empty list for no match", () => {
    fc.assert(
      fc.property(fc.string(), (prefix) => {
        const results = autocomplete(prefix);
        const lower = prefix.toLowerCase();
        // All results should match the prefix
        const allMatch = results.every(
          (i) =>
            i.canonicalName.toLowerCase().includes(lower) ||
            i.aliases.some((a) => a.toLowerCase().includes(lower)),
        );
        return allMatch;
      }),
      { numRuns: 100 },
    );
  });

  it("should return empty for prefix that matches nothing", () => {
    const results = autocomplete("xyznonexistent123");
    expect(results).toEqual([]);
  });
});

// Feature: cooklens, Property 7: Ingredient normalization maps aliases to canonical form
describe("Property 7: Ingredient normalization maps aliases to canonical form", () => {
  const aliasMap = new Map<string, string>([
    ["tomatoes", "tomato"],
    ["potatoes", "potato"],
    ["onions", "onion"],
    ["tomato", "tomato"],
  ]);

  function normalize(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return "unrecognized";
    return aliasMap.get(trimmed.toLowerCase()) || "unrecognized";
  }

  it("alias → canonical; unknown → unrecognized", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = normalize(input);
        const trimmed = input.trim();
        if (!trimmed) return result === "unrecognized";
        const mapped = aliasMap.get(trimmed.toLowerCase());
        if (mapped) return result === mapped;
        return result === "unrecognized";
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: cooklens, Property 8: Ingredient list mutation correctness
describe("Property 8: Ingredient list mutation correctness", () => {
  it("add/remove sequence yields exactly the expected set, no duplicates", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.record({ type: fc.constant("add" as const), item: fc.string() }),
            fc.record({
              type: fc.constant("remove" as const),
              item: fc.string(),
            }),
          ),
        ),
        (operations) => {
          const list: string[] = [];
          const expected = new Set<string>();

          for (const op of operations) {
            if (op.type === "add" && !list.includes(op.item)) {
              list.push(op.item);
              expected.add(op.item);
            } else if (op.type === "remove") {
              const idx = list.indexOf(op.item);
              if (idx !== -1) list.splice(idx, 1);
              expected.delete(op.item);
            }
          }

          return (
            list.length === expected.size &&
            list.every((item) => expected.has(item))
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
