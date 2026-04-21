const { mentionsAny } = require("./shared.cjs");

function deterministicPlan(caseItem, output) {
  const scores = {};
  const notes = {};

  const handoffToWork = mentionsAny(output, [/\$flywheel:work\b/i, /\/flywheel:work\b/i, /\/flywheel:work\b/i]);
  const handoffToDeepen = mentionsAny(output, [/\$flywheel:deepen\b/i, /\/flywheel:deepen\b/i, /\bdeepen the plan\b/i]);
  const documentReview = mentionsAny(output, [/document-review/i, /reviewed plan/i, /plan review/i]);
  const approvalGate = mentionsAny(output, [/approve/i, /approval/i, /review the plan/i, /review the plan first/i, /explicit/i, /go-ahead/i, /ready to start work/i, /choose between/i]);
  const reviewSummary = mentionsAny(output, [/what changed/i, /what (the )?review found/i, /execution would (start|work) on first/i, /start with/i, /first slice/i]);
  const handoffScore = documentReview && handoffToWork && handoffToDeepen
    ? (approvalGate ? (reviewSummary ? 2 : 1) : 1)
    : handoffToWork && approvalGate
      ? 1
      : 0;
  scores["Workflow Handoff"] = handoffScore;
  notes["Workflow Handoff"] =
    handoffScore === 2
      ? "Preserves planning -> document-review -> deepen/work handoff and leaves a useful review summary."
      : handoffScore === 1
        ? "Keeps a review-gated planning handoff, but does not fully make the document-review and deepen/work choice explicit."
        : "Does not clearly hand off from planning into a reviewed deepen/work choice.";

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
