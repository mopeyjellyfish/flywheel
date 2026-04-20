const { mentionsAny } = require("./shared.cjs");

function stagePatterns(stage) {
  const slug = String(stage || "").replace(/^flywheel:/, "").replace(/^fw-/, "");
  return [
    new RegExp(`\\$flywheel:${slug}\\b`, "i"),
    new RegExp(`/fw:${slug}\\b`, "i"),
    new RegExp(`\\$fw-${slug}\\b`, "i"),
    new RegExp(`/fw-${slug}\\b`, "i"),
    new RegExp(`\\b${slug}\\b`, "i"),
    new RegExp(`\\bfw-${slug}\\b`, "i"),
  ];
}

function deterministicFlywheel(caseItem, output) {
  const scores = {};
  const notes = {};

  const stagePass = mentionsAny(output, stagePatterns(caseItem.expected_stage));
  scores["Stage Selection"] = stagePass ? 2 : 0;
  notes["Stage Selection"] = stagePass
    ? `Mentions expected stage ${caseItem.expected_stage}.`
    : `Did not clearly route to ${caseItem.expected_stage}.`;

  let shortcutScore = 1;
  if (caseItem.id === "clear_small_change_to_work") {
    shortcutScore = mentionsAny(output, stagePatterns("work")) ? 2 : 0;
  }
  if (caseItem.id === "idea_to_brainstorm" || caseItem.id === "backlog_to_ideate") {
    shortcutScore = mentionsAny(output, stagePatterns("work")) ? 0 : 2;
  }
  scores["Shortcut Discipline"] = shortcutScore;
  notes["Shortcut Discipline"] =
    shortcutScore === 2
      ? "Shortcut posture matches case expectation."
      : "Shortcut posture looked too aggressive or too conservative for this case.";

  const endStatePatterns = [/review/i, /ship/i, /spin/i, /\bPR\b/i, /pull request/i];
  const endStateScore = mentionsAny(output, endStatePatterns) ? 2 : 1;
  scores["End-State Awareness"] = endStateScore;
  notes["End-State Awareness"] =
    endStateScore === 2
      ? "References downstream merge, shipping, or spin path."
      : "Does not clearly connect the immediate stage to the end-state.";

  return { scores, notes };
}

module.exports = {
  deterministicFlywheel,
};
