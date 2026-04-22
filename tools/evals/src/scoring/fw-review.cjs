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

  const researchCase = (caseItem.special_constraints || []).some((item) => /external-guidance/i.test(item));
  if (researchCase) {
    const researchSignal = mentionsAny(output, [
      /targeted research/i,
      /saved research brief/i,
      /docs\/research/i,
      /official docs/i,
      /current published guidance/i,
      /published guidance/i
    ]);
    const helperSignal = mentionsAny(output, [
      /during review/i,
      /support (for )?(the )?findings/i,
      /support (for )?(the )?verdict/i,
      /verdict reasoning/i,
      /sharpen (the )?(findings|review)/i,
      /keep review (as )?(the )?(main|primary) artifact/i,
      /without turning (it|review) into (a )?standalone research/i
    ]);
    const routeAway = mentionsAny(output, [/belongs in .*flywheel:research/i, /route to .*flywheel:research/i]);
    scores["Research Support"] = researchSignal && helperSignal && !routeAway ? 2 : researchSignal ? 1 : 0;
    notes["Research Support"] = researchSignal && helperSignal && !routeAway
      ? "Uses research as targeted support for review rather than replacing review."
      : researchSignal
        ? "Mentions research, but does not clearly tie it back to findings or verdict reasoning."
        : "Does not clearly allow targeted research support when current guidance matters.";
  }

  const specialistCase = (caseItem.special_constraints || []).some((item) => /pattern-heavy|boundary-change/i.test(item));
  if (specialistCase) {
    const specialistSignal = mentionsAtLeast(output, [/pattern-recognition/i, /architecture/i, /maintainability/i, /simplicity/i], 2);
    scores["Specialist Suite"] = specialistSignal ? 2 : 0;
    notes["Specialist Suite"] = specialistSignal
      ? "Makes the relevant specialist review lenses visible."
      : "Does not clearly activate or name the specialist review suite for a pattern-heavy diff.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicReview,
};
