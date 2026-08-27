import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export function redactSupabaseLog(source) {
  return source
    .replace(/(postgres(?:ql)?:\/\/[^:\s/]+:)[^@\s]+@/giu, "$1[REDACTED]@")
    .replace(
      /\beyJ[a-z0-9_-]*\.[a-z0-9_-]+\.[a-z0-9_-]+\b/giu,
      "[REDACTED_JWT]",
    )
    .replace(
      /\bsb_(?:publishable|secret)_[a-z0-9_-]+\b|\bsbp_[a-z0-9_-]+\b/giu,
      "[REDACTED]",
    )
    .replace(
      /^(\s*(?:JWT secret|anon key|service_role key|Publishable key|Secret key|S3 Access Key|S3 Secret Key|SUPABASE_[A-Z0-9_]*(?:KEY|PASSWORD|SECRET|TOKEN))\s*[:=]\s*).*$/gimu,
      "$1[REDACTED]",
    );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const logPath = process.argv[2];
  if (!logPath) throw new Error("Chemin du journal Supabase manquant.");
  process.stdout.write(redactSupabaseLog(await readFile(logPath, "utf8")));
}
