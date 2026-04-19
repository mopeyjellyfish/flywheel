const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicSpin(caseItem, output) {
  const scores = {};
  const notes = {};

  const retrievalSignal =
    mentionsAny(output, [/docs\/solutions\//i]) &&
    mentionsAny(output, [/frontmatter/i, /\bYAML\b/i, /\bmetadata\b/i]) &&
    mentionsAtLeast(output, [/files_touched/i, /\btags\b/i, /\bmodule\b/i, /doc_status/i], 2);
  scores["Retrieval Contract"] = retrievalSignal ? 2 : 0;
  notes["Retrieval Contract"] = retrievalSignal
    ? "Mentions docs/solutions plus frontmatter or retrieval metadata."
    : "Does not clearly preserve the retrieval contract.";

  const canonicalSignal = mentionsAny(output, [
    /update (the )?existing/i,
    /\brefresh\b.*\bexisting\b/i,
    /\bsupersede/i,
    /\bsuperseded_by\b/i,
    /\bsupersedes\b/i,
    /\bcanonical\b/i,
    /\bduplicate\b/i,
  ]);
  scores["Canonicalization"] = canonicalSignal ? 2 : 0;
  notes["Canonicalization"] = canonicalSignal
    ? "Mentions update, supersede, canonical, or duplicate handling."
    : "Does not clearly show canonicalization or duplicate control.";

  const housekeepingSignal =
    mentionsAny(output, [/\bhousekeeping\b/i, /\bneighboring docs?\b/i, /\boverlap/i, /\bcross-link/i]) &&
    mentionsAny(output, [/\bbounded\b/i, /at most\s+2/i, /strongest overlaps?/i, /not .*whole store/i, /do not .*whole store/i]);
  scores["Housekeeping Discipline"] = housekeepingSignal ? 2 : 0;
  notes["Housekeeping Discipline"] = housekeepingSignal
    ? "Mentions bounded housekeeping on overlapping docs."
    : "Does not clearly keep housekeeping local and bounded.";

  const workflowSignal = mentionsAtLeast(
    output,
    [/\bfuture\b/i, /\bnext task\b/i, /\bideate\b/i, /\bbrainstorm\b/i, /\bplan\b/i, /\bwork\b/i, /\breview\b/i, /\bdebug\b/i],
    2,
  );
  scores["Workflow Fit"] = workflowSignal ? 2 : 0;
  notes["Workflow Fit"] = workflowSignal
    ? "Explains future Flywheel reuse."
    : "Does not clearly connect the doc to future workflow reuse.";

  const blankCase = /with no argument/i.test(caseItem.arguments) || (caseItem.special_constraints || []).some((item) => /Blank input/i.test(item));
  if (blankCase) {
    const candidateSignal = mentionsAny(output, [/\bcandidate/i, /which one to spin/i, /\bspin all\b/i]);
    scores["Capture Discipline"] = candidateSignal ? 2 : 0;
    notes["Capture Discipline"] = candidateSignal
      ? "Treats blank input as candidate discovery."
      : "Does not clearly do candidate discovery for blank input.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicSpin,
};
