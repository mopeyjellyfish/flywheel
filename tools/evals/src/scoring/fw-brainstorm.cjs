const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicBrainstorm(caseItem, output) {
  const scores = {};
  const notes = {};

  const requirementsSignal = mentionsAny(output, [/requirements/i, /requirements document/i, /success criteria/i, /scope/i]);
  const collaborationSignal = mentionsAny(output, [/\bask\b/i, /\bquestion\b/i, /\bclarify\b/i, /\bwhat are you thinking\b/i, /\bconstraint\b/i]);
  const optionSignal = mentionsAny(output, [/recommended/i, /\bcustom\b/i, /\boption\b/i, /^\d+\.\s+/m]);
  scores["Requirements Focus"] = requirementsSignal ? (collaborationSignal || optionSignal ? 2 : 1) : 0;
  notes["Requirements Focus"] = requirementsSignal
    ? collaborationSignal || optionSignal
      ? "Focuses on requirements and scope through collaborative discovery or bounded choices."
      : "Focuses on requirements and scope, but does not clearly show collaborative questioning."
    : "Does not clearly focus on requirements.";

  const scopeSignal = mentionsAny(output, [/lightweight/i, /standard/i, /deep/i, /clear requirements/i, /alignment/i, /capture now/i]);
  scores["Scope Assessment"] = scopeSignal ? 2 : 0;
  notes["Scope Assessment"] = scopeSignal
    ? "Acknowledges the right-sized brainstorm posture."
    : "Does not clearly assess scope or ceremony level.";

  const artifactSignal = mentionsAny(output, [/docs\/brainstorms/i, /requirements doc/i, /brief/i]);
  const summarySignal = mentionsAny(output, [/what changed/i, /still open/i, /unresolved/i, /next step/i, /planning is blocked/i]);
  scores["Artifact Discipline"] = artifactSignal ? (summarySignal ? 2 : 1) : 1;
  notes["Artifact Discipline"] = artifactSignal
    ? summarySignal
      ? "Mentions the durable brainstorm artifact and leaves a checkpoint summary."
      : "Mentions the durable brainstorm artifact, but not a clear checkpoint summary."
    : "Keeps the output conversational but does not clearly name the artifact.";

  const researchExpected = (caseItem.special_constraints || []).some((item) => /published guidance matters|research on the user's behalf|research report/i.test(item));
  const researchSignal = mentionsAny(output, [/docs\/research/i, /saved research/i, /research brief/i, /focused research pass/i, /targeted follow-?up research/i, /current published guidance/i, /on your behalf/i]);
  if (researchExpected) {
    scores["Artifact Discipline"] = researchSignal && artifactSignal ? (summarySignal ? 2 : 1) : researchSignal || artifactSignal ? 1 : 0;
    notes["Artifact Discipline"] = researchSignal && artifactSignal
      ? summarySignal
        ? "Uses or explicitly invokes research while preserving the durable brainstorm artifact."
        : "Uses or explicitly invokes research and names the brainstorm artifact, but leaves only a weak checkpoint summary."
      : researchSignal
        ? "Acknowledges the expected research posture, but does not clearly preserve the durable brainstorm artifact."
        : artifactSignal
          ? "Preserves the brainstorm artifact, but does not clearly acknowledge the expected research posture."
          : "Misses both the expected research posture and durable brainstorm artifact.";
  }

  const handoffSignal = mentionsAny(output, [/\$flywheel:plan\b/i, /\/flywheel:plan\b/i, /\/flywheel:plan\b/i]);
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

  const architectureCase = (caseItem.special_constraints || []).some((item) => /architecture-bearing/i.test(item));
  if (architectureCase) {
    const architectureSignal = mentionsAtLeast(output, [/architecture/i, /pattern/i, /boundary/i, /scope/i, /behavior/i], 2);
    scores["Artifact Discipline"] = architectureSignal && artifactSignal ? 2 : scores["Artifact Discipline"];
    notes["Artifact Discipline"] = architectureSignal && artifactSignal
      ? "Keeps architecture-bearing guidance high level inside a durable brainstorm artifact."
      : notes["Artifact Discipline"];
  }

  return { scores, notes };
}

module.exports = {
  deterministicBrainstorm,
};
