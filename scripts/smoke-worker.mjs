import assert from "node:assert/strict";

const value = process.argv[2];

if (!value) {
  throw new Error("Usage: node scripts/smoke-worker.mjs <base-url>");
}

const baseUrl = new URL(value);
assert.ok(
  baseUrl.protocol === "http:" || baseUrl.protocol === "https:",
  "La base du smoke test doit utiliser HTTP(S)",
);

async function read(path, init) {
  const response = await fetch(new URL(path, baseUrl), init);
  return { body: await response.text(), response };
}

const root = await read("/");
assert.equal(root.response.status, 200);
assert.match(root.response.headers.get("content-type") ?? "", /^text\/html/);
assert.match(
  root.response.headers.get("content-security-policy") ?? "",
  /default-src 'self'/,
);

const spaRoute = await read("/preuve-spa");
assert.equal(spaRoute.response.status, 200);
assert.match(
  spaRoute.response.headers.get("content-type") ?? "",
  /^text\/html/,
);

for (const path of ["/v1", "/v1/route-inexistante"]) {
  const result = await read(path);
  assert.equal(result.response.status, 404, path);
  assert.match(
    result.response.headers.get("content-type") ?? "",
    /^application\/json/,
  );
  const payload = JSON.parse(result.body);
  assert.equal(payload.code, "NOT_FOUND");
  assert.equal(
    payload.correlationId,
    result.response.headers.get("x-request-id"),
  );
}

const health = await read("/v1/health", {
  headers: { "X-Request-Id": "client-controlled" },
});
assert.equal(health.response.status, 200);
assert.match(
  health.response.headers.get("content-type") ?? "",
  /^application\/json/,
);
assert.equal(health.response.headers.get("cache-control"), "no-store");
const healthPayload = JSON.parse(health.body);
assert.match(
  healthPayload.correlationId,
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
);
assert.notEqual(healthPayload.correlationId, "client-controlled");
assert.equal(
  healthPayload.correlationId,
  health.response.headers.get("x-request-id"),
);

console.log("Smoke Worker: Static Assets, SPA et API conformes.");
