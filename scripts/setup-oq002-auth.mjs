import assert from "node:assert/strict";

const fixtures = [
  ["00000000-0000-4000-8000-00000000000a", "oq002-a@example.test"],
  ["00000000-0000-4000-8000-00000000000b", "oq002-b@example.test"],
  ["00000000-0000-4000-8000-00000000000c", "oq002-c@example.test"],
];

function requiredEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variable ${name} absente.`);
  return value;
}

async function createUser(baseUrl, serviceRoleKey, id, email) {
  const response = await fetch(new URL("/auth/v1/admin/users", baseUrl), {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email,
      email_confirm: true,
      id,
    }),
  });

  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Création GoTrue de ${email}: HTTP ${response.status}.`);
  }
  const user = await response.json();
  assert.equal(user.id, id);
}

const supabaseUrl = requiredEnvironment("OQ002_SUPABASE_URL");
const serviceRoleKey = requiredEnvironment("OQ002_SUPABASE_SERVICE_ROLE_KEY");

await Promise.all(
  fixtures.map(([id, email]) =>
    createUser(supabaseUrl, serviceRoleKey, id, email),
  ),
);

console.log("Fixtures Auth OQ-002 créées via l'API Admin locale.");
