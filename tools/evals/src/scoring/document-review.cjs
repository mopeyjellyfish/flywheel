const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicDocumentReview(caseItem, output) {
  const scores = {};
  const notes = {};

  const targetSignal = mentionsAny(output, [/requirements/i, /\bplan\b/i, /document/i, /docs\/brainstorms/i, /docs\/plans/i]);
  scores["Document Targeting"] = targetSignal ? 2 : 0;
  notes["Document Targeting"] = targetSignal
    ? "Targets a document review path."
    : "Does not clearly target a requirements or plan document.";

  const reviewerSignal = mentionsAtLeast(output, [/coherence/i, /feasibility/i, /scope/i, /simplicity/i, /security/i, /observability/i], 2);
  scores["Reviewer Selection"] = reviewerSignal ? 2 : 0;
  notes["Reviewer Selection"] = reviewerSignal
    ? "Mentions reviewer lenses or personas."
    : "Does not clearly mention reviewer selection.";

  const findingsSignal = mentionsAny(output, [/finding/i, /severity/i, /confidence/i, /fix queue/i, /Review complete/i]);
  scores["Findings Structure"] = findingsSignal ? 2 : 0;
  notes["Findings Structure"] = findingsSignal
    ? "Uses document-review output language."
    : "Does not clearly present a findings-oriented review result.";

  const headlessCase = /mode:headless/i.test(caseItem.arguments);
  if (headlessCase) {
    const modeSignal = mentionsAny(output, [/headless/i, /Review complete/i, /requires a document path/i]);
    scores["Mode Handling"] = modeSignal ? 2 : 0;
    notes["Mode Handling"] = modeSignal
      ? "Acknowledges headless mode behavior."
      : "Does not clearly respect headless mode.";
  }

  const handoffSignal = mentionsAny(output, [/\$flywheel:plan\b/i, /\/flywheel:plan\b/i, /\$flywheel:work\b/i, /\/flywheel:work\b/i]);
  scores["Workflow Fit"] = handoffSignal ? 2 : 1;
  notes["Workflow Fit"] = handoffSignal
    ? "Carries the document forward into plan or work."
    : "Review output is present, but the downstream handoff is weak.";

  return { scores, notes };
}

module.exports = {
  deterministicDocumentReview,
};
