const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicWork(caseItem, output) {
  const scores = {};
  const notes = {};

  const executeSignal =
    mentionsAny(output, [/\bexecute\b/i, /\bimplement\b/i, /\bedit\b/i, /\bmodify\b/i]) &&
    mentionsAtLeast(output, [/\btest/i, /\blint/i, /\bcheck/i, /verification/i, /\bfiles?\b/i, /\bcommit\b/i], 1);
  scores["Execution Discipline"] = executeSignal ? 2 : 0;
  notes["Execution Discipline"] = executeSignal
    ? "Sounds like execution rather than pure planning."
    : "Does not clearly adopt an execution posture.";

  const validationSignal = mentionsAtLeast(output, [/\btest/i, /\blint/i, /\bcheck/i, /verification/i], 2);
  scores["Continuous Validation"] = validationSignal ? 2 : 0;
  notes["Continuous Validation"] = validationSignal
    ? "Mentions checks or continuous validation."
    : "Does not clearly mention checks or validation.";

  const closureSignal = mentionsAny(output, [/\$fw-review\b/i, /\/fw-review\b/i, /\/fw:review\b/i]) &&
    mentionsAny(output, [/\$fw-ship\b/i, /\/fw-ship\b/i, /\/fw:ship\b/i]);
  scores["Workflow Closure"] = closureSignal ? 2 : 0;
  notes["Workflow Closure"] = closureSignal
    ? "Carries work forward into review and ship."
    : "Does not clearly preserve review and ship as the downstream path.";

  const browserCase = (caseItem.special_constraints || []).some((item) => /browser/i.test(item));
  if (browserCase) {
    const browserAware = mentionsAny(output, [/\$fw-browser-test\b/i, /\/fw-browser-test\b/i]);
    scores["Browser Proof Awareness"] = browserAware ? 2 : 0;
    notes["Browser Proof Awareness"] = browserAware
      ? "Calls for browser proof on browser-visible work."
      : "Misses browser-proof handoff on a browser-visible case.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicWork,
};
