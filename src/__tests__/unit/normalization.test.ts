import { describe, it, expect } from "vitest";

const aliasMap = new Map<string, string>([
  ["tomato", "tomato"],
  ["tomatoes", "tomato"],
  ["potato", "potato"],
  ["potatoes", "potato"],
  ["onion", "onion"],
  ["onions", "onion"],
]);

function normalizeIngredient(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "unrecognized";
  return aliasMap.get(trimmed.toLowerCase()) || "unrecognized";
}

describe("Ingredient normalization unit tests", () => {
  it("should map known aliases to canonical form", () => {
    expect(normalizeIngredient("tomatoes")).toBe("tomato");
    expect(normalizeIngredient("potatoes")).toBe("potato");
    expect(normalizeIngredient("onions")).toBe("onion");
    expect(normalizeIngredient("tomato")).toBe("tomato");
  });

  it("should handle case-insensitive matching", () => {
    expect(normalizeIngredient("TOMATOES")).toBe("tomato");
    expect(normalizeIngredient("Tomato")).toBe("tomato");
    expect(normalizeIngredient("POTATOES")).toBe("potato");
  });

  it("should return unrecognized for unknown ingredients", () => {
    expect(normalizeIngredient("dragonfruit")).toBe("unrecognized");
    expect(normalizeIngredient("xyz123")).toBe("unrecognized");
  });

  it("should handle empty string", () => {
    expect(normalizeIngredient("")).toBe("unrecognized");
  });

  it("should handle whitespace-only input", () => {
    expect(normalizeIngredient("   ")).toBe("unrecognized");
    expect(normalizeIngredient("\t\n")).toBe("unrecognized");
  });

  it("should trim whitespace around valid inputs", () => {
    expect(normalizeIngredient("  tomatoes  ")).toBe("tomato");
    expect(normalizeIngredient("\tpotato\n")).toBe("potato");
  });
});
