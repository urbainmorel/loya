import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { findPrivilegedMarkers } from "../scripts/check-web-secrets.mjs";
import { redactSupabaseLog } from "../scripts/redact-supabase-log.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function getSection(source, name) {
  const startMarker = `[${name}]`;
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `section ${startMarker} absente`);

  const sectionStart = start + startMarker.length;
  const nextSection = source.slice(sectionStart).search(/\r?\n\[/u);
  return source.slice(
    sectionStart,
    nextSection === -1 ? undefined : sectionStart + nextSection,
  );
}

function getStringArray(section, key) {
  const match = section.match(
    new RegExp(`^${key}\\s*=\\s*(\\[[^\\n]+\\])$`, "mu"),
  );
  assert.ok(match, `clé ${key} absente`);
  return JSON.parse(match[1]);
}

test("la configuration locale active la Data API et déclare uniquement api", async () => {
  const config = await readFile(
    path.join(repositoryRoot, "supabase", "config.toml"),
    "utf8",
  );
  const api = getSection(config, "api");

  assert.match(api, /^enabled\s*=\s*true$/mu);
  assert.deepEqual(getStringArray(api, "schemas"), ["api"]);
  assert.doesNotMatch(config, /postgres(?:ql)?:\/\//iu);
  assert.doesNotMatch(config, /\bsbp_[a-z0-9]+\b/iu);
  assert.doesNotMatch(config, /\bsb_secret_[a-z0-9_]+\b/iu);
});

test("le client web ne contient aucun marqueur de rôle Supabase privilégié", async () => {
  const webRoot = path.join(repositoryRoot, "apps", "web");
  assert.deepEqual(await findPrivilegedMarkers(webRoot), []);
});

test("le contrôle détecte une clé privilégiée injectée", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "loya-web-secret-"));
  t.after(() => rm(root, { force: true, recursive: true }));
  await writeFile(path.join(root, "bundle.js"), 'const role = "service_role";');
  const header = Buffer.from('{"alg":"HS256","typ":"JWT"}').toString(
    "base64url",
  );
  const payload = Buffer.from('{"role":"service_role","sub":"test"}').toString(
    "base64url",
  );
  await writeFile(
    path.join(root, "legacy.js"),
    `${header}.${payload}.signature`,
  );

  assert.deepEqual(await findPrivilegedMarkers(root), [
    "bundle.js",
    "legacy.js",
  ]);
});

test("le diagnostic Supabase masque chaque famille de secret", () => {
  const source = [
    "DB URL: postgresql://postgres:local-password@127.0.0.1:54322/postgres",
    "JWT secret: raw-jwt-secret",
    "anon key: eyJheader.eyJpayload.signature",
    "service_role key: eyJheader.eyJpayload.signature",
    "Publishable key: sb_publishable_public-local",
    "Secret key: sb_secret_private-local",
    "SUPABASE_ACCESS_TOKEN=sbp_personal-local",
  ].join("\n");
  const redacted = redactSupabaseLog(source);

  for (const secret of [
    "local-password",
    "raw-jwt-secret",
    "eyJheader",
    "sb_publishable_public-local",
    "sb_secret_private-local",
    "sbp_personal-local",
  ]) {
    assert.equal(redacted.includes(secret), false);
  }
  assert.match(redacted, /postgresql:\/\/postgres:\[REDACTED\]@/u);
});
