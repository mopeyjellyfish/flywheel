const { mentionsAny } = require("./shared.cjs");

function deterministicPolish(caseItem, output) {
  const scores = {};
  const notes = {};

  const loopSignal = mentionsAny(output, [/playwright-cli/i, /\bheaded\b/i, /\bsnapshot\b/i, /\bscreenshot\b/i, /\bconsole\b/i]);
  scores["Browser Loop"] = loopSignal ? 2 : 0;
  notes["Browser Loop"] = loopSignal
    ? "Mentions the interactive browser loop."
    : "Does not clearly describe a browser polish loop.";

  const blockedCase = (caseItem.special_constraints || []).some((item) => /missing-playwright/i.test(item));
  if (blockedCase) {
    const blockedSignal = mentionsAny(output, [/blocked/i, /playwright-cli.*not found/i, /\$fw:setup browser\b/i, /\/fw:setup browser\b/i]);
    scores["Blocked Handling"] = blockedSignal ? 2 : 0;
    notes["Blocked Handling"] = blockedSignal
      ? "Routes missing browser tooling through setup."
      : "Does not clearly handle missing browser tooling.";
  }

  const proofSignal = mentionsAny(output, [/\$flywheel:browser-test\b/i, /\/fw:browser-test\b/i]);
  scores["Browser Proof Closure"] = proofSignal ? 2 : 0;
  notes["Browser Proof Closure"] = proofSignal
    ? "Ends with browser proof."
    : "Does not clearly call for a closing browser proof pass.";

  const handoffSignal = mentionsAny(output, [/\$flywheel:review\b/i, /\/fw:review\b/i]) &&
    mentionsAny(output, [/\$flywheel:ship\b/i, /\/fw:ship\b/i]);
  scores["Workflow Handoff"] = handoffSignal ? 2 : 0;
  notes["Workflow Handoff"] = handoffSignal
    ? "Carries polish forward into review and ship."
    : "Does not clearly hand off polish into review and ship.";

  return { scores, notes };
}

module.exports = {
  deterministicPolish,
};
