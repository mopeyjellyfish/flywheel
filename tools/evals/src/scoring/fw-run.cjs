const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function stagePatterns(stage) {
  const slug = String(stage || "").replace(/^flywheel:/, "");
  return [
    new RegExp(`\\$flywheel:${slug}\\b`, "i"),
    new RegExp(`/flywheel:${slug}\\b`, "i"),
    new RegExp(`\\b${slug}\\b`, "i"),
  ];
}

function deterministicRun(caseItem, output) {
  const scores = {};
  const notes = {};

  const startSignal = caseItem.expected_start
    ? mentionsAny(output, stagePatterns(caseItem.expected_start))
    : mentionsAny(output, [/\bearliest missing stage\b/i]);
  scores["Earliest Stage"] = startSignal ? 2 : 0;
  notes["Earliest Stage"] = startSignal
    ? "Identifies a plausible starting stage."
    : "Does not clearly identify the earliest missing stage.";

  const continuitySignal = mentionsAtLeast(output, [/\bwork\b/i, /\breview\b/i, /\bship\b/i, /\bspin\b/i], 2);
  scores["Stage Continuity"] = continuitySignal ? 2 : 0;
  notes["Stage Continuity"] = continuitySignal
    ? "Shows continuity across multiple stages."
    : "Does not clearly carry the task through remaining stages.";

  const stopSignal = mentionsAny(output, [/user approval/i, /repo is not ready/i, /design problem/i, /shipping is complete/i, /stop point/i]);
  scores["Stop-Point Discipline"] = stopSignal ? 2 : 1;
  notes["Stop-Point Discipline"] = stopSignal
    ? "Mentions orchestration stop points."
    : "Does not clearly mention stop points, but the run flow is present.";

  const spinSignal = mentionsAny(output, [/\$flywheel:spin\b/i, /\/flywheel:spin\b/i]);
  scores["Spin Awareness"] = spinSignal ? 2 : 0;
  notes["Spin Awareness"] = spinSignal
    ? "Keeps spin in the closing path."
    : "Does not clearly mention spin as the final capture step.";

  return { scores, notes };
}

module.exports = {
  deterministicRun,
};
