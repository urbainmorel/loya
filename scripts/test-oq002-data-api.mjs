import assert from "node:assert/strict";

const userA = "00000000-0000-4000-8000-00000000000a";
const userB = "00000000-0000-4000-8000-00000000000b";
const userWithoutScope = "00000000-0000-4000-8000-00000000000c";
const agencyA = "a0000000-0000-4000-8000-000000000001";
const agencyB = "b0000000-0000-4000-8000-000000000001";
const resourceA = "10000000-0000-4000-8000-000000000001";
const resourceB = "20000000-0000-4000-8000-000000000001";
const resourceBInAgencyA = "20000000-0000-4000-8000-000000000002";

function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variable ${name} absente.`);
  return value;
}

async function expectJson(response, label) {
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`${label} a échoué avec HTTP ${response.status}.`);
  }
  return response.json();
}

async function createMagicLinkSession(
  baseUrl,
  publishableKey,
  serviceRoleKey,
  email,
) {
  const linkResponse = await fetch(
    new URL("/auth/v1/admin/generate_link", baseUrl),
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ email, type: "magiclink" }),
    },
  );
  const link = await expectJson(
    linkResponse,
    `Génération du magic link de ${email}`,
  );
  assert.equal(link.verification_type, "magiclink");
  assert.equal(typeof link.hashed_token, "string");

  const verifyResponse = await fetch(new URL("/auth/v1/verify", baseUrl), {
    method: "POST",
    headers: {
      apikey: publishableKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      token_hash: link.hashed_token,
      type: "magiclink",
    }),
  });
  const session = await expectJson(
    verifyResponse,
    `Vérification du magic link de ${email}`,
  );
  assert.equal(typeof session.access_token, "string");
  return session.access_token;
}

async function waitForWorker(baseUrl) {
  const endpoint = new URL("/health", baseUrl);
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        await response.body?.cancel();
        return;
      }
      await response.body?.cancel();
    } catch {
      // Le processus Wrangler peut encore être en cours de démarrage.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Le Worker POC n'est pas devenu disponible.");
}

async function callProbe(baseUrl, token) {
  const response = await fetch(new URL("/probe", baseUrl), {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
  const payload = await response.json();
  return { payload, status: response.status };
}

async function waitForProbe(baseUrl, token) {
  let lastStatus = 0;
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const result = await callProbe(baseUrl, token);
    lastStatus = result.status;
    if (result.status === 200) return result;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(
    `La RPC OQ-002 n'est pas devenue disponible (dernier HTTP ${lastStatus}).`,
  );
}

async function callRpc(baseUrl, publishableKey, token, body = {}) {
  const response = await fetch(
    new URL("/rest/v1/rpc/__s0_oq002_identity_scope", baseUrl),
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "accept-profile": "api",
        apikey: publishableKey,
        authorization: `Bearer ${token}`,
        "content-profile": "api",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  return { payload: await response.json(), status: response.status };
}

function expectScope(result, subjectId, agencyIds, resourceIds) {
  assert.equal(result.status, 200);
  assert.deepEqual(result.payload, [
    {
      agency_ids: agencyIds,
      resource_ids: resourceIds,
      subject_id: subjectId,
    },
  ]);
}

function tamperSignature(token) {
  const parts = token.split(".");
  assert.equal(parts.length, 3);
  const signature = parts[2];
  assert.ok(signature);
  const replacement = signature[0] === "A" ? "B" : "A";
  return `${parts[0]}.${parts[1]}.${replacement}${signature.slice(1)}`;
}

const workerUrl = requiredEnvironment("OQ002_WORKER_URL");
const supabaseUrl = requiredEnvironment("OQ002_SUPABASE_URL");
const publishableKey = requiredEnvironment("OQ002_SUPABASE_PUBLISHABLE_KEY");
const anonKey = requiredEnvironment("OQ002_SUPABASE_ANON_KEY");
const serviceRoleKey = requiredEnvironment("OQ002_SUPABASE_SERVICE_ROLE_KEY");
const fixtures = [
  [userA, "oq002-a@example.test"],
  [userB, "oq002-b@example.test"],
  [userWithoutScope, "oq002-c@example.test"],
];

const [tokenA, tokenB, tokenWithoutScope] = await Promise.all(
  fixtures.map(([, email]) =>
    createMagicLinkSession(supabaseUrl, publishableKey, serviceRoleKey, email),
  ),
);

await waitForWorker(workerUrl);

assert.equal((await callProbe(workerUrl)).status, 401);

expectScope(
  await waitForProbe(workerUrl, tokenA),
  userA,
  [agencyA],
  [resourceA],
);

expectScope(
  await callProbe(workerUrl, tokenB),
  userB,
  [agencyA, agencyB],
  [resourceB, resourceBInAgencyA],
);

expectScope(
  await callProbe(workerUrl, tokenWithoutScope),
  userWithoutScope,
  [],
  [],
);

assert.equal((await callProbe(workerUrl, anonKey)).status, 401);

assert.equal((await callProbe(workerUrl, tamperSignature(tokenA))).status, 401);

const privateResponse = await fetch(
  new URL("/rest/v1/__s0_oq002_scope", supabaseUrl),
  {
    headers: {
      "accept-profile": "private",
      apikey: publishableKey,
      authorization: `Bearer ${tokenA}`,
    },
  },
);
assert.equal(privateResponse.status, 406);
const privateError = await privateResponse.json();
assert.equal(privateError.code, "PGRST106");

expectScope(
  await callRpc(supabaseUrl, publishableKey, tokenA),
  userA,
  [agencyA],
  [resourceA],
);

const substitutionAttempt = await callRpc(supabaseUrl, publishableKey, tokenA, {
  subject_id: userB,
});
assert.equal(substitutionAttempt.status, 404);
assert.equal(substitutionAttempt.payload.code, "PGRST202");

console.log(
  "POC OQ-002 borné : chaîne de lecture conforme ; limite confirmée — " +
    "la RPC reste directement appelable et OQ-002 demeure ouverte.",
);
