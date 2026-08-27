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
      /((?:JWT_SECRET|ANON_KEY|SERVICE_ROLE_KEY|PUBLISHABLE_KEY|SECRET_KEY|SUPABASE_[A-Z0-9_]*(?:KEY|PASSWORD|SECRET|TOKEN)|apikey|authorization)["']?\s*[:=]\s*(?:Bearer\s+)?["']?)[^"',\s}\]]+/giu,
      "$1[REDACTED]",
    )
    .replace(
      /^(\s*(?:JWT secret|anon key|service_role key|Publishable key|Secret key|S3 Access Key|S3 Secret Key|JWT_SECRET|ANON_KEY|SERVICE_ROLE_KEY|PUBLISHABLE_KEY|SECRET_KEY|SUPABASE_[A-Z0-9_]*(?:KEY|PASSWORD|SECRET|TOKEN)|apikey)\s*[:=]\s*).*$/gimu,
      "$1[REDACTED]",
    );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const logPath = process.argv[2];
  if (!logPath) throw new Error("Chemin du journal Supabase manquant.");
  process.stdout.write(redactSupabaseLog(await readFile(logPath, "utf8")));
}
