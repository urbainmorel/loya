import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceExtensions = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
const ignoredDirectories = new Set([
  ".git",
  ".turbo",
  ".vite",
  ".wrangler",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);
const dependencyFields = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
];

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function isInside(candidate, directory) {
  const relative = path.relative(directory, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

function maskComments(source) {
  let result = "";
  let index = 0;
  let state = "code";

  while (index < source.length) {
    const current = source[index];
    const next = source[index + 1];

    if (state === "line-comment") {
      if (current === "\n") {
        result += current;
        state = "code";
      } else {
        result += " ";
      }
      index += 1;
      continue;
    }

    if (state === "block-comment") {
      if (current === "*" && next === "/") {
        result += "  ";
        index += 2;
        state = "code";
      } else {
        result += current === "\n" ? "\n" : " ";
        index += 1;
      }
      continue;
    }

    if (state === "template") {
      if (current === "\\") {
        result += " ";
        if (next !== undefined) result += next === "\n" ? "\n" : " ";
        index += 2;
      } else if (current === "`") {
        result += " ";
        index += 1;
        state = "code";
      } else {
        result += current === "\n" ? "\n" : " ";
        index += 1;
      }
      continue;
    }

    if (state === "single-quote" || state === "double-quote") {
      const quote = state === "single-quote" ? "'" : '"';
      result += current;
      if (current === "\\" && next !== undefined) {
        result += next;
        index += 2;
      } else {
        index += 1;
        if (current === quote) state = "code";
      }
      continue;
    }

    if (current === "/" && next === "/") {
      result += "  ";
      index += 2;
      state = "line-comment";
    } else if (current === "/" && next === "*") {
      result += "  ";
      index += 2;
      state = "block-comment";
    } else if (current === "'") {
      result += current;
      index += 1;
      state = "single-quote";
    } else if (current === '"') {
      result += current;
      index += 1;
      state = "double-quote";
    } else if (current === "`") {
      result += " ";
      index += 1;
      state = "template";
    } else {
      result += current;
      index += 1;
    }
  }

  return result;
}

function lineAt(source, index) {
  let line = 1;
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (source[cursor] === "\n") line += 1;
  }
  return line;
}

export function extractImportSpecifiers(source) {
  const input = maskComments(source);
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?(?:[^"'`;]*?\s+from\s*)?["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  const imports = [];

  for (const pattern of patterns) {
    for (const match of input.matchAll(pattern)) {
      imports.push({
        index: match.index,
        line: lineAt(input, match.index),
        specifier: match[1],
      });
    }
  }

  return imports.sort(
    (left, right) =>
      left.index - right.index || left.specifier.localeCompare(right.specifier),
  );
}

async function listFiles(directory) {
  const files = [];
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return files;
    throw error;
  }

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await listFiles(path.join(directory, entry.name))));
      }
    } else if (
      entry.isFile() &&
      sourceExtensions.has(path.extname(entry.name))
    ) {
      files.push(path.join(directory, entry.name));
    }
  }

  return files;
}

function manifestDependencies(manifest) {
  const names = new Set();
  for (const field of dependencyFields) {
    for (const name of Object.keys(manifest[field] ?? {})) names.add(name);
  }
  return [...names].sort();
}

async function loadWorkspaces(rootDirectory) {
  const diagnostics = [];
  const workspaces = [];

  for (const [collection, kind] of [
    ["apps", "app"],
    ["packages", "package"],
  ]) {
    let entries;
    try {
      entries = await readdir(path.join(rootDirectory, collection), {
        withFileTypes: true,
      });
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }

    for (const entry of entries.sort((left, right) =>
      left.name.localeCompare(right.name),
    )) {
      if (!entry.isDirectory()) continue;
      const directory = path.join(rootDirectory, collection, entry.name);
      const manifestPath = path.join(directory, "package.json");
      let manifest;

      try {
        manifest = JSON.parse(await readFile(manifestPath, "utf8"));
      } catch (error) {
        if (error.code === "ENOENT") continue;
        diagnostics.push({
          code: "INVALID_MANIFEST",
          file: toPosix(path.relative(rootDirectory, manifestPath)),
          message: `package.json invalide: ${error.message}`,
        });
        continue;
      }

      if (typeof manifest.name !== "string" || manifest.name.length === 0) {
        diagnostics.push({
          code: "INVALID_MANIFEST",
          file: toPosix(path.relative(rootDirectory, manifestPath)),
          message: "le workspace doit déclarer un nom",
        });
        continue;
      }

      workspaces.push({
        directory,
        kind,
        manifest,
        manifestPath,
        name: manifest.name,
        relativeDirectory: toPosix(path.relative(rootDirectory, directory)),
      });
    }
  }

  workspaces.sort((left, right) => left.name.localeCompare(right.name));
  const names = new Set();
  for (const workspace of workspaces) {
    if (names.has(workspace.name)) {
      diagnostics.push({
        code: "DUPLICATE_WORKSPACE",
        file: toPosix(path.relative(rootDirectory, workspace.manifestPath)),
        message: `nom de workspace dupliqué: ${workspace.name}`,
      });
    }
    names.add(workspace.name);
  }

  return { diagnostics, workspaces };
}

function canonicalCycle(cycle) {
  const nodes = cycle.slice(0, -1);
  const rotations = nodes.map((_, index) => [
    ...nodes.slice(index),
    ...nodes.slice(0, index),
  ]);
  rotations.sort((left, right) =>
    left.join("\0").localeCompare(right.join("\0")),
  );
  return [...rotations[0], rotations[0][0]];
}

function findCycles(workspaces, workspaceByName) {
  const graph = new Map(
    workspaces.map((workspace) => [
      workspace.name,
      manifestDependencies(workspace.manifest).filter((name) =>
        workspaceByName.has(name),
      ),
    ]),
  );
  const state = new Map();
  const stack = [];
  const cycles = new Map();

  function visit(name) {
    state.set(name, "visiting");
    stack.push(name);

    for (const dependency of graph.get(name) ?? []) {
      if (!state.has(dependency)) {
        visit(dependency);
      } else if (state.get(dependency) === "visiting") {
        const start = stack.indexOf(dependency);
        const cycle = canonicalCycle([...stack.slice(start), dependency]);
        cycles.set(cycle.join(" -> "), cycle);
      }
    }

    stack.pop();
    state.set(name, "visited");
  }

  for (const name of [...graph.keys()].sort()) {
    if (!state.has(name)) visit(name);
  }

  return [...cycles.values()].sort((left, right) =>
    left.join("\0").localeCompare(right.join("\0")),
  );
}

function sourceBoundaryDiagnostic(importer, target, specifier, file, line) {
  if (target.kind === "app") {
    return {
      code: importer.kind === "package" ? "PACKAGE_TO_APP" : "APP_TO_APP",
      file,
      line,
      message: `${importer.name} ne peut pas importer le workspace applicatif ${target.name} (${specifier})`,
    };
  }

  return {
    code: "CROSS_WORKSPACE_PATH",
    file,
    line,
    message: `${importer.name} doit importer le point d'entrée public ${target.name}, pas ${specifier}`,
  };
}

function inspectSpecifier({
  file,
  importer,
  line,
  specifier,
  workspaceByName,
  workspaces,
}) {
  const internalTarget = [...workspaceByName.values()]
    .sort((left, right) => right.name.length - left.name.length)
    .find(
      (workspace) =>
        specifier === workspace.name ||
        specifier.startsWith(`${workspace.name}/`),
    );

  if (internalTarget) {
    if (internalTarget.kind === "app") {
      return sourceBoundaryDiagnostic(
        importer,
        internalTarget,
        specifier,
        file,
        line,
      );
    }
    if (specifier !== internalTarget.name) {
      return {
        code: "DEEP_IMPORT",
        file,
        line,
        message: `${importer.name} doit importer ${internalTarget.name} sans sous-chemin (${specifier})`,
      };
    }
    return undefined;
  }

  if (specifier.startsWith("@loya/")) {
    return {
      code: "UNKNOWN_WORKSPACE",
      file,
      line,
      message: `${specifier} ne correspond à aucun workspace Loya déclaré`,
    };
  }

  if (specifier.startsWith(".") || path.isAbsolute(specifier)) {
    const resolved = path.resolve(path.dirname(file), specifier);
    const target = [...workspaces]
      .sort((left, right) => right.directory.length - left.directory.length)
      .find(
        (workspace) =>
          workspace !== importer && isInside(resolved, workspace.directory),
      );
    if (target)
      return sourceBoundaryDiagnostic(importer, target, specifier, file, line);
  }

  if (/^(?:apps|packages)\//.test(specifier)) {
    return {
      code: "CROSS_WORKSPACE_PATH",
      file,
      line,
      message: `${importer.name} ne peut pas importer un workspace par chemin (${specifier})`,
    };
  }

  return undefined;
}

function sortDiagnostics(diagnostics) {
  return diagnostics.sort(
    (left, right) =>
      left.file.localeCompare(right.file) ||
      (left.line ?? 0) - (right.line ?? 0) ||
      left.code.localeCompare(right.code) ||
      left.message.localeCompare(right.message),
  );
}

export function formatBoundaryDiagnostic(diagnostic) {
  const location = diagnostic.line
    ? `${diagnostic.file}:${diagnostic.line}`
    : diagnostic.file;
  return `${diagnostic.code} ${location} — ${diagnostic.message}`;
}

export async function checkBoundaries(rootDirectory = process.cwd()) {
  const absoluteRoot = path.resolve(rootDirectory);
  const { diagnostics, workspaces } = await loadWorkspaces(absoluteRoot);
  const workspaceByName = new Map(
    workspaces.map((workspace) => [workspace.name, workspace]),
  );

  for (const workspace of workspaces) {
    const manifestFile = toPosix(
      path.relative(absoluteRoot, workspace.manifestPath),
    );
    for (const dependency of manifestDependencies(workspace.manifest)) {
      const target = workspaceByName.get(dependency);
      if (!target || target === workspace || target.kind !== "app") continue;
      diagnostics.push({
        code: workspace.kind === "package" ? "PACKAGE_TO_APP" : "APP_TO_APP",
        file: manifestFile,
        message: `${workspace.name} ne peut pas dépendre du workspace applicatif ${target.name}`,
      });
    }

    for (const absoluteFile of await listFiles(workspace.directory)) {
      const relativeFile = toPosix(path.relative(absoluteRoot, absoluteFile));
      const source = await readFile(absoluteFile, "utf8");
      for (const imported of extractImportSpecifiers(source)) {
        const diagnostic = inspectSpecifier({
          file: absoluteFile,
          importer: workspace,
          line: imported.line,
          specifier: imported.specifier,
          workspaceByName,
          workspaces,
        });
        if (diagnostic) diagnostics.push({ ...diagnostic, file: relativeFile });
      }
    }
  }

  for (const cycle of findCycles(workspaces, workspaceByName)) {
    diagnostics.push({
      code: "WORKSPACE_CYCLE",
      file: "<workspace-graph>",
      message: cycle.join(" -> "),
    });
  }

  sortDiagnostics(diagnostics);
  return {
    diagnostics,
    ok: diagnostics.length === 0,
    workspaceCount: workspaces.length,
  };
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    const result = await checkBoundaries();
    if (result.ok) {
      console.log(
        `Frontières conformes (${result.workspaceCount} workspaces).`,
      );
    } else {
      for (const diagnostic of result.diagnostics)
        console.error(formatBoundaryDiagnostic(diagnostic));
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`BOUNDARY_CHECK_FAILED — ${error.message}`);
    process.exitCode = 1;
  }
}
