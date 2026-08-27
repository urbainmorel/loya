import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const DOCUMENTS = {
  PRD: "PRD_Gestion_Locative_IA_V1.md",
  STI: "STI_Gestion_Locative_IA_V1.md",
  DESIGN: "DESIGN_Gestion_Locative_IA_V1.md",
  ROADMAP: "ROADMAP_Gestion_Locative_IA_V1.md",
};

export const MATRIX_PATH = "docs/traceability/requirements-matrix.json";

const requirementFamilies = ["OBJ", "FR", "BR", "AC", "NFR"];
const screenFamilies = ["X", "L", "A", "O", "S", "N"];
const requirementDefinitionPatterns = {
  OBJ: /^\|\s*`(OBJ-\d{3})`\s*\|/gm,
  FR: /^#{2,6}\s+`(FR-\d{3})`/gm,
  BR: /^-\s+`(BR-\d{3})`\s+—/gm,
  AC: /^#{2,6}\s+`(AC-\d{3})`/gm,
  NFR: /^-\s+`(NFR-\d{3})`\s+—/gm,
};

const sorted = (values) => [...values].sort();

function groupIds(ids, families) {
  return Object.fromEntries(
    families.map((family) => [family, sorted(ids.filter((id) => id.startsWith(`${family}-`)))]),
  );
}

function extractReferences(text, families, digits) {
  const familyPattern = families.join("|");
  const references = new Set(
    [...text.matchAll(new RegExp(`\\b(?:${familyPattern})-\\d{${digits}}\\b`, "g"))].map(
      ([id]) => id,
    ),
  );
  const ranges = new RegExp(
    `\\b(${familyPattern})-(\\d{${digits}})\\b\`?\\s+(?:à|au|–|—)\\s+\`?\\1-(\\d{${digits}})\\b`,
    "g",
  );

  for (const [, family, first, last] of text.matchAll(ranges)) {
    const start = Number(first);
    const end = Number(last);
    for (let value = start; value <= end; value += 1) {
      references.add(`${family}-${String(value).padStart(digits, "0")}`);
    }
  }

  return sorted(references);
}

function extractRequirementDefinitions(prd) {
  return requirementFamilies.flatMap((family) =>
    [...prd.matchAll(requirementDefinitionPatterns[family])].map((match) => match[1]),
  );
}

function extractScreenDefinitions(design) {
  return sorted(
    [...design.matchAll(/^\|\s*`((?:X|L|A|O|S|N)-\d{2})`\s*\|/gm)].map(
      (match) => match[1],
    ),
  );
}

function addRequirementShorthands(text, definitions, references) {
  const families = requirementFamilies.join("|");
  const shorthand = new RegExp(`\\btous?\\s+((?:${families})(?:\/(?:${families}))*)\\b`, "g");
  for (const [, group] of text.matchAll(shorthand)) {
    for (const family of group.split("/")) {
      for (const id of definitions.filter((candidate) => candidate.startsWith(`${family}-`))) {
        references.add(id);
      }
    }
  }
}

function addScreenShorthands(text, definitions, references) {
  if (/\btous\b/.test(text)) {
    for (const id of definitions) references.add(id);
  }
  for (const [group] of text.matchAll(/\b[XLAOSN](?:\/[XLAOSN])+\b/g)) {
    for (const family of group.split("/")) {
      for (const id of definitions.filter((candidate) => candidate.startsWith(`${family}-`))) {
        references.add(id);
      }
    }
  }
}

function buildMatrix(roadmap, requirementDefinitions, screenDefinitions) {
  const tasks = [];
  const taskPattern =
    /^\|\s*`(S[0-5]-\d{3})`\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/gm;

  for (const [, id, requirementCell, screenCell, proof] of roadmap.matchAll(taskPattern)) {
    const requirements = new Set(extractReferences(requirementCell, requirementFamilies, 3));
    addRequirementShorthands(requirementCell, requirementDefinitions, requirements);
    const screens = new Set(extractReferences(screenCell, screenFamilies, 2));
    addScreenShorthands(screenCell, screenDefinitions, screens);
    tasks.push({
      id,
      requirements: sorted(requirements),
      screens: sorted(screens),
      tests: [proof.replaceAll("`", "").replace(/\s+/g, " ").trim()],
    });
  }

  tasks.sort((left, right) => left.id.localeCompare(right.id));
  const requirements = requirementDefinitions.map((id) => ({
    id,
    tasks: tasks.filter((task) => task.requirements.includes(id)).map((task) => task.id),
  }));

  return {
    schemaVersion: 1,
    sources: {
      requirements: DOCUMENTS.PRD,
      tasks: `${DOCUMENTS.ROADMAP} §16`,
      screens: `${DOCUMENTS.DESIGN} §16`,
      tests: `${DOCUMENTS.ROADMAP} §16 — colonne « Preuve minimale »`,
    },
    requirements,
    tasks: tasks.map(({ requirements: _requirements, ...task }) => task),
  };
}

export function serializeMatrix(matrix) {
  return `${JSON.stringify(matrix, null, 2)}\n`;
}

export async function inspectTraceability(root = projectRoot) {
  const contents = {};
  const errors = [];

  for (const [name, filename] of Object.entries(DOCUMENTS)) {
    try {
      contents[name] = await readFile(path.join(root, filename), "utf8");
    } catch (error) {
      const reason = error?.code === "ENOENT" ? "introuvable" : "illisible";
      errors.push(`Document normatif ${reason}: ${filename}`);
      contents[name] = "";
    }
  }

  const requirementDefinitions = extractRequirementDefinitions(contents.PRD);
  const screenDefinitions = extractScreenDefinitions(contents.DESIGN);
  const requirementDefinitionSet = new Set(requirementDefinitions);
  const screenDefinitionSet = new Set(screenDefinitions);
  const references = {};

  for (const [name, text] of Object.entries(contents)) {
    references[name] = {
      requirements: extractReferences(text, requirementFamilies, 3),
      screens: extractReferences(text, screenFamilies, 2),
    };
  }

  for (const family of requirementFamilies) {
    if (!requirementDefinitions.some((id) => id.startsWith(`${family}-`))) {
      errors.push(`Famille d'exigences absente du PRD: ${family}`);
    }
  }
  for (const family of screenFamilies) {
    if (!screenDefinitions.some((id) => id.startsWith(`${family}-`))) {
      errors.push(`Famille d'écrans absente de l'inventaire DESIGN: ${family}`);
    }
  }

  for (const name of Object.keys(DOCUMENTS)) {
    for (const id of references[name].requirements) {
      if (!requirementDefinitionSet.has(id)) {
        errors.push(`Exigence orpheline dans ${name}: ${id} (définition attendue dans le PRD)`);
      }
    }
    for (const id of references[name].screens) {
      if (!screenDefinitionSet.has(id)) {
        errors.push(`Écran orphelin dans ${name}: ${id} (définition attendue dans le DESIGN)`);
      }
    }
  }

  const matrix = buildMatrix(contents.ROADMAP, requirementDefinitions, screenDefinitions);
  if (matrix.tasks.length === 0) errors.push("Aucune tâche extraite de la ROADMAP §16");
  for (const requirement of matrix.requirements) {
    if (requirement.tasks.length === 0) {
      errors.push(`Exigence PRD sans tâche ROADMAP: ${requirement.id}`);
    }
  }
  for (const task of matrix.tasks) {
    if (task.screens.length === 0) errors.push(`Tâche ROADMAP sans écran: ${task.id}`);
    if (task.tests.some((proof) => proof.length === 0)) {
      errors.push(`Tâche ROADMAP sans preuve/test minimal: ${task.id}`);
    }
  }

  return {
    errors: sorted(new Set(errors)),
    definitions: {
      requirements: groupIds(requirementDefinitions, requirementFamilies),
      screens: groupIds(screenDefinitions, screenFamilies),
    },
    references,
    matrix,
    matrixText: serializeMatrix(matrix),
  };
}

export async function verifyTraceability(root = projectRoot, { writeMatrix = false } = {}) {
  const result = await inspectTraceability(root);
  const matrixFile = path.join(root, MATRIX_PATH);

  if (writeMatrix) {
    if (result.errors.length === 0) {
      await mkdir(path.dirname(matrixFile), { recursive: true });
      await writeFile(matrixFile, result.matrixText, "utf8");
      result.matrixStatus = "écrite";
    } else {
      result.errors.push("Matrice non écrite car la traçabilité contient des anomalies");
      result.matrixStatus = "non écrite";
    }
    return result;
  }

  try {
    const current = (await readFile(matrixFile, "utf8")).replaceAll("\r\n", "\n");
    if (current !== result.matrixText) {
      result.errors.push(`Matrice de traçabilité en dérive: ${MATRIX_PATH}`);
      result.errors.sort();
      result.matrixStatus = "en dérive";
    } else {
      result.matrixStatus = "à jour";
    }
  } catch (error) {
    const reason = error?.code === "ENOENT" ? "absente" : "illisible";
    result.errors.push(`Matrice de traçabilité ${reason}: ${MATRIX_PATH}`);
    result.errors.sort();
    result.matrixStatus = reason;
  }

  return result;
}

function counts(groups, families) {
  return families.map((family) => `${family}=${groups[family].length}`).join(" ");
}

export function formatSummary(result) {
  const lines = [
    result.errors.length === 0
      ? "Traçabilité documentaire: OK"
      : `Traçabilité documentaire: ÉCHEC (${result.errors.length} anomalie(s))`,
    `Exigences PRD: ${counts(result.definitions.requirements, requirementFamilies)}`,
    `Écrans DESIGN: ${counts(result.definitions.screens, screenFamilies)}`,
    `Matrice: ${result.matrix.requirements.length} exigences, ${result.matrix.tasks.length} tâches (${result.matrixStatus})`,
  ];

  for (const name of Object.keys(DOCUMENTS)) {
    lines.push(
      `Références ${name}: exigences=${result.references[name].requirements.length} écrans=${result.references[name].screens.length}`,
    );
  }
  for (const error of result.errors) lines.push(`- ${error}`);
  return lines.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const rootIndex = args.indexOf("--root");
    const root = rootIndex === -1 ? projectRoot : path.resolve(args[rootIndex + 1] ?? "");
    const writeMatrix = args.includes("--write");
    const printMatrix = args.includes("--print-matrix");
    const known = new Set(["--root", "--write", "--print-matrix", rootIndex === -1 ? "" : args[rootIndex + 1]]);
    const unknown = args.filter((argument) => !known.has(argument));
    if (unknown.length > 0 || (rootIndex !== -1 && !args[rootIndex + 1]) || (writeMatrix && printMatrix)) {
      throw new Error("Usage: node scripts/check-traceability.mjs [--root <dossier>] [--write|--print-matrix]");
    }

    if (printMatrix) {
      const result = await inspectTraceability(root);
      if (result.errors.length > 0) {
        console.error(formatSummary({ ...result, matrixStatus: "non vérifiée" }));
        process.exitCode = 1;
      } else {
        process.stdout.write(result.matrixText);
      }
    } else {
      const result = await verifyTraceability(root, { writeMatrix });
      const output = formatSummary(result);
      if (result.errors.length > 0) {
        console.error(output);
        process.exitCode = 1;
      } else {
        console.log(output);
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
