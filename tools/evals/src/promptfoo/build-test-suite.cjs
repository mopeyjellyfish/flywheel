const { localProviderPath, repoRoot } = require("../lib/paths.cjs");
const { loadSuite } = require("../lib/suites.cjs");

function getRunnerSelection(runnerArg) {
  if (!runnerArg || runnerArg === "all") {
    return ["codex", "claude"];
  }
  return runnerArg.split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeCaseSelection(caseSelection) {
  if (!caseSelection) {
    return [];
  }
  return caseSelection
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function selectCases(suite, caseSelection) {
  const requestedCaseIds = normalizeCaseSelection(caseSelection);
  if (requestedCaseIds.length === 0) {
    return suite.cases;
  }

  const available = new Map(suite.cases.map((caseItem) => [caseItem.id, caseItem]));
  const missing = requestedCaseIds.filter((caseId) => !available.has(caseId));
  if (missing.length > 0) {
    const known = suite.cases.map((caseItem) => caseItem.id).join(", ");
    throw new Error(
      `unknown case id(s) for suite "${suite.id}": ${missing.join(", ")}. Available cases: ${known}`,
    );
  }

  return requestedCaseIds.map((caseId) => available.get(caseId));
}

function buildPromptfooSuite({ suiteId, runner, caseSelection, subjectModel, subjectConfig }) {
  const suite = loadSuite(suiteId);
  const runners = getRunnerSelection(runner);
  const selectedCases = selectCases(suite, caseSelection);

  return {
    description: `Flywheel local eval for ${suiteId}`,
    prompts: [
      {
        raw: "{{rawArguments}}",
        label: `${suiteId}-input`,
      },
    ],
    providers: runners.map((runnerName) => ({
      id: `file://${localProviderPath}`,
      label: runnerName,
      config: {
        runner: runnerName,
        repoRoot,
        model: subjectModel,
        configOverrides: subjectConfig,
      },
    })),
    tests: selectedCases.map((caseItem) => ({
      description: caseItem.id,
      vars: {
        caseId: caseItem.id,
        suiteId,
        skill: suite.manifest.skill,
        rawArguments: caseItem.arguments,
      },
      metadata: {
        caseId: caseItem.id,
        suiteId,
        skill: suite.manifest.skill,
      },
    })),
  };
}

function buildPromptfooSuiteFromEnv() {
  const suiteId = process.env.FW_EVAL_SUITE;
  if (!suiteId) {
    throw new Error("FW_EVAL_SUITE is required");
  }
  return buildPromptfooSuite({
    suiteId,
    runner: process.env.FW_EVAL_RUNNER || "all",
  });
}

module.exports = {
  buildPromptfooSuite,
  buildPromptfooSuiteFromEnv,
  normalizeCaseSelection,
  selectCases,
};
