import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  checkBoundaries,
  formatBoundaryDiagnostic,
} from "../scripts/check-boundaries.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const checkerPath = path.join(
  repositoryRoot,
  "scripts",
  "check-boundaries.mjs",
);

async function createFixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "loya-boundaries-"));
  t.after(() => rm(root, { force: true, recursive: true }));

  return {
    root,
    async addWorkspace(
      collection,
      name,
      dependencies = {},
      source = "export {};\n",
    ) {
      const shortName = name.replace(/^@loya\//, "");
      const directory = path.join(root, collection, shortName);
      await mkdir(path.join(directory, "src"), { recursive: true });
      await writeFile(
        path.join(directory, "package.json"),
        `${JSON.stringify({ name, private: true, dependencies }, null, 2)}\n`,
      );
      await writeFile(path.join(directory, "src", "index.ts"), source);
    },
  };
}

test("accepte une application qui importe le point d'entrée public d'un package", async (t) => {
  const fixture = await createFixture(t);
  await fixture.addWorkspace(
    "packages",
    "@loya/core",
    {},
    "export const value = 1;\n",
  );
  await fixture.addWorkspace(
    "apps",
    "@loya/web",
    { "@loya/core": "workspace:*" },
    'import { value } from "@loya/core";\nexport { value };\n',
  );

  const result = await checkBoundaries(fixture.root);
  assert.equal(
    result.ok,
    true,
    result.diagnostics.map(formatBoundaryDiagnostic).join("\n"),
  );
  assert.deepEqual(result.diagnostics, []);
});

test("refuse un deep import dans un package", async (t) => {
  const fixture = await createFixture(t);
  await fixture.addWorkspace("packages", "@loya/core");
  await fixture.addWorkspace(
    "apps",
    "@loya/web",
    { "@loya/core": "workspace:*" },
    'import { value } from "@loya/core/internal";\nexport { value };\n',
  );

  const result = await checkBoundaries(fixture.root);
  assert.equal(result.ok, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    ["DEEP_IMPORT"],
  );
  assert.equal(
    formatBoundaryDiagnostic(result.diagnostics[0]),
    "DEEP_IMPORT apps/web/src/index.ts:1 — @loya/web doit importer @loya/core sans sous-chemin (@loya/core/internal)",
  );
});

test("refuse un chemin relatif qui traverse vers packages", async (t) => {
  const fixture = await createFixture(t);
  await fixture.addWorkspace("packages", "@loya/core");
  await fixture.addWorkspace(
    "apps",
    "@loya/web",
    {},
    'import "../../../packages/core/src/index.ts";\n',
  );

  const result = await checkBoundaries(fixture.root);
  assert.equal(result.ok, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    ["CROSS_WORKSPACE_PATH"],
  );
});

test("refuse qu'un package importe une application", async (t) => {
  const fixture = await createFixture(t);
  await fixture.addWorkspace("apps", "@loya/worker");
  await fixture.addWorkspace(
    "packages",
    "@loya/core",
    {},
    'export { default as worker } from "@loya/worker";\n',
  );

  const result = await checkBoundaries(fixture.root);
  assert.equal(result.ok, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    ["PACKAGE_TO_APP"],
  );
});

test("refuse un cycle déclaré entre workspaces", async (t) => {
  const fixture = await createFixture(t);
  await fixture.addWorkspace("packages", "@loya/core", {
    "@loya/schemas": "workspace:*",
  });
  await fixture.addWorkspace("packages", "@loya/schemas", {
    "@loya/core": "workspace:*",
  });

  const result = await checkBoundaries(fixture.root);
  assert.equal(result.ok, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    ["WORKSPACE_CYCLE"],
  );
  assert.equal(
    formatBoundaryDiagnostic(result.diagnostics[0]),
    "WORKSPACE_CYCLE <workspace-graph> — @loya/core -> @loya/schemas -> @loya/core",
  );
});

test("la CLI échoue avec des diagnostics déterministes", async (t) => {
  const fixture = await createFixture(t);
  await fixture.addWorkspace("packages", "@loya/core");
  await fixture.addWorkspace(
    "apps",
    "@loya/web",
    {},
    'import "@loya/core/private";\n',
  );

  const run = spawnSync(process.execPath, [checkerPath], {
    cwd: fixture.root,
    encoding: "utf8",
  });
  assert.equal(run.status, 1);
  assert.equal(run.stdout, "");
  assert.equal(
    run.stderr.trim(),
    "DEEP_IMPORT apps/web/src/index.ts:1 — @loya/web doit importer @loya/core sans sous-chemin (@loya/core/private)",
  );
});

test("accepte le dépôt réel lorsque son arborescence applicative existe", async (t) => {
  if (
    !existsSync(path.join(repositoryRoot, "apps")) ||
    !existsSync(path.join(repositoryRoot, "packages"))
  ) {
    t.skip("le squelette apps/packages n'existe pas encore");
    return;
  }

  const result = await checkBoundaries(repositoryRoot);
  assert.equal(
    result.ok,
    true,
    result.diagnostics.map(formatBoundaryDiagnostic).join("\n"),
  );
});
