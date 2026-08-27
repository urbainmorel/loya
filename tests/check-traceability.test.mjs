import assert from "node:assert/strict";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";
import {
  DOCUMENTS,
  MATRIX_PATH,
  verifyTraceability,
} from "../scripts/check-traceability.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(root, "scripts", "check-traceability.mjs");

async function copyNormativeSet(target) {
  await Promise.all(
    Object.values(DOCUMENTS).map((filename) =>
      copyFile(path.join(root, filename), path.join(target, filename)),
    ),
  );
}

test("les références normatives et la matrice sont cohérentes", async () => {
  const result = await verifyTraceability();

  assert.deepEqual(result.errors, []);
  assert.equal(result.matrixStatus, "à jour");
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(result.definitions.requirements).map(([family, ids]) => [
        family,
        ids.length,
      ]),
    ),
    { OBJ: 9, FR: 48, BR: 35, AC: 15, NFR: 16 },
  );
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(result.definitions.screens).map(([family, ids]) => [
        family,
        ids.length,
      ]),
    ),
    { X: 6, L: 8, A: 17, O: 4, S: 6, N: 2 },
  );
  assert.equal(result.matrix.requirements.length, 123);
  assert.equal(result.matrix.tasks.length, 54);
});

test("une référence orpheline est signalée", async (context) => {
  const target = await mkdtemp(
    path.join(tmpdir(), "loya-traceability-orphan-"),
  );
  context.after(() => rm(target, { recursive: true, force: true }));
  await copyNormativeSet(target);
  await mkdir(path.join(target, path.dirname(MATRIX_PATH)), {
    recursive: true,
  });
  await copyFile(path.join(root, MATRIX_PATH), path.join(target, MATRIX_PATH));
  await writeFile(
    path.join(target, DOCUMENTS.STI),
    `${await readFile(path.join(target, DOCUMENTS.STI), "utf8")}\nRéférence invalide: \`FR-999\`.\n`,
    "utf8",
  );

  const result = await verifyTraceability(target);
  assert.ok(
    result.errors.includes(
      "Exigence orpheline dans STI: FR-999 (définition attendue dans le PRD)",
    ),
  );
  const command = spawnSync(process.execPath, [script, "--root", target], {
    encoding: "utf8",
  });
  assert.equal(command.status, 1);
  assert.match(command.stderr, /Exigence orpheline dans STI: FR-999/);
});

test("la matrice est reproductible et sa dérive rend la commande non nulle", async (context) => {
  const target = await mkdtemp(
    path.join(tmpdir(), "loya-traceability-matrix-"),
  );
  context.after(() => rm(target, { recursive: true, force: true }));
  await copyNormativeSet(target);

  const generated = await verifyTraceability(target, { writeMatrix: true });
  assert.deepEqual(generated.errors, []);
  assert.equal(generated.matrixStatus, "écrite");
  assert.equal((await verifyTraceability(target)).matrixStatus, "à jour");

  await writeFile(path.join(target, MATRIX_PATH), "{}\n", "utf8");
  const command = spawnSync(process.execPath, [script, "--root", target], {
    encoding: "utf8",
  });
  assert.equal(command.status, 1);
  assert.match(command.stderr, /Matrice de traçabilité en dérive/);
});
