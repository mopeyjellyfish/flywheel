const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicReview(caseItem, output) {
  const scores = {};
  const notes = {};

  const reviewSignal =
    mentionsAny(output, [/\bfindings\b/i, /\bno findings\b/i]) &&
    mentionsAny(output, [/\bverdict\b/i, /\bready to merge\b/i, /\bready with fixes\b/i, /\bnot ready\b/i]) &&
    mentionsAtLeast(output, [/\bP0\b/i, /\bP1\b/i, /\bP2\b/i, /\bP3\b/i, /\bseverity\b/i, /\brisk\b/i], 1);
  scores["Review Structure"] = reviewSignal ? 2 : 0;
  notes["Review Structure"] = reviewSignal
    ? "Mentions review structure or outputs."
    : "Does not clearly present a review-shaped output.";

  const shipSignal = mentionsAny(output, [/\$flywheel:commit\b/i, /\/flywheel:commit\b/i, /\/flywheel:commit\b/i]);
  scores["Commit Handoff"] = shipSignal ? 2 : 0;
  notes["Commit Handoff"] = shipSignal
    ? "Preserves commit as the downstream handoff."
    : "Does not clearly hand off from review into commit.";

  const headlessCase = /mode:headless/i.test(caseItem.arguments);
  if (headlessCase) {
    const headlessSignal = mentionsAny(output, [/headless/i]) &&
      mentionsAny(output, [/Review complete/i]);
    scores["Mode Handling"] = headlessSignal ? 2 : 0;
    notes["Mode Handling"] = headlessSignal
      ? "Acknowledges headless review mode."
      : "Does not clearly respect headless mode.";
  }

  const browserCase = (caseItem.special_constraints || []).some((item) => /browser/i.test(item));
  if (browserCase) {
    const browserAware = mentionsAny(output, [/\$flywheel:browser-test\b/i, /\/flywheel:browser-test\b/i]);
    scores["Browser Proof Handoff"] = browserAware ? 2 : 0;
    notes["Browser Proof Handoff"] = browserAware
      ? "Calls for browser proof on a browser-visible diff."
      : "Misses browser-proof handoff on a browser-visible diff.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicReview,
};
