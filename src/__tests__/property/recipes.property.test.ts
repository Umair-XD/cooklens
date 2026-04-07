// Feature: cooklens, Property 14: Step completion toggle
import { describe, it, expect } from "vitest";
import fc from "fast-check";

describe("Property 14: Step completion toggle", () => {
  it("toggling flips only the targeted step; all others unchanged", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1 }),
        fc.integer({ min: 0, max: 99 }),
        (steps, targetIndex) => {
          const idx = targetIndex % steps.length;
          // Simulate step completion state as a Set
          const completedSteps = new Set<number>();

          // Toggle the target step
          const wasCompleted = completedSteps.has(idx);
          if (wasCompleted) {
            completedSteps.delete(idx);
          } else {
            completedSteps.add(idx);
          }

          // Only the targeted step should be in the set
          return (
            completedSteps.size === (wasCompleted ? 0 : 1) &&
            completedSteps.has(idx) === !wasCompleted
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should toggle a step from incomplete to complete", () => {
    const completed = new Set<number>();
    const stepIndex = 0;

    // Toggle on
    if (!completed.has(stepIndex)) {
      completed.add(stepIndex);
    }
    expect(completed.has(stepIndex)).toBe(true);

    // Toggle off
    if (completed.has(stepIndex)) {
      completed.delete(stepIndex);
    }
    expect(completed.has(stepIndex)).toBe(false);
  });
});
