const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function stagePatterns(stage) {
  const slug = String(stage || "").replace(/^flywheel:/, "").replace(/^fw-/, "");
  const legacy = `fw-${slug}`;
  return [
    new RegExp(`\\$flywheel:${slug}\\b`, "i"),
    new RegExp(`/fw:${slug}\\b`, "i"),
    new RegExp(`\\$${legacy}\\b`, "i"),
    new RegExp(`/${legacy}\\b`, "i"),
    new RegExp(`\\b${legacy}\\b`, "i"),
    new RegExp(`\\b${slug}\\b`, "i"),
  ];
}

function countJourneyStages(output, caseItem) {
  return (caseItem.expected_path || []).filter((stage) => mentionsAny(output, stagePatterns(stage))).length;
}

function deterministicFlywheelRuntimeChange(caseItem, output) {
  const scores = {};
  const notes = {};

  const startSignal = mentionsAny(output, stagePatterns(caseItem.expected_start));
  scores["Earliest Stage"] = startSignal ? 2 : 0;
  notes["Earliest Stage"] = startSignal
    ? `Starts at ${caseItem.expected_start}.`
    : `Did not clearly start at ${caseItem.expected_start}.`;

  const journeyCount = countJourneyStages(output, caseItem);
  const journeySignal = journeyCount >= Math.min(3, (caseItem.expected_path || []).length);
  scores["Journey Coherence"] = journeySignal ? 2 : 1;
  notes["Journey Coherence"] = journeySignal
    ? "Shows a multi-stage runtime-change path."
    : `Only partially shows the expected runtime-change journey (${journeyCount} stage hits).`;

  const riskSignal = mentionsAny(output, [/rollout/i, /validation/i, /rollback/i, /blast radius/i, /runtime-risky/i]);
  scores["Risk Gating"] = riskSignal ? 2 : 0;
  notes["Risk Gating"] = riskSignal
    ? "Keeps rollout or runtime risk gating explicit."
    : "Does not clearly preserve rollout or runtime-risk gating.";

  const artifactSignal = mentionsAtLeast(output, [/plan/i, /review/i, /evidence/i, /artifact/i, /brief/i], 2);
  scores["Artifact Carry"] = artifactSignal ? 2 : 1;
  notes["Artifact Carry"] = artifactSignal
    ? "Carries forward prior stage artifacts."
    : "Only weakly references artifact carry between stages.";

  const closureSignal = mentionsAny(output, [/ship/i, /\bPR\b/i, /pull request/i, /spin/i]);
  scores["Closure"] = closureSignal ? 2 : 1;
  notes["Closure"] = closureSignal
    ? "Keeps the journey pointed at shipping or spin."
    : "Does not clearly close the runtime-change journey.";

  return { scores, notes };
}

module.exports = {
  deterministicFlywheelRuntimeChange,
};
