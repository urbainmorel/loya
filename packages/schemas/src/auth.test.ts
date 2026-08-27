import { describe, expect, it } from "vitest";

import { AUTH_INTENTS, authIntentSchema } from "./auth";

describe("authIntentSchema", () => {
  it("accepte uniquement les trois intentions publiques", () => {
    expect(AUTH_INTENTS).toEqual(["AGENCY", "TENANT", "OWNER"]);

    for (const intent of AUTH_INTENTS) {
      expect(authIntentSchema.parse(intent)).toBe(intent);
    }

    for (const forbiddenValue of ["PLATFORM", "ADMIN", "", null]) {
      expect(authIntentSchema.safeParse(forbiddenValue).success).toBe(false);
    }
  });
});
