const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicShip(caseItem, output) {
  const scores = {};
  const notes = {};

  const shipPath = mentionsAny(output, [/commit/i, /push/i, /\bPR\b/i, /pull request/i]);
  scores["Shipping Path"] = shipPath ? 2 : 0;
  notes["Shipping Path"] = shipPath
    ? "Mentions commit, push, or PR flow."
    : "Does not clearly describe the shipping path.";

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
    const browserProof = mentionsAny(output, [/\$fw-browser-test\b/i, /\/fw-browser-test\b/i, /browser proof/i]);
    scores["Browser Proof Discipline"] = browserProof ? 2 : 0;
    notes["Browser Proof Discipline"] = browserProof
      ? "Requires or offers browser proof for browser-visible work."
      : "Misses browser-proof discipline for a browser-visible case.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicShip,
};
