const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicDebug(caseItem, output) {
  const scores = {};
  const notes = {};

  const causalSignal = mentionsAny(output, [/causal chain/i, /root cause/i, /trigger/i, /symptom/i]);
  scores["Causal Chain"] = causalSignal ? 2 : 0;
  notes["Causal Chain"] = causalSignal
    ? "Mentions causal-chain or root-cause reasoning."
    : "Does not clearly describe a causal chain.";

  const redSignal = mentionsAny(output, [/failing test/i, /red signal/i, /reproducer/i]);
  scores["Red Signal"] = redSignal ? 2 : 0;
  notes["Red Signal"] = redSignal
    ? "Calls for a failing test or equivalent reproducer."
    : "Does not clearly require a red signal.";

  const issueCase = (caseItem.special_constraints || []).some((item) => /issue/i.test(item));
  if (issueCase) {
    const issueAware =
      mentionsAny(output, [/gh issue view/i, /https:\/\/github\.com\/.+\/issues\/\d+/i, /\b[a-z0-9_.-]+\/[a-z0-9_.-]+#\d+\b/i, /(^|\s)#\d+\b/i]) ||
      (mentionsAny(output, [/\bissue\b/i, /\breport\b/i]) &&
        mentionsAtLeast(output, [/reported symptoms?/i, /expected behavior/i, /reproduction steps?/i, /environment notes?/i], 2));
    scores["Issue Intake"] = issueAware ? 2 : 0;
    notes["Issue Intake"] = issueAware
      ? "Mentions issue-first intake."
      : "Does not clearly start from the issue report.";
  }

  const designCase = (caseItem.special_constraints || []).some((item) => /design/i.test(item));
  if (designCase) {
    const upstreamRoute = mentionsAny(output, [/\$fw:brainstorm\b/i, /\/fw:brainstorm\b/i, /\$fw:plan\b/i, /\/fw:plan\b/i]);
    scores["Upstream Routing"] = upstreamRoute ? 2 : 0;
    notes["Upstream Routing"] = upstreamRoute
      ? "Routes design problems back upstream."
      : "Does not clearly route a design problem upstream.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicDebug,
};
