const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicCommit(caseItem, output) {
  const scores = {};
  const notes = {};

  const commitPath = mentionsAny(output, [/commit/i, /push/i, /\bPR\b/i, /pull request/i]);
  scores["Commit Path"] = commitPath ? 2 : 0;
  notes["Commit Path"] = commitPath
    ? "Mentions commit, push, or PR flow."
    : "Does not clearly describe the commit path.";

  const monitoring =
    mentionsAny(output, [/Post-Deploy Monitoring/i, /no additional operational monitoring required/i]) ||
    mentionsAtLeast(output, [/\bmonitor/i, /\bmetric/i, /\bdashboard/i, /\blog/i, /\balert/i, /\brollback/i, /validation window/i, /\bowner\b/i], 2);
  scores["Monitoring Notes"] = monitoring ? 2 : 0;
  notes["Monitoring Notes"] = monitoring
    ? "Includes monitoring or validation guidance."
    : "Does not clearly include monitoring or validation notes.";

  const defaultBranchCase = (caseItem.special_constraints || []).some((item) => /default-branch/i.test(item));
  if (defaultBranchCase) {
    const branchSafety = mentionsAny(output, [/default branch/i, /feature branch/i, /explicit/i]);
    scores["Branch Safety"] = branchSafety ? 2 : 0;
    notes["Branch Safety"] = branchSafety
      ? "Acknowledges default-branch safety."
      : "Does not clearly handle default-branch safety.";
  }

  const browserCase = (caseItem.special_constraints || []).some((item) => /browser/i.test(item));
  if (browserCase) {
    const browserProof = mentionsAny(output, [/\$fw:browser-test\b/i, /\/fw:browser-test\b/i, /browser proof/i]);
    scores["Browser Proof Discipline"] = browserProof ? 2 : 0;
    notes["Browser Proof Discipline"] = browserProof
      ? "Requires or offers browser proof for browser-visible work."
      : "Misses browser-proof discipline for a browser-visible case.";
  }

  const spinOfferCase = (caseItem.special_constraints || []).some((item) => /spin-offer/i.test(item));
  const spinOffer =
    mentionsAny(output, [/\$fw:spin\b/i, /\/fw:spin\b/i, /\bspin\b/i]) &&
    mentionsAny(output, [/\bskip\b/i, /\bquick spin\b/i, /\bfull spin\b/i, /\bcandidate\b/i, /\blesson\b/i, /\bcorrection\b/i]);
  scores["Spin Offer Discipline"] = spinOfferCase ? (spinOffer ? 2 : 0) : 2;
  notes["Spin Offer Discipline"] = spinOfferCase
    ? spinOffer
      ? "Offers a bounded post-commit spin choice for a durable lesson."
      : "Does not clearly offer spin as a bounded optional post-commit step."
    : "No post-commit spin offer was required for this case.";

  const architectureStoryCase = (caseItem.special_constraints || []).some((item) => /architecture-story/i.test(item));
  if (architectureStoryCase) {
    const architectureStory = mentionsAtLeast(output, [/architecture/i, /pattern/i, /simplif/i, /maintainability/i, /material/i, /PR-safe/i], 2);
    scores["Commit Honesty"] = architectureStory ? 2 : 0;
    notes["Commit Honesty"] = architectureStory
      ? "Carries only the material architecture or code-quality story."
      : "Does not clearly summarize the material architecture or code-quality story.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicCommit,
};
