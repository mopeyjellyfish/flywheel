const { mentionsAny } = require("./shared.cjs");

function deterministicDeepenPlan(caseItem, output) {
  const scores = {};
  const notes = {};

  const planSignal = mentionsAny(output, [/docs\/plans/i, /\bplan\b/i, /deepen/i, /strengthen/i]);
  scores["Plan Targeting"] = planSignal ? 2 : 0;
  notes["Plan Targeting"] = planSignal
    ? "Targets an existing plan."
    : "Does not clearly target an existing plan.";

  const reviewSignal = mentionsAny(output, [/document-review/i, /\$document-review\b/i, /\/document-review\b/i]);
  scores["Document Review Integration"] = reviewSignal ? 2 : 0;
  notes["Document Review Integration"] = reviewSignal
    ? "Uses document-review as part of deepening."
    : "Does not clearly integrate document-review.";

  const groundingSignal = mentionsAny(output, [/AGENTS\.md/i, /docs\/solutions/i, /repo/i, /tests/i, /patterns/i]);
  scores["Repo Grounding"] = groundingSignal ? 2 : 1;
  notes["Repo Grounding"] = groundingSignal
    ? "Mentions repo truth or prior learnings."
    : "Grounding is present but weak.";

  const handoffSignal = mentionsAny(output, [/\$flywheel:work\b/i, /\/flywheel:work\b/i, /\/flywheel:work\b/i]);
  scores["Work Handoff"] = handoffSignal ? 2 : 0;
  notes["Work Handoff"] = handoffSignal
    ? "Carries the plan forward into work."
    : "Does not clearly hand off into work.";

  const runtimeCase = (caseItem.special_constraints || []).some((item) => /runtime/i.test(item));
  if (runtimeCase) {
    const runtimeSignal = mentionsAny(output, [/observability/i, /rollout/i, /blast radius/i, /supportability/i]);
    scores["Runtime Awareness"] = runtimeSignal ? 2 : 0;
    notes["Runtime Awareness"] = runtimeSignal
      ? "Adds runtime or rollout awareness."
      : "Misses runtime or rollout shape for a runtime-risky plan.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicDeepenPlan,
};
