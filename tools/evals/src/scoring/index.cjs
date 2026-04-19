const { runLocalJudge } = require("../lib/judge.cjs");
const { deterministicFlywheel } = require("./flywheel.cjs");
const { deterministicDebug } = require("./fw-debug.cjs");
const { deterministicIdeate } = require("./fw-ideate.cjs");
const { deterministicOptimize } = require("./fw-optimize.cjs");
const { deterministicPlan } = require("./fw-plan.cjs");
const { deterministicReview } = require("./fw-review.cjs");
const { deterministicShip } = require("./fw-ship.cjs");
const { deterministicSpin } = require("./fw-spin.cjs");
const { deterministicWork } = require("./fw-work.cjs");

function getDeterministicSuiteScorer(suiteId) {
  if (suiteId === "flywheel") {
    return deterministicFlywheel;
  }
  if (suiteId === "fw-ideate") {
    return deterministicIdeate;
  }
  if (suiteId === "fw-plan") {
    return deterministicPlan;
  }
  if (suiteId === "fw-work") {
    return deterministicWork;
  }
  if (suiteId === "fw-review") {
    return deterministicReview;
  }
  if (suiteId === "fw-debug") {
    return deterministicDebug;
  }
  if (suiteId === "fw-ship") {
    return deterministicShip;
  }
  if (suiteId === "fw-optimize") {
    return deterministicOptimize;
  }
  if (suiteId === "fw-spin") {
    return deterministicSpin;
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
