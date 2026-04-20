const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicBrainstorm(caseItem, output) {
  const scores = {};
  const notes = {};

  const requirementsSignal = mentionsAny(output, [/requirements/i, /requirements document/i, /success criteria/i, /scope/i]);
  scores["Requirements Focus"] = requirementsSignal ? 2 : 0;
  notes["Requirements Focus"] = requirementsSignal
    ? "Focuses on requirements and scope."
    : "Does not clearly focus on requirements.";

  const scopeSignal = mentionsAny(output, [/lightweight/i, /standard/i, /deep/i, /clear requirements/i, /alignment/i, /capture now/i]);
  scores["Scope Assessment"] = scopeSignal ? 2 : 0;
  notes["Scope Assessment"] = scopeSignal
    ? "Acknowledges the right-sized brainstorm posture."
    : "Does not clearly assess scope or ceremony level.";

  const artifactSignal = mentionsAny(output, [/docs\/brainstorms/i, /requirements doc/i, /brief/i]);
  scores["Artifact Discipline"] = artifactSignal ? 2 : 1;
  notes["Artifact Discipline"] = artifactSignal
    ? "Mentions the durable brainstorm artifact."
    : "Keeps the output conversational but does not clearly name the artifact.";

  const handoffSignal = mentionsAny(output, [/\$flywheel:plan\b/i, /\/fw:plan\b/i, /\/fw:plan\b/i]);
  scores["Plan Handoff"] = handoffSignal ? 2 : 0;
  notes["Plan Handoff"] = handoffSignal
    ? "Preserves the handoff into planning."
    : "Does not clearly route brainstorming into planning.";

  const constraintCase = (caseItem.special_constraints || []).some((item) => /yagni/i.test(item));
  if (constraintCase) {
    const yagniSignal = mentionsAtLeast(output, [/YAGNI/i, /carrying cost/i, /simplest approach/i, /avoid speculative complexity/i], 1);
    scores["Simplicity Pressure"] = yagniSignal ? 2 : 0;
    notes["Simplicity Pressure"] = yagniSignal
      ? "Applies simplicity or YAGNI pressure."
      : "Misses the explicit simplicity pressure.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicBrainstorm,
};
