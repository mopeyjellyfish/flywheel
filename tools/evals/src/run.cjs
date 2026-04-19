const path = require("path");
const promptfoo = require("promptfoo").default;
const { buildPromptfooSuite, selectCases } = require("./promptfoo/build-test-suite.cjs");
const { loadSuite } = require("./lib/suites.cjs");
const { defaultRunRoot, repoRoot } = require("./lib/paths.cjs");
const { ensureDir, writeJson, writeJsonl } = require("./lib/files.cjs");
const { scoreCase } = require("./scoring/index.cjs");
const { runRootSummary } = require("./lib/run-root-harness.cjs");
const { getCodexFlywheelStatus } = require("./doctor.cjs");

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

function normalizeRunnerSelection(runner) {
  if (!runner || runner === "all") {
    return ["codex", "claude"];
  }
  return runner.split(",").map((item) => item.trim()).filter(Boolean);
}

function getProviderLabel(row) {
  if (row.providerLabel) {
    return row.providerLabel;
  }
  if (row.provider && typeof row.provider.label === "string") {
    return row.provider.label;
  }
  if (row.provider && typeof row.provider.id === "function") {
    return row.provider.id();
  }
  if (typeof row.provider === "string") {
    return row.provider;
  }
  return "unknown";
}

function getCaseId(row) {
  if (row.vars && row.vars.caseId) {
    return row.vars.caseId;
  }
  if (row.testCase && row.testCase.vars && row.testCase.vars.caseId) {
    return row.testCase.vars.caseId;
  }
  return null;
}

function getOutput(row) {
  if (typeof row.output === "string") {
    return row.output;
  }
  if (row.response && typeof row.response.output === "string") {
    return row.response.output;
  }
  return "";
}

function getError(row) {
  if (row.error) {
    return row.error;
  }
  if (row.response && row.response.error) {
    return row.response.error;
  }
  return null;
}

function buildRunDir(outputDir, suiteId) {
  const base = outputDir ? path.resolve(repoRoot, outputDir) : defaultRunRoot;
  return path.join(base, `${timestamp()}-${suiteId}`);
}

function printCaseSummary(scoredRows) {
  const perRunner = new Map();
  for (const row of scoredRows) {
    if (!perRunner.has(row.runner)) {
      perRunner.set(row.runner, { strong: 0, pass: 0, fail: 0 });
    }
    const bucket = perRunner.get(row.runner);
    bucket[row.status] += 1;
  }

  console.log("Runner summary:");
  for (const [runner, counts] of perRunner) {
    console.log(`- ${runner}: ${counts.strong} strong-pass, ${counts.pass} pass, ${counts.fail} fail`);
  }
}

async function runEval({
  suiteId,
  caseSelection,
  runner,
  judge = "claude",
  subjectModel,
  judgeModel,
  subjectConfig,
  judgeConfig,
  outputDir,
  cache = true,
}) {
  const suite = loadSuite(suiteId);
  const selectedRunners = normalizeRunnerSelection(runner);
  const selectedCases = selectCases(suite, caseSelection);
  if (selectedRunners.includes("codex")) {
    const codexStatus = getCodexFlywheelStatus();
    if (!codexStatus.ok) {
      throw new Error(`cannot run Codex subject evals until Flywheel is enabled in local Codex: ${codexStatus.detail}`);
    }
  }
  const testSuite = buildPromptfooSuite({
    suiteId,
    runner,
    caseSelection,
    subjectModel,
    subjectConfig,
  });
  const runDir = buildRunDir(outputDir, suiteId);
  ensureDir(runDir);

  const runId = path.basename(runDir);
  console.log(`Starting evaluation ${runId}`);
  console.log(
    `Running ${selectedCases.length} case${selectedCases.length === 1 ? "" : "s"} across ${selectedRunners.length} runner${selectedRunners.length === 1 ? "" : "s"}...`,
  );

  const evaluation = await promptfoo.evaluate(testSuite, {
    maxConcurrency: 1,
    cache,
  });

  const rows = evaluation.results || evaluation.table?.body || [];
  const normalizedRows = Array.isArray(rows) ? rows : [];

  const scoredRows = [];
  for (const row of normalizedRows) {
    const caseId = getCaseId(row);
    const runnerLabel = getProviderLabel(row);
    const caseItem = selectedCases.find((item) => item.id === caseId);
    if (!caseItem) {
      continue;
    }

    const output = getOutput(row);
    const error = getError(row);
    const score = error
      ? {
          scores: Object.fromEntries(suite.manifest.dimensions.map((dimension) => [dimension, 0])),
          notes: Object.fromEntries(
            suite.manifest.dimensions.map((dimension) => [dimension, `Execution failed: ${error}`]),
          ),
          judge: { ok: false, error },
        }
      : await scoreCase({
          suite,
          caseItem,
          output,
          judgeRunner: judge,
          judgeModel,
          judgeConfig,
        });

    const average =
      suite.manifest.dimensions.reduce((sum, dimension) => sum + score.scores[dimension], 0) /
      suite.manifest.dimensions.length;

    const hasCriticalZero = suite.manifest.criticalDimensions.some(
      (dimension) => score.scores[dimension] === 0,
    );
    const hasAnyZero = suite.manifest.dimensions.some((dimension) => score.scores[dimension] === 0);

    let status = "fail";
    if (!hasCriticalZero && average >= suite.manifest.passAverage) {
      status = "pass";
    }
    if (!hasAnyZero && average >= suite.manifest.strongPassAverage) {
      status = "strong";
    }

    scoredRows.push({
      caseId,
      runner: runnerLabel,
      output,
      error,
      scores: score.scores,
      notes: score.notes,
      judge: score.judge,
      average,
      status,
    });
  }

  const resultsJsonlRows = scoredRows.map((row) => ({
    id: `${row.caseId}::${row.runner}`,
    scores: row.scores,
    notes: `${row.status} (${row.runner})`,
  }));

  const perRunnerResultPaths = {};
  for (const runnerName of normalizeRunnerSelection(runner)) {
    const runnerRows = scoredRows.filter((row) => row.runner === runnerName);
    const runnerResultsPath = path.join(runDir, `${runnerName}.results.jsonl`);
    writeJsonl(
      runnerResultsPath,
      runnerRows.map((row) => ({
        id: row.caseId,
        scores: row.scores,
        notes: row.judge.ok ? row.judge.summary || row.status : row.notes[suite.manifest.dimensions[0]],
      })),
    );
    perRunnerResultPaths[runnerName] = runnerResultsPath;
  }

  writeJson(path.join(runDir, "metadata.json"), {
    suite: suiteId,
    cases: selectedCases.map((caseItem) => caseItem.id),
    runner,
    judge,
    subjectModel: subjectModel || null,
    judgeModel: judgeModel || null,
    subjectConfig: subjectConfig || [],
    judgeConfig: judgeConfig || [],
    createdAt: new Date().toISOString(),
    cache,
  });
  writeJson(path.join(runDir, "promptfoo-summary.json"), evaluation);
  writeJson(path.join(runDir, "scored-results.json"), scoredRows);
  writeJsonl(path.join(runDir, "results.matrix.jsonl"), resultsJsonlRows);

  console.log(`Wrote run artifacts to ${runDir}`);
  printCaseSummary(scoredRows);

  const hasFailures = scoredRows.some((row) => row.status === "fail");
  let summaryFailed = false;
  for (const [runnerName, runnerResultsPath] of Object.entries(perRunnerResultPaths)) {
    console.log("");
    console.log(`Normalized summary for ${runnerName}:`);
    const summary = await runRootSummary(suiteId, runnerResultsPath);
    process.stdout.write(summary.stdout);
    process.stderr.write(summary.stderr);
    if (!summary.ok) {
      summaryFailed = true;
    }
  }

  return {
    runDir,
    suite,
    scoredRows,
    hasFailures,
    summaryFailed,
  };
}

module.exports = {
  runEval,
};
