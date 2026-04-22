const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicArchitectureStrategy(caseItem, output) {
  const scores = {};
  const notes = {};

  const repoTruth = mentionsAny(output, [/current truth/i, /repo/i, /existing/i, /boundary/i, /ownership/i]);
  scores["Repo Truth"] = repoTruth ? 2 : 0;
  notes["Repo Truth"] = repoTruth
    ? "Grounds architecture advice in current repo or system truth."
    : "Does not clearly ground the recommendation in current truth.";

  const boundary = mentionsAtLeast(output, [/boundary/i, /bounded context/i, /service/i, /module/i, /ownership/i, /dependency/i], 2);
  scores["Boundary Judgment"] = boundary ? 2 : 0;
  notes["Boundary Judgment"] = boundary
    ? "Identifies the core architecture decision surface."
    : "Does not clearly identify the boundary or ownership decision.";

  const distributedCase = (caseItem.special_constraints || []).some((item) => /distributed|failure-mode/i.test(item));
  const patternSignal = distributedCase
    ? mentionsAtLeast(output, [/idempot/i, /outbox/i, /saga/i, /retry/i, /timeout/i, /circuit breaker/i], 1)
    : mentionsAtLeast(output, [/hexagonal/i, /ports/i, /adapter/i, /modular monolith/i, /service/i], 1);
  scores["Pattern Posture"] = patternSignal ? 2 : 1;
  notes["Pattern Posture"] = patternSignal
    ? "Connects architecture posture to concrete pattern choices."
    : "Boundary discussion is present, but named architecture posture is weak.";

  const rightSizing = mentionsAtLeast(output, [/simpler/i, /heavier/i, /minimum durable/i, /right-sized/i, /modular monolith/i, /not justified/i], 2);
  scores["Right-Sizing"] = rightSizing ? 2 : 0;
  notes["Right-Sizing"] = rightSizing
    ? "Compares lighter and heavier options and recommends a right-sized shape."
    : "Does not clearly compare lighter and heavier architecture options.";

  return { scores, notes };
}

module.exports = {
  deterministicArchitectureStrategy,
};
