#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const EVALS_DIR = path.join(ROOT, "evals");

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function usage() {
  console.log(`Usage:
  node scripts/flywheel-eval.js list
  node scripts/flywheel-eval.js validate [suite]
  node scripts/flywheel-eval.js prepare <suite> [--out <dir>]
  node scripts/flywheel-eval.js summarize <suite> <results.jsonl>`);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`failed to parse JSON at ${rel(filePath)}: ${error.message}`);
  }
}

function readJsonl(filePath) {
  const lines = fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(
        `failed to parse JSONL at ${rel(filePath)}:${index + 1}: ${error.message}`,
      );
    }
  });
}

function rel(filePath) {
  const relative = path.relative(ROOT, filePath) || ".";
  if (relative === "." || (!relative.startsWith("..") && relative !== "..")) {
    return relative;
  }
  return filePath;
}

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [
    now.getUTCFullYear(),
    pad(now.getUTCMonth() + 1),
    pad(now.getUTCDate()),
  ].join("") + "-" + [
    pad(now.getUTCHours()),
    pad(now.getUTCMinutes()),
    pad(now.getUTCSeconds()),
  ].join("");
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function suiteDirs() {
  return fs
    .readdirSync(EVALS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(EVALS_DIR, entry.name))
    .filter((dirPath) => fs.existsSync(path.join(dirPath, "manifest.json")))
    .sort();
}

function loadSuiteById(suiteId) {
  const dirPath = path.join(EVALS_DIR, suiteId);
  if (!fs.existsSync(dirPath)) {
    throw new Error(`suite not found: ${suiteId}`);
  }
  return loadSuite(dirPath);
}

function loadSuite(dirPath) {
  const manifestPath = path.join(dirPath, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`missing manifest: ${rel(manifestPath)}`);
  }

  const manifest = readJson(manifestPath);
  const suiteId = manifest.id || path.basename(dirPath);
  const casePath = path.join(dirPath, manifest.caseFile || "");
  const rubricPath = path.join(dirPath, manifest.rubricFile || "");

  return {
    id: suiteId,
    dirPath,
    manifestPath,
    manifest,
    casePath,
    rubricPath,
  };
}

function validateSuite(suite) {
  const errors = [];
  const warnings = [];
  const { manifest } = suite;

  const requiredManifestStringFields = ["id", "skill", "caseFile", "rubricFile"];
  for (const field of requiredManifestStringFields) {
    if (typeof manifest[field] !== "string" || manifest[field].trim() === "") {
      errors.push(`manifest.${field} must be a non-empty string`);
    }
  }

  const requiredManifestArrayFields = [
    "requiredItemFields",
    "dimensions",
    "criticalDimensions",
    "suggestedFirstPass",
  ];
  for (const field of requiredManifestArrayFields) {
    if (!Array.isArray(manifest[field]) || manifest[field].length === 0) {
      errors.push(`manifest.${field} must be a non-empty array`);
    }
  }

  for (const field of ["passAverage", "strongPassAverage"]) {
    if (typeof manifest[field] !== "number") {
      errors.push(`manifest.${field} must be a number`);
    }
  }

  if (!fs.existsSync(suite.casePath)) {
    errors.push(`missing case file: ${rel(suite.casePath)}`);
  }
  if (!fs.existsSync(suite.rubricPath)) {
    errors.push(`missing rubric file: ${rel(suite.rubricPath)}`);
  }

  let cases = [];
  if (errors.length === 0) {
    try {
      cases = readJsonl(suite.casePath);
    } catch (error) {
      errors.push(error.message);
    }
  }

  const ids = new Set();
  for (const row of cases) {
    if (!row || typeof row !== "object" || !row.item || typeof row.item !== "object") {
      errors.push(`case row must contain an object item payload in ${rel(suite.casePath)}`);
      continue;
    }
    const item = row.item;
    if (typeof item.id !== "string" || item.id.trim() === "") {
      errors.push(`case item is missing item.id in ${rel(suite.casePath)}`);
      continue;
    }
    if (ids.has(item.id)) {
      errors.push(`duplicate case id "${item.id}" in ${rel(suite.casePath)}`);
      continue;
    }
    ids.add(item.id);

    for (const field of manifest.requiredItemFields || []) {
      if (!(field in item)) {
        errors.push(`case "${item.id}" is missing item.${field}`);
      }
    }
  }

  const dimensionSet = new Set(manifest.dimensions || []);
  for (const dimension of manifest.criticalDimensions || []) {
    if (!dimensionSet.has(dimension)) {
      errors.push(`critical dimension "${dimension}" is not listed in manifest.dimensions`);
    }
  }
  for (const caseId of manifest.suggestedFirstPass || []) {
    if (!ids.has(caseId)) {
      warnings.push(`suggestedFirstPass case "${caseId}" is not present in ${rel(suite.casePath)}`);
    }
  }

  if (
    typeof manifest.passAverage === "number" &&
    typeof manifest.strongPassAverage === "number" &&
    manifest.strongPassAverage < manifest.passAverage
  ) {
    errors.push("manifest.strongPassAverage must be greater than or equal to manifest.passAverage");
  }

  return { suite, cases, errors, warnings };
}

function printValidation(result) {
  if (result.errors.length > 0) {
    console.log(`FAIL ${result.suite.id}`);
    for (const error of result.errors) {
      console.log(`  - ${error}`);
    }
    return false;
  }

  console.log(
    `OK   ${result.suite.id} (${result.cases.length} cases, ${result.suite.manifest.dimensions.length} dimensions)`,
  );
  for (const warning of result.warnings) {
    console.log(`  - warning: ${warning}`);
  }
  return true;
}

function listSuites() {
  for (const dirPath of suiteDirs()) {
    const suite = loadSuite(dirPath);
    const result = validateSuite(suite);
    if (result.errors.length > 0) {
      console.log(`${suite.id}\tINVALID`);
      continue;
    }
    console.log(
      `${suite.id}\t${suite.manifest.skill}\t${result.cases.length} cases\tcritical=${suite.manifest.criticalDimensions.length}`,
    );
  }
}

function commandValidate(suiteId) {
  const suites = suiteId
    ? [loadSuiteById(suiteId)]
    : suiteDirs().map((dirPath) => loadSuite(dirPath));

  let allValid = true;
  for (const suite of suites) {
    const valid = printValidation(validateSuite(suite));
    allValid = allValid && valid;
  }
  if (!allValid) {
    process.exit(1);
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeCasesForRun(cases) {
  return cases.map((row) => row.item);
}

function commandPrepare(suiteId, outDirArg) {
  const result = validateSuite(loadSuiteById(suiteId));
  if (!printValidation(result)) {
    process.exit(1);
  }

  const outRoot = outDirArg
    ? path.resolve(process.cwd(), outDirArg)
    : path.join(ROOT, ".context", "flywheel-evals");
  const runDir = path.join(outRoot, `${timestamp()}-${suiteId}`);
  ensureDir(runDir);

  const cases = normalizeCasesForRun(result.cases);
  const templateRows = cases.map((item) => ({
    id: item.id,
    scores: Object.fromEntries(
      result.suite.manifest.dimensions.map((dimension) => [dimension, null]),
    ),
    notes: "",
  }));

  const metadata = {
    suite: result.suite.id,
    skill: result.suite.manifest.skill,
    createdAt: new Date().toISOString(),
    sourceCaseFile: rel(result.suite.casePath),
    sourceRubricFile: rel(result.suite.rubricPath),
    dimensions: result.suite.manifest.dimensions,
    criticalDimensions: result.suite.manifest.criticalDimensions,
    passAverage: result.suite.manifest.passAverage,
    strongPassAverage: result.suite.manifest.strongPassAverage,
    suggestedFirstPass: result.suite.manifest.suggestedFirstPass,
    caseCount: cases.length,
  };

  fs.writeFileSync(path.join(runDir, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`);
  fs.writeFileSync(
    path.join(runDir, "cases.jsonl"),
    `${cases.map((item) => JSON.stringify(item)).join("\n")}\n`,
  );
  fs.writeFileSync(
    path.join(runDir, "results.template.jsonl"),
    `${templateRows.map((row) => JSON.stringify(row)).join("\n")}\n`,
  );
  fs.writeFileSync(
    path.join(runDir, "RUNBOOK.md"),
    [
      `# ${result.suite.id} Eval Run`,
      "",
      "1. Read `cases.jsonl` and the source rubric named in `metadata.json`.",
      "2. Copy `results.template.jsonl` to `results.jsonl` and fill in scores.",
      `3. Run \`node scripts/flywheel-eval.js summarize ${result.suite.id} ${path.join(runDir, "results.jsonl")}\`.`,
      "",
      "Scores must be 0, 1, or 2.",
    ].join("\n"),
  );

  console.log(`Prepared ${result.suite.id} eval run at ${runDir}`);
}

function loadResults(resultsPath) {
  const rows = readJsonl(resultsPath);
  return rows.map((row, index) => {
    if (!row || typeof row !== "object") {
      throw new Error(`results row ${index + 1} must be an object`);
    }
    if (typeof row.id !== "string" || row.id.trim() === "") {
      throw new Error(`results row ${index + 1} is missing id`);
    }
    if (!row.scores || typeof row.scores !== "object") {
      throw new Error(`results row ${index + 1} is missing scores`);
    }
    return row;
  });
}

function evaluateCase(manifest, resultRow) {
  const missingDimensions = [];
  const extraDimensions = [];
  const scores = [];

  for (const dimension of manifest.dimensions) {
    const value = resultRow.scores[dimension];
    if (value === undefined || value === null) {
      missingDimensions.push(dimension);
      continue;
    }
    if (![0, 1, 2].includes(value)) {
      throw new Error(`case "${resultRow.id}" has invalid score for "${dimension}": ${value}`);
    }
    scores.push(value);
  }

  for (const dimension of Object.keys(resultRow.scores)) {
    if (!manifest.dimensions.includes(dimension)) {
      extraDimensions.push(dimension);
    }
  }

  if (missingDimensions.length > 0) {
    throw new Error(`case "${resultRow.id}" is missing scores for: ${missingDimensions.join(", ")}`);
  }
  if (extraDimensions.length > 0) {
    throw new Error(`case "${resultRow.id}" has unknown dimensions: ${extraDimensions.join(", ")}`);
  }

  const average = mean(scores);
  const hasCriticalZero = manifest.criticalDimensions.some(
    (dimension) => resultRow.scores[dimension] === 0,
  );
  const hasAnyZero = manifest.dimensions.some((dimension) => resultRow.scores[dimension] === 0);

  let status = "fail";
  if (!hasCriticalZero && average >= manifest.passAverage) {
    status = "pass";
  }
  if (!hasAnyZero && average >= manifest.strongPassAverage) {
    status = "strong-pass";
  }

  return {
    id: resultRow.id,
    status,
    average,
    hasCriticalZero,
    notes: typeof resultRow.notes === "string" ? resultRow.notes : "",
  };
}

function commandSummarize(suiteId, resultsArg) {
  const validation = validateSuite(loadSuiteById(suiteId));
  if (!printValidation(validation)) {
    process.exit(1);
  }

  const resultsPath = path.resolve(process.cwd(), resultsArg);
  if (!fs.existsSync(resultsPath)) {
    fail(`results file not found: ${resultsArg}`);
  }

  let resultRows;
  try {
    resultRows = loadResults(resultsPath);
  } catch (error) {
    fail(error.message);
  }

  const caseIds = validation.cases.map((row) => row.item.id);
  const resultMap = new Map();
  for (const row of resultRows) {
    if (resultMap.has(row.id)) {
      fail(`duplicate result id "${row.id}" in ${resultsArg}`);
    }
    resultMap.set(row.id, row);
  }

  const missingCaseIds = caseIds.filter((id) => !resultMap.has(id));
  const unknownCaseIds = resultRows
    .map((row) => row.id)
    .filter((id) => !caseIds.includes(id));
  if (missingCaseIds.length > 0) {
    fail(`results are missing cases: ${missingCaseIds.join(", ")}`);
  }
  if (unknownCaseIds.length > 0) {
    fail(`results contain unknown cases: ${unknownCaseIds.join(", ")}`);
  }

  const evaluations = caseIds.map((id) => {
    try {
      return evaluateCase(validation.suite.manifest, resultMap.get(id));
    } catch (error) {
      fail(error.message);
    }
  });

  const summary = {
    "strong-pass": evaluations.filter((entry) => entry.status === "strong-pass").length,
    pass: evaluations.filter((entry) => entry.status === "pass").length,
    fail: evaluations.filter((entry) => entry.status === "fail").length,
  };
  const overallAverage = mean(evaluations.map((entry) => entry.average));

  console.log(`Suite: ${validation.suite.id}`);
  console.log(`Results: ${rel(resultsPath)}`);
  console.log(
    `Summary: ${summary["strong-pass"]} strong-pass, ${summary.pass} pass, ${summary.fail} fail`,
  );
  console.log(`Average: ${overallAverage.toFixed(2)}`);
  console.log("");
  console.log("Per-case:");
  for (const entry of evaluations) {
    const noteSuffix = entry.notes ? ` -- ${entry.notes}` : "";
    console.log(`- ${entry.id}: ${entry.status} (${entry.average.toFixed(2)})${noteSuffix}`);
  }

  if (summary.fail > 0) {
    process.exit(1);
  }
}

function parsePrepareArgs(args) {
  let suiteId = null;
  let outDir = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--out") {
      outDir = args[index + 1];
      index += 1;
      continue;
    }
    if (!suiteId) {
      suiteId = arg;
      continue;
    }
    fail(`unexpected argument: ${arg}`);
  }

  if (!suiteId) {
    fail("prepare requires a suite name");
  }
  if (args.includes("--out") && !outDir) {
    fail("--out requires a directory path");
  }

  return { suiteId, outDir };
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === "help" || command === "--help" || command === "-h") {
    usage();
    return;
  }

  switch (command) {
    case "list":
      listSuites();
      return;
    case "validate":
      commandValidate(rest[0]);
      return;
    case "prepare": {
      const { suiteId, outDir } = parsePrepareArgs(rest);
      commandPrepare(suiteId, outDir);
      return;
    }
    case "summarize":
      if (rest.length !== 2) {
        fail("summarize requires <suite> and <results.jsonl>");
      }
      commandSummarize(rest[0], rest[1]);
      return;
    default:
      usage();
      process.exit(1);
  }
}

main();
