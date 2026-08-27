import { healthResponseSchema } from "@loya/schemas";
import { Hono } from "hono";
import type { RequestIdVariables } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";

export const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: RequestIdVariables;
}>();

app.use("*", async (context, next) => {
  const correlationId = crypto.randomUUID();
  context.set("requestId", correlationId);
  await next();
  context.header("X-Request-Id", correlationId);
});
app.use("*", secureHeaders());
app.use("*", async (context, next) => {
  const startedAt = performance.now();
  await next();
  context.header("Cache-Control", "no-store");
  context.header("Pragma", "no-cache");

  console.log({
    event: "http_request_completed",
    environment: context.env.ENVIRONMENT,
    service: "loya-worker",
    route: context.req.path === "/v1/health" ? "/v1/health" : "/v1/*",
    method: context.req.method,
    status: context.res.status,
    durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
    correlationId: context.get("requestId"),
  });
});

app.get("/v1/health", (context) => {
  const payload = healthResponseSchema.parse({
    status: "ok",
    service: "loya-worker",
    version: "s0-poc",
    correlationId: context.get("requestId"),
  });

  return context.json(payload, 200);
});

app.notFound((context) =>
  context.json(
    {
      code: "NOT_FOUND",
      message: "Ressource introuvable",
      correlationId: context.get("requestId"),
    },
    404,
  ),
);

app.onError((_error, context) => {
  console.error({
    event: "http_request_failed",
    environment: context.env.ENVIRONMENT,
    service: "loya-worker",
    route: context.req.path === "/v1/health" ? "/v1/health" : "/v1/*",
    status: 500,
    correlationId: context.get("requestId"),
  });
  return context.json(
    {
      code: "INTERNAL_ERROR",
      message: "Erreur interne",
      correlationId: context.get("requestId"),
    },
    500,
  );
});

export default app;
