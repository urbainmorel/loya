import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";

import { assertSafeSupabaseUrl } from "../../src/supabase-health";

const app = new Hono<{ Bindings: Oq002Bindings }>();
const uuidPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/iu;

app.use("*", secureHeaders());
app.use("*", async (context, next) => {
  await next();
  context.header("Cache-Control", "no-store");
  context.header("Pragma", "no-cache");
});

app.get("/health", (context) => context.json({ status: "ok" }));

app.get("/probe", async (context) => {
  const authorization = context.req.header("authorization");
  if (!authorization || !/^Bearer\s+\S+$/u.test(authorization)) {
    return context.json({ code: "AUTH_REQUIRED" }, 401);
  }

  const supabaseUrl = assertSafeSupabaseUrl(context.env.SUPABASE_URL);
  const authEndpoint = new URL("/auth/v1/user", supabaseUrl);
  const authResponse = await fetch(authEndpoint, {
    method: "GET",
    headers: {
      accept: "application/json",
      apikey: context.env.SUPABASE_PUBLISHABLE_KEY,
      authorization,
    },
    redirect: "error",
  });

  const authContentType = authResponse.headers.get("content-type") ?? "";
  if (
    !authResponse.ok ||
    !authContentType.toLowerCase().startsWith("application/json")
  ) {
    await authResponse.body?.cancel();
    return context.json({ code: "AUTH_REJECTED" }, 401);
  }

  const authUser: unknown = await authResponse.json();
  if (
    typeof authUser !== "object" ||
    authUser === null ||
    !("id" in authUser) ||
    typeof authUser.id !== "string" ||
    !uuidPattern.test(authUser.id)
  ) {
    return context.json({ code: "AUTH_REJECTED" }, 401);
  }

  const endpoint = new URL(
    "/rest/v1/rpc/__s0_oq002_identity_scope",
    supabaseUrl,
  );
  const upstream = await fetch(endpoint, {
    method: "POST",
    headers: {
      accept: "application/json",
      "accept-profile": "api",
      apikey: context.env.SUPABASE_PUBLISHABLE_KEY,
      authorization,
      "content-profile": "api",
      "content-type": "application/json",
    },
    body: "{}",
    redirect: "error",
  });

  const contentType = upstream.headers.get("content-type") ?? "";
  if (
    !upstream.ok ||
    !contentType.toLowerCase().startsWith("application/json")
  ) {
    await upstream.body?.cancel();
    const status =
      upstream.status === 401 || upstream.status === 403 ? 403 : 502;
    return context.json(
      { code: status === 403 ? "AUTH_REJECTED" : "SUPABASE_REJECTED" },
      status,
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    },
  });
});

app.notFound((context) => context.json({ code: "NOT_FOUND" }, 404));
app.onError((_error, context) => context.json({ code: "INTERNAL_ERROR" }, 500));

export default app;
