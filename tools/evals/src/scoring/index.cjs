const { runLocalJudge } = require("../lib/judge.cjs");
const { deterministicConventionalCommit } = require("./conventional-commit.cjs");
const { deterministicDocumentReview } = require("./document-review.cjs");
const { deterministicFlywheel } = require("./flywheel.cjs");
const { deterministicFlywheelIncidentResponse } = require("./flywheel-incident-response.cjs");
const { deterministicFlywheelRuntimeChange } = require("./flywheel-runtime-change.cjs");
const { deterministicBrainstorm } = require("./fw-brainstorm.cjs");
const { deterministicBrowserTest } = require("./fw-browser-test.cjs");
const { deterministicDebug } = require("./fw-debug.cjs");
const { deterministicDeepenPlan } = require("./fw-deepen-plan.cjs");
const { deterministicIdeate } = require("./fw-ideate.cjs");
const { deterministicOptimize } = require("./fw-optimize.cjs");
const { deterministicPlan } = require("./fw-plan.cjs");
const { deterministicPolish } = require("./fw-polish.cjs");
const { deterministicReview } = require("./fw-review.cjs");
const { deterministicRun } = require("./fw-run.cjs");
const { deterministicSetup } = require("./fw-setup.cjs");
const { deterministicCommit } = require("./fw-commit.cjs");
const { deterministicSpin } = require("./fw-spin.cjs");
const { deterministicWork } = require("./fw-work.cjs");
const { deterministicWorktree } = require("./fw-worktree.cjs");
const { deterministicLogging } = require("./logging.cjs");
const { deterministicObservability } = require("./observability.cjs");
const { deterministicVerification } = require("./verification-before-completion.cjs");

function getDeterministicSuiteScorer(suiteId) {
  if (suiteId === "conventional-commit") {
    return deterministicConventionalCommit;
  }
  if (suiteId === "document-review") {
    return deterministicDocumentReview;
  }
  if (suiteId === "flywheel") {
    return deterministicFlywheel;
  }
  if (suiteId === "flywheel-runtime-change") {
    return deterministicFlywheelRuntimeChange;
  }
  if (suiteId === "flywheel-incident-response") {
    return deterministicFlywheelIncidentResponse;
  }
  if (suiteId === "fw-brainstorm") {
    return deterministicBrainstorm;
  }
  if (suiteId === "fw-browser-test") {
    return deterministicBrowserTest;
  }
  if (suiteId === "fw-ideate") {
    return deterministicIdeate;
  }
  if (suiteId === "fw-deepen-plan") {
    return deterministicDeepenPlan;
  }
  if (suiteId === "fw-plan") {
    return deterministicPlan;
  }
  if (suiteId === "fw-polish") {
    return deterministicPolish;
  }
  if (suiteId === "fw-run") {
    return deterministicRun;
  }
  if (suiteId === "fw-setup") {
    return deterministicSetup;
  }
  if (suiteId === "fw-work") {
    return deterministicWork;
  }
  if (suiteId === "fw-worktree") {
    return deterministicWorktree;
  }
  if (suiteId === "fw-review") {
    return deterministicReview;
  }
  if (suiteId === "fw-debug") {
    return deterministicDebug;
  }
  if (suiteId === "fw-commit") {
    return deterministicCommit;
  }
  if (suiteId === "fw-optimize") {
    return deterministicOptimize;
  }
  if (suiteId === "fw-spin") {
    return deterministicSpin;
  }
  if (suiteId === "logging") {
    return deterministicLogging;
  }
  if (suiteId === "observability") {
    return deterministicObservability;
  }
  if (suiteId === "verification-before-completion") {
    return deterministicVerification;
  }
  throw new Error(`no scorer registered for suite "${suiteId}"`);
}

function mergeScores(dimensions, deterministic, judged) {
  const scores = {};
  const notes = {};

  for (const dimension of dimensions) {
    if (Object.prototype.hasOwnProperty.call(deterministic.scores, dimension)) {
      scores[dimension] = deterministic.scores[dimension];
      notes[dimension] = deterministic.notes[dimension] || "";
      continue;
    }

    scores[dimension] = judged.scores[dimension];
    notes[dimension] = judged.notes[dimension] || "";
  }

  return { scores, notes };
}

async function scoreCase({ suite, caseItem, output, judgeRunner, judgeModel, judgeConfig }) {
  const deterministic = getDeterministicSuiteScorer(suite.id)(caseItem, output);
  const pendingJudgeDimensions = suite.manifest.dimensions.filter(
    (dimension) => !Object.prototype.hasOwnProperty.call(deterministic.scores, dimension),
  );

  const judgeResult = await runLocalJudge({
    judgeRunner,
    suite,
    caseItem,
    output,
    dimensions: pendingJudgeDimensions,
    model: judgeModel,
    configOverrides: judgeConfig,
  });

  if (!judgeResult.ok) {
    return {
      scores: Object.fromEntries(
        suite.manifest.dimensions.map((dimension) => [
          dimension,
          Object.prototype.hasOwnProperty.call(deterministic.scores, dimension)
            ? deterministic.scores[dimension]
            : 0,
        ]),
      ),
      notes: Object.fromEntries(
        suite.manifest.dimensions.map((dimension) => [
          dimension,
          Object.prototype.hasOwnProperty.call(deterministic.notes, dimension)
            ? deterministic.notes[dimension]
            : `Judge unavailable: ${judgeResult.error}`,
        ]),
      ),
      judge: {
        ok: false,
        error: judgeResult.error,
      },
    };
  }

  const merged = mergeScores(suite.manifest.dimensions, deterministic, judgeResult.value);
  return {
    ...merged,
    judge: {
      ok: true,
      summary: judgeResult.value.summary,
    },
  };
}

module.exports = {
  scoreCase,
};
