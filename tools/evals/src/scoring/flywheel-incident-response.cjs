const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function stagePatterns(stage) {
  const slug = String(stage || "").replace(/^fw:/, "");
  return [
    new RegExp(`\\$fw:${slug}\\b`, "i"),
    new RegExp(`/fw:${slug}\\b`, "i"),
    new RegExp(`\\b${slug}\\b`, "i"),
  ];
}

function countJourneyStages(output, caseItem) {
  return (caseItem.expected_path || []).filter((stage) => mentionsAny(output, stagePatterns(stage))).length;
}

function deterministicFlywheelIncidentResponse(caseItem, output) {
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
    ? "Shows a coherent incident-response journey."
    : `Only partially shows the expected incident-response journey (${journeyCount} stage hits).`;

  const evidenceSignal = mentionsAtLeast(output, [/alert/i, /log/i, /trace/i, /metric/i, /evidence bundle/i, /incident/i], 2);
  scores["Evidence Preservation"] = evidenceSignal ? 2 : 0;
  notes["Evidence Preservation"] = evidenceSignal
    ? "Preserves runtime evidence as part of the journey."
    : "Does not clearly preserve runtime evidence across the journey.";

  const riskSignal = mentionsAny(output, [/mitigat/i, /rollback/i, /patch/i, /observe/i, /blast radius/i]);
  scores["Risk Gating"] = riskSignal ? 2 : 0;
  notes["Risk Gating"] = riskSignal
    ? "Keeps mitigation or rollback decisions explicit."
    : "Does not clearly frame mitigation vs rollback vs patch.";

  const closureSignal = mentionsAny(output, [/commit/i, /\bPR\b/i, /pull request/i, /spin/i, /plan/i, /work/i]);
  scores["Closure"] = closureSignal ? 2 : 1;
  notes["Closure"] = closureSignal
    ? "Keeps the incident path tied to a real downstream stage."
    : "Does not clearly close the incident-response journey.";

  return { scores, notes };
}

module.exports = {
  deterministicFlywheelIncidentResponse,
};
