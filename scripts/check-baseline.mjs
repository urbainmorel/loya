import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function verifyBaseline(projectRoot = root) {
  const manifest = JSON.parse(
    await readFile(path.join(projectRoot, "docs", "normative-manifest.json"), "utf8"),
  );
  const failures = [];

  for (const [relativePath, expected] of Object.entries(manifest.files)) {
    const contents = await readFile(path.join(projectRoot, relativePath));
    const actual = createHash(manifest.algorithm).update(contents).digest("hex");
    if (actual !== expected) failures.push(`${relativePath}: ${actual} != ${expected}`);
  }

  return failures;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = await verifyBaseline();
  if (failures.length > 0) {
    console.error(`Baseline normative modifiée:\n${failures.join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log("Baseline normative: 5/5 empreintes valides.");
  }
}
