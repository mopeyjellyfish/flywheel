const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicPlan(caseItem, output) {
  const scores = {};
  const notes = {};

  const planningSignal = mentionsAny(output, [/\btechnical plan\b/i, /\bimplementation unit\b/i, /\bUnit 1\b/i, /docs\/plans/i, /\bplan\b/i]);
  scores["Planning Discipline"] = planningSignal ? 2 : 0;
  notes["Planning Discipline"] = planningSignal
    ? "Reads like a planning artifact rather than execution."
    : "Does not clearly read like a technical plan.";

  const repoGroundingSignal = mentionsAny(output, [/AGENTS\.md/i, /docs\/solutions/i, /repo/i, /codebase/i, /tests/i, /patterns/i]);
  scores["Repo Grounding"] = repoGroundingSignal ? 2 : 1;
  notes["Repo Grounding"] = repoGroundingSignal
    ? "Mentions repo truth or existing patterns."
    : "Repo grounding is present but weak.";

  const handoffToWork = mentionsAny(output, [/\$fw:work\b/i, /\/fw:work\b/i, /\/fw:work\b/i]);
  const handoffToDeepen = mentionsAny(output, [/\$fw:deepen\b/i, /\/fw:deepen\b/i, /\bdeepen the plan\b/i]);
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

  const researchExpected = (caseItem.special_constraints || []).some((item) => /published guidance matters|research brief|targeted follow-up research|research report/i.test(item));
  if (researchExpected) {
    const researchSignal = mentionsAny(output, [/docs\/research/i, /saved research/i, /research brief/i, /fresh brief/i, /reuse/i, /targeted follow-?up research/i, /current published guidance/i]);
    const distinctionSignal = mentionsAtLeast(output, [/repo/i, /codebase/i, /external/i, /published guidance/i, /current practice/i, /deferred/i, /open question/i], 2);
    const decisionSignal = mentionsAny(output, [/Key Technical Decisions/i, /\bdecision\b/i, /\brecommended\b/i, /\bchosen\b/i]);
    scores["Repo Grounding"] = researchSignal ? (distinctionSignal && decisionSignal ? 2 : 1) : 0;
    notes["Repo Grounding"] = researchSignal
      ? distinctionSignal && decisionSignal
        ? "Reuses or explicitly invokes research, keeps repo truth and external guidance distinct, and folds the takeaway into plan decisions."
        : "Acknowledges research, but does not clearly separate repo truth from external guidance or carry the takeaway into plan decisions."
      : "Does not clearly reuse or invoke the expected research posture.";
  }

  const runtimeCase = (caseItem.special_constraints || []).some((item) => /runtime/i.test(item));
  if (runtimeCase) {
    const runtimeAware = mentionsAny(output, [/observability/i, /rollout/i, /blast radius/i, /monitor/i]);
    scores["Runtime Awareness"] = runtimeAware ? 2 : 0;
    notes["Runtime Awareness"] = runtimeAware
      ? "Includes runtime or rollout awareness."
      : "Missing runtime, rollout, or observability awareness for a runtime-risky case.";
  }

  const architectureCase = (caseItem.special_constraints || []).some((item) => /architecture-bearing/i.test(item));
  if (architectureCase) {
    const architectureAware = mentionsAtLeast(output, [/architecture/i, /pattern/i, /boundary/i, /rejected/i, /clean-code/i], 3);
    scores["Repo Grounding"] = architectureAware ? 2 : scores["Repo Grounding"];
    notes["Repo Grounding"] = architectureAware
      ? "Includes explicit architecture or pattern decisions grounded for later execution."
      : notes["Repo Grounding"];
  }

  return { scores, notes };
}

module.exports = {
  deterministicPlan,
};
