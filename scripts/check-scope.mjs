import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productRoots = ["apps", "packages", path.join("supabase", "migrations")];
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".sql"]);
const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  "coverage",
  "graphify-out",
  "docs",
  "test",
  "tests",
  "__tests__",
  "fixtures",
]);
const forbiddenDependencies = new Set([
  "next",
  "fastify",
  "redis",
  "ioredis",
  "bullmq",
  "express",
  "koa",
  "@koa/router",
  "@nestjs/core",
  "@hono/node-server",
  "react-native",
  "expo",
  "cordova",
]);
const forbiddenDependencyPrefixes = ["@capacitor/", "@expo/", "@ionic-native/"];
const requiredProductDependencies = new Map([
  ["apps/web/package.json", ["react", "vite"]],
  ["apps/worker/package.json", ["hono", "wrangler"]],
]);
const forbiddenSourcePatterns = [
  [
    /\b(?:partialPayment|partial_payment|PaymentInstallment|InstallmentPlan|payment_installments?|paymentSchedule|remainingBalance|balanceDue)\b/i,
    "paiement partiel, solde restant ou échéancier",
  ],
  [
    /\b(?:LeaseContract|RentalContract|LeaseAgreement|ContractGenerator|contractGeneration|leaseSignature|eSignature|legalLeaseDocument)\b|\/v1\/contracts?\b/i,
    "contrat, génération ou signature de bail",
  ],
  [
    /\b(?:PropertyInspection|MoveInInspection|MoveOutInspection|inspectionReport|etatDesLieux|etat_des_lieux)\b/i,
    "état des lieux",
  ],
  [
    /\b(?:MaintenanceRequest|MaintenanceTicket|WorkOrder|RepairRequest|maintenance_requests?)\b/i,
    "maintenance ou travaux",
  ],
  [
    /\b(?:SupportTicket|InternalTicket|IssueTicket|ProblemReport|TenantComplaint|Signalement)\b/i,
    "ticket, réclamation ou signalement interne",
  ],
  [
    /\b(?:AdvancedReport|BIReport|BusinessIntelligence|DataWarehouse|advanced_reports?)\b/i,
    "rapport avancé ou BI",
  ],
  [
    /\b(?:DataImport|ImportJob|ClientMigration|AutomatedMigration|data_imports?)\b|\/v1\/imports?\b/i,
    "import ou migration client automatisée",
  ],
  [
    /\b(?:OwnerCsvExport|OwnerExcelExport|exportOwnerCsv|exportOwnerExcel)\b|\/v1\/owner-exports?\/(?:csv|excel)\b/i,
    "export CSV/Excel Propriétaire",
  ],
  [
    /\b(?:initiateRefund|executeRefund|refundProvider|ProviderRefund|fedapayRefund)\b|\/v1\/(?:provider-refunds?|payments\/[^/]+\/refund-provider)\b/i,
    "remboursement fournisseur in-app",
  ],
  [
    /\b(?:FedaPayBalance|ProviderBalance|MerchantBalance|SubaccountBalance|FedaPayWithdrawal|ProviderWithdrawal|FedaPaySettlement|withdrawProviderFunds|fetchProviderBalance)\b/i,
    "balance, retrait ou règlement FedaPay",
  ],
  [
    /\b(?:OwnerPayout|OwnerWithdrawal|OwnerTransfer|AgencyOwnerTransfer|PayoutProof|RemittanceConfirmation|owner_payouts?|owner_withdrawals?|owner_transfers?)\b/i,
    "reversement, retrait ou preuve de remise Propriétaire",
  ],
  [
    /\b(?:RentEscrow|TenantRentWallet|CustodialRent|EscrowAccount|heldTenantFunds|escrowedRent)\b/i,
    "détention ou cantonnement du loyer",
  ],
  [
    /\b(?:AiAssistant|AiChat|TenantChatbot|OwnerChatbot|UserFacingAI|user_facing_ai)\b/i,
    "IA visible par l’utilisateur",
  ],
  [
    /\b(?:signInWithPassword|LocalPassword|PasswordCredential|PhoneOtp|SmsOtp|WhatsAppOtp|sendSmsOtp|phone_otp|sms_otp|whatsapp_otp)\b/i,
    "mot de passe local ou authentification téléphone/SMS/WhatsApp",
  ],
  [
    /\b(?:OtpChallenge|UserIdentity|IdentityLink|UserEmailClaim|AppSession|LocalSession|SessionStore)\b/i,
    "identité, session ou OTP applicatif parallèle",
  ],
  [
    /\bfrom\s+["']node:(?:http|https|http2)["']|\brequire\(["']node:(?:http|https|http2)["']\)|\bcreateServer\s*\(/i,
    "serveur Node permanent",
  ],
  [/\bD1Database\b|\bd1_databases\b/i, "binding D1 interdit"],
  [/\binsolvable\b/i, "terminologie interdite « insolvable »"],
  [
    /\breste à reverser\b|\bsolde à reverser\b|\bfonds libérés\b/i,
    "représentation interdite de remise de fonds",
  ],
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else files.push(absolute);
  }
  return files;
}

export async function findScopeViolations(projectRoot = root) {
  const violations = [];
  const manifests = new Map();

  for (const relativeRoot of productRoots) {
    for (const file of await walk(path.join(projectRoot, relativeRoot))) {
      if (!sourceExtensions.has(path.extname(file))) continue;
      const source = await readFile(file, "utf8");
      for (const [pattern, label] of forbiddenSourcePatterns) {
        if (pattern.test(source)) violations.push(`${path.relative(projectRoot, file)}: ${label}`);
      }
    }
  }

  for (const file of await walk(projectRoot)) {
    if (file.includes(`${path.sep}node_modules${path.sep}`)) continue;
    if (path.basename(file) === "package.json") {
      const manifest = JSON.parse(await readFile(file, "utf8"));
      const dependencies = {
        ...manifest.dependencies,
        ...manifest.devDependencies,
        ...manifest.optionalDependencies,
        ...manifest.peerDependencies,
      };
      const relative = path.relative(projectRoot, file).split(path.sep).join("/");
      manifests.set(relative, new Set(Object.keys(dependencies)));
      for (const dependency of Object.keys(dependencies)) {
        if (
          forbiddenDependencies.has(dependency) ||
          forbiddenDependencyPrefixes.some((prefix) => dependency.startsWith(prefix))
        ) {
          violations.push(`${path.relative(projectRoot, file)}: dépendance interdite ${dependency}`);
        }
      }
    }
    if (/^wrangler\.(?:jsonc?|toml)$/.test(path.basename(file))) {
      const config = await readFile(file, "utf8");
      if (/\bd1_databases\b/.test(config)) {
        violations.push(`${path.relative(projectRoot, file)}: binding D1 interdit`);
      }
    }
  }

  for (const [manifestPath, required] of requiredProductDependencies) {
    const dependencies = manifests.get(manifestPath);
    if (!dependencies) continue;
    for (const dependency of required) {
      if (!dependencies.has(dependency)) {
        violations.push(`${manifestPath}: dépendance de stack requise absente ${dependency}`);
      }
    }
  }

  const hasProductManifest = [...requiredProductDependencies.keys()].some((manifestPath) =>
    manifests.has(manifestPath),
  );
  const hasSupabase = [...manifests.values()].some((dependencies) =>
    dependencies.has("@supabase/supabase-js"),
  );
  if (hasProductManifest && !hasSupabase) {
    violations.push("manifests produit: dépendance de stack requise absente @supabase/supabase-js");
  }

  return violations.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const violations = await findScopeViolations();
  if (violations.length > 0) {
    console.error(`Écarts de périmètre détectés:\n${violations.join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log("Périmètre verrouillé: aucun écart détecté.");
  }
}
