import { describe, expect, it } from "vitest";

import { healthResponseSchema } from "./health";

describe("healthResponseSchema", () => {
  it("accepte uniquement la réponse de santé attendue", () => {
    expect(
      healthResponseSchema.parse({
        status: "ok",
        service: "loya-worker",
        version: "s0-poc",
        correlationId: "019c2340-7c77-7000-8000-000000000001",
      }),
    ).toEqual({
      status: "ok",
      service: "loya-worker",
      version: "s0-poc",
      correlationId: "019c2340-7c77-7000-8000-000000000001",
    });

    expect(() =>
      healthResponseSchema.parse({
        status: "ok",
        service: "loya-worker",
        version: "s0-poc",
        correlationId: "019c2340-7c77-7000-8000-000000000001",
        secret: "interdit",
      }),
    ).toThrow();
  });
});
