import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { findScopeViolations } from "../scripts/check-scope.mjs";

test("le contrôle accepte un socle conforme", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "loya-scope-ok-"));
  await writeFile(path.join(root, "package.json"), '{"dependencies":{"hono":"1.0.0"}}');
  assert.deepEqual(await findScopeViolations(root), []);
});

test("le contrôle accepte la stack cible et ignore les exemples de docs/tests", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "loya-scope-stack-ok-"));
  await mkdir(path.join(root, "apps", "web", "docs"), { recursive: true });
  await mkdir(path.join(root, "apps", "web", "tests"), { recursive: true });
  await mkdir(path.join(root, "apps", "worker"), { recursive: true });
  await writeFile(
    path.join(root, "apps", "web", "package.json"),
    JSON.stringify({
      dependencies: { react: "1.0.0", "@supabase/supabase-js": "1.0.0" },
      devDependencies: { vite: "1.0.0" },
    }),
  );
  await writeFile(
    path.join(root, "apps", "worker", "package.json"),
    JSON.stringify({ dependencies: { hono: "1.0.0" }, devDependencies: { wrangler: "1.0.0" } }),
  );
  await writeFile(path.join(root, "apps", "web", "docs", "excluded.ts"), "class OwnerPayout {}");
  await writeFile(
    path.join(root, "apps", "web", "tests", "scope.test.ts"),
    "class MaintenanceRequest {}",
  );
  assert.deepEqual(await findScopeViolations(root), []);
});

const excludedFeatures = [
  ["paiement partiel", "class PaymentInstallment {}", /paiement partiel/],
  ["contrat", "class LeaseContract {}", /contrat/],
  ["état des lieux", "class PropertyInspection {}", /état des lieux/],
  ["maintenance", "class MaintenanceRequest {}", /maintenance/],
  ["ticket interne", "class SupportTicket {}", /ticket/],
  ["BI", "class AdvancedReport {}", /rapport avancé/],
  ["import", "class DataImport {}", /import/],
  ["export propriétaire", "function exportOwnerCsv() {}", /export CSV/],
  ["remboursement fournisseur", "function initiateRefund() {}", /remboursement fournisseur/],
  ["balance FedaPay", "class FedaPayBalance {}", /balance/],
  ["reversement propriétaire", "class OwnerPayout {}", /reversement/],
  ["cantonnement", "class RentEscrow {}", /cantonnement/],
  ["IA visible", "class AiAssistant {}", /IA visible/],
  ["auth locale", "const signInWithPassword = () => {};", /mot de passe local/],
  ["identité maison", "class OtpChallenge {}", /applicatif parallèle/],
  ["serveur Node", 'import { createServer } from "node:http";', /serveur Node/],
  ["D1", "type Env = { DB: D1Database };", /D1/],
];

test("le contrôle refuse chaque fonctionnalité explicitement exclue", async (t) => {
  for (const [name, source, expected] of excludedFeatures) {
    await t.test(name, async () => {
      const root = await mkdtemp(path.join(tmpdir(), "loya-scope-feature-ko-"));
      await mkdir(path.join(root, "packages", "core"), { recursive: true });
      await writeFile(path.join(root, "packages", "core", "excluded.ts"), source);
      const violations = await findScopeViolations(root);
      assert.equal(violations.length, 1);
      assert.match(violations[0], expected);
    });
  }
});

test("le contrôle refuse les substitutions de stack dans les manifests produit", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "loya-scope-stack-ko-"));
  await mkdir(path.join(root, "apps", "web"), { recursive: true });
  await mkdir(path.join(root, "apps", "worker"), { recursive: true });
  await writeFile(
    path.join(root, "apps", "web", "package.json"),
    JSON.stringify({ dependencies: { next: "1.0.0", "react-native": "1.0.0" } }),
  );
  await writeFile(
    path.join(root, "apps", "worker", "package.json"),
    JSON.stringify({
      dependencies: {
        fastify: "1.0.0",
        redis: "1.0.0",
        bullmq: "1.0.0",
        "@hono/node-server": "1.0.0",
      },
    }),
  );
  await writeFile(path.join(root, "apps", "worker", "wrangler.toml"), "[[d1_databases]]\nbinding = 'DB'\n");

  const result = (await findScopeViolations(root)).join("\n");
  for (const expected of [
    /dépendance interdite next/,
    /dépendance interdite react-native/,
    /dépendance interdite fastify/,
    /dépendance interdite redis/,
    /dépendance interdite bullmq/,
    /dépendance interdite @hono\/node-server/,
    /binding D1 interdit/,
    /apps\/web\/package.json: dépendance de stack requise absente react/,
    /apps\/web\/package.json: dépendance de stack requise absente vite/,
    /apps\/worker\/package.json: dépendance de stack requise absente hono/,
    /apps\/worker\/package.json: dépendance de stack requise absente wrangler/,
    /dépendance de stack requise absente @supabase\/supabase-js/,
  ]) {
    assert.match(result, expected);
  }
});
