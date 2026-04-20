const { mentionsAny } = require("./shared.cjs");

function deterministicPlan(caseItem, output) {
  const scores = {};
  const notes = {};

  const handoffToWork = mentionsAny(output, [/\$flywheel:work\b/i, /\/fw:work\b/i, /\/fw:work\b/i]);
  scores["Workflow Handoff"] = handoffToWork ? 2 : 0;
  notes["Workflow Handoff"] = handoffToWork
    ? "Preserves planning -> work handoff."
    : "Does not clearly hand off from planning into work.";

  const mentionsTests = mentionsAny(output, [/\btest/i, /\btdd\b/i, /verification/i]);
  scores["Test Strategy"] = mentionsTests ? 2 : 0;
  notes["Test Strategy"] = mentionsTests
    ? "Mentions testing or verification strategy."
    : "Does not clearly mention testing or verification.";

  const runtimeCase = (caseItem.special_constraints || []).some((item) => /runtime/i.test(item));
  if (runtimeCase) {
    const runtimeAware = mentionsAny(output, [/observability/i, /rollout/i, /blast radius/i, /monitor/i]);
    scores["Runtime Awareness"] = runtimeAware ? 2 : 0;
    notes["Runtime Awareness"] = runtimeAware
      ? "Includes runtime or rollout awareness."
      : "Missing runtime, rollout, or observability awareness for a runtime-risky case.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicPlan,
};
