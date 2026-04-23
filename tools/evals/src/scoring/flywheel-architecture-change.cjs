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

function deterministicFlywheelArchitectureChange(caseItem, output) {
  const scores = {};
  const notes = {};

  const startSignal = mentionsAny(output, stagePatterns(caseItem.expected_start));
  scores["Earliest Stage"] = startSignal ? 2 : 0;
  notes["Earliest Stage"] = startSignal
    ? `Starts at ${caseItem.expected_start}.`
    : `Did not clearly start at ${caseItem.expected_start}.`;

  const journeyCount = countJourneyStages(output, caseItem);
  const journeySignal = journeyCount >= Math.min(4, (caseItem.expected_path || []).length);
  scores["Journey Coherence"] = journeySignal ? 2 : 1;
  notes["Journey Coherence"] = journeySignal
    ? "Shows the expected multi-stage architecture-bearing journey."
    : `Only partially shows the expected journey (${journeyCount} stage hits).`;

  const architectureCarry = mentionsAtLeast(output, [/architecture/i, /pattern/i, /boundary/i, /clean-code/i, /simplify/i, /maintainability/i], 3);
  scores["Architecture Carry"] = architectureCarry ? 2 : 0;
  notes["Architecture Carry"] = architectureCarry
    ? "Keeps architecture and pattern decisions visible across later stages."
    : "Does not clearly carry architecture or pattern decisions forward.";

  const specialistActivation = mentionsAtLeast(output, [/\$fw:architecture-strategy\b/i, /\$fw:pattern-recognition\b/i, /\$fw:maintainability\b/i, /\$fw:simplify\b/i], 1) ||
    mentionsAtLeast(output, [/architecture-strategy/i, /pattern-recognition/i, /maintainability/i, /simplify/i], 2);
  scores["Specialist Activation"] = specialistActivation ? 2 : 1;
  notes["Specialist Activation"] = specialistActivation
    ? "Routes specialist helpers when architecture or code-quality work warrants them."
    : "Journey is present, but specialist helper activation is weak.";

  const closure = mentionsAny(output, [/review/i, /commit/i, /spin/i, /\bPR\b/i, /pull request/i]);
  scores["Closure"] = closure ? 2 : 1;
  notes["Closure"] = closure
    ? "Keeps the journey pointed toward review, commit, and capture."
    : "Does not clearly close the architecture-bearing journey.";

  return { scores, notes };
}

module.exports = {
  deterministicFlywheelArchitectureChange,
};
