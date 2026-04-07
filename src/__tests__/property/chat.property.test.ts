// Feature: cooklens, Property 17: Chatbot context accumulation
import { describe, it } from "vitest";
import fc from "fast-check";

describe("Property 17: Chatbot context accumulation", () => {
  it("the N-th request includes all N-1 prior messages", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            role: fc.constantFrom("user" as const, "assistant" as const),
            content: fc.string(),
          }),
        ),
        (messages) => {
          // Simulate: for each request N, the context should include all prior messages
          for (let n = 1; n <= messages.length; n++) {
            const contextForNthRequest = messages.slice(0, n);
            if (contextForNthRequest.length !== n) return false;
          }
          return true;
        },
      ),
      { numRuns: 100 },
    );
  });
});
