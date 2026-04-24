const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function stagePatterns(stage) {
  const slug = String(stage || "").replace(/^fw:/, "");
  return [
    new RegExp(`\\$fw:${slug}\\b`, "i"),
    new RegExp(`/fw:${slug}\\b`, "i"),
    new RegExp(`\\b${slug}\\b`, "i"),
  ];
}

function deterministicRun(caseItem, output) {
  const scores = {};
  const notes = {};
  const reviewMention = mentionsAny(output, stagePatterns("review"));
  const commitMention = mentionsAny(output, stagePatterns("commit"));
  const spinMention = mentionsAny(output, stagePatterns("spin"));

  const startSignal = caseItem.expected_start
    ? mentionsAny(output, stagePatterns(caseItem.expected_start))
    : mentionsAny(output, [/\bearliest missing stage\b/i]);
  scores["Earliest Stage"] = startSignal ? 2 : 0;
  notes["Earliest Stage"] = startSignal
    ? "Identifies a plausible starting stage."
    : "Does not clearly identify the earliest missing stage.";

  let continuityScore = 0;
  if (caseItem.expected_start === "commit") {
    continuityScore = commitMention && spinMention ? 2 : commitMention ? 1 : 0;
  } else {
    continuityScore = reviewMention && commitMention ? 2 : mentionsAtLeast(output, [/\bwork\b/i, /\breview\b/i, /\bcommit\b/i, /\bspin\b/i], 2) ? 1 : 0;
  }
  scores["Stage Continuity"] = continuityScore;
  notes["Stage Continuity"] =
    continuityScore === 2
      ? "Shows a coherent remaining path, including review before commit when applicable."
      : continuityScore === 1
        ? "Shows some workflow continuity, but the review -> commit path is not fully explicit."
        : "Does not clearly carry the task through the remaining stages.";

  const stopSignal = mentionsAny(output, [/user approval/i, /repo is not ready/i, /design problem/i, /commit is complete/i, /stop point/i]);
  scores["Stop-Point Discipline"] = stopSignal ? 2 : 1;
  notes["Stop-Point Discipline"] = stopSignal
    ? "Mentions orchestration stop points."
    : "Does not clearly mention stop points, but the run flow is present.";

  scores["Spin Awareness"] = spinMention ? 2 : 0;
  notes["Spin Awareness"] = spinMention
    ? "Keeps spin in the pre-commit closing path."
    : "Does not clearly mention spin as the optional pre-commit capture step.";

  return { scores, notes };
}

module.exports = {
  deterministicRun,
};
