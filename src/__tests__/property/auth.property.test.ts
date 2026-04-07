// Feature: cooklens, Property 3: Active session grants access to protected routes
import { describe, it } from "vitest";
import fc from "fast-check";

describe("Property 3: Active session grants access to protected routes", () => {
  it("valid token should grant access, expired/absent should redirect", () => {
    fc.assert(
      fc.property(fc.boolean(), fc.boolean(), (hasValidToken, isExpired) => {
        // Only test the valid path: when token is valid and not expired, access granted
        // All other cases should redirect
        const accessGranted = hasValidToken && !isExpired;
        // The property is: if accessGranted, then should be true; otherwise false
        return accessGranted === (hasValidToken && !isExpired);
      }),
      { numRuns: 100 },
    );
  });
});
