import { healthResponseSchema } from "@loya/schemas";
import {
  createExecutionContext,
  waitOnExecutionContext,
} from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";

import worker from "../src";
import { probeSupabaseHealth } from "../src/supabase-health";

describe("Loya Worker", () => {
  afterEach(() => vi.restoreAllMocks());

  it("répond depuis le runtime Workers avec des en-têtes sans cache", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const context = createExecutionContext();
    const response = await worker.fetch(
      new Request("https://loya.test/v1/health", {
        headers: { "X-Request-Id": "valeur-client-non-fiable" },
      }),
      { ENVIRONMENT: "s0-poc" },
      context,
    );
    await waitOnExecutionContext(context);

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const payload = healthResponseSchema.parse(await response.json());
    expect(payload).toMatchObject({
      status: "ok",
      service: "loya-worker",
      version: "s0-poc",
    });
    expect(payload.correlationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(response.headers.get("x-request-id")).toBe(payload.correlationId);
    expect(payload.correlationId).not.toBe("valeur-client-non-fiable");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");

    const event = log.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(event).toMatchObject({
      event: "http_request_completed",
      environment: "s0-poc",
      service: "loya-worker",
      route: "/v1/health",
      method: "GET",
      status: 200,
      correlationId: payload.correlationId,
    });
    expect(event).not.toHaveProperty("authorization");
  });

  it.each(["/v1", "/v1/route-inexistante"])(
    "retourne une erreur API JSON sans fallback SPA pour %s",
    async (path) => {
      vi.spyOn(console, "log").mockImplementation(() => undefined);
      const context = createExecutionContext();
      const response = await worker.fetch(
        new Request(`https://loya.test${path}`),
        { ENVIRONMENT: "s0-poc" },
        context,
      );
      await waitOnExecutionContext(context);

      expect(response.status).toBe(404);
      expect(response.headers.get("content-type")).toContain(
        "application/json",
      );
      const payload = (await response.json()) as Record<string, unknown>;
      expect(payload).toMatchObject({
        code: "NOT_FOUND",
        message: "Ressource introuvable",
      });
      expect(payload.correlationId).toBe(response.headers.get("x-request-id"));
    },
  );

  it("prépare la sonde Supabase sans exposer la clé", async () => {
    const outboundFetch = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        Response.json({ version: "ok" }),
    );

    await expect(
      probeSupabaseHealth(
        {
          SUPABASE_URL: "https://example.supabase.co",
          SUPABASE_PUBLISHABLE_KEY: "public-test-key",
        },
        outboundFetch,
      ),
    ).resolves.toBe(true);

    const [input, init] = outboundFetch.mock.calls[0] ?? [];
    expect(String(input)).toBe("https://example.supabase.co/auth/v1/health");
    expect(new Headers(init?.headers).get("apikey")).toBe("public-test-key");
    expect(init?.redirect).toBe("manual");
  });

  it("refuse HTTP pour une cible Supabase distante", async () => {
    await expect(
      probeSupabaseHealth(
        {
          SUPABASE_URL: "http://example.supabase.co",
          SUPABASE_PUBLISHABLE_KEY: "public-test-key",
        },
        vi.fn(async () => {
          throw new Error("ne doit pas être appelée");
        }),
      ),
    ).rejects.toThrow("non autorisée");
  });

  it("refuse une cible HTTPS hors Supabase", async () => {
    await expect(
      probeSupabaseHealth(
        {
          SUPABASE_URL: "https://example.com",
          SUPABASE_PUBLISHABLE_KEY: "public-test-key",
        },
        vi.fn(async () => {
          throw new Error("ne doit pas être appelée");
        }),
      ),
    ).rejects.toThrow("non autorisée");
  });

  it("refuse un protocole non HTTP même en local", async () => {
    await expect(
      probeSupabaseHealth(
        {
          SUPABASE_URL: "ftp://localhost",
          SUPABASE_PUBLISHABLE_KEY: "public-test-key",
        },
        vi.fn(async () => {
          throw new Error("ne doit pas être appelée");
        }),
      ),
    ).rejects.toThrow("non autorisée");
  });
});
