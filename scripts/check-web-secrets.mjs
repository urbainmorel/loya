import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ignoredDirectories = new Set(["coverage", "node_modules"]);
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".map",
  ".mjs",
  ".ts",
  ".tsx",
  ".webmanifest",
]);
const privilegedMarker =
  /service[\s_-]*role|sb_secret_|\bsbp_[a-z0-9]+\b|postgres(?:ql)?:\/\//iu;
const jwtCandidate = /\beyJ[a-z0-9_-]*\.([a-z0-9_-]+)\.[a-z0-9_-]+\b/giu;

function containsPrivilegedMarker(source) {
  if (privilegedMarker.test(source)) return true;

  for (const match of source.matchAll(jwtCandidate)) {
    try {
      const claims = JSON.parse(
        Buffer.from(match[1], "base64url").toString("utf8"),
      );
      if (claims.role === "service_role") return true;
    } catch {
      // Une chaîne ressemblant à un JWT mais invalide n'est pas un secret décodable.
    }
  }

  return false;
}

export async function findPrivilegedMarkers(root) {
  const violations = [];

  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (ignoredDirectories.has(entry.name)) continue;

      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (textExtensions.has(path.extname(entry.name))) {
        const source = await readFile(entryPath, "utf8");
        if (containsPrivilegedMarker(source)) {
          violations.push(path.relative(root, entryPath).replaceAll("\\", "/"));
        }
      }
    }
  }

  await visit(root);
  return violations.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] ?? "apps/web");
  const violations = await findPrivilegedMarkers(root);

  if (violations.length > 0) {
    console.error(
      `Marqueur Supabase privilégié interdit dans le client web :\n${violations.join("\n")}`,
    );
    process.exitCode = 1;
  } else {
    console.log("Client web et bundle : aucun marqueur Supabase privilégié.");
  }
}
