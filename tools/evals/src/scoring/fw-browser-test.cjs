const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicBrowserTest(caseItem, output) {
  const scores = {};
  const notes = {};

  const capabilitySignal = mentionsAny(output, [/playwright-cli/i, /npx --no-install playwright-cli/i]);
  scores["Browser Capability"] = capabilitySignal ? 2 : 0;
  notes["Browser Capability"] = capabilitySignal
    ? "Mentions the browser capability check."
    : "Does not clearly mention browser capability setup.";

  const blockedCase = (caseItem.special_constraints || []).some((item) => /missing-playwright/i.test(item));
  if (blockedCase) {
    const blockedSignal = mentionsAny(output, [/blocked/i, /playwright-cli.*not found/i, /\$fw:setup browser\b/i, /\/fw:setup browser\b/i]);
    scores["Blocked Handling"] = blockedSignal ? 2 : 0;
    notes["Blocked Handling"] = blockedSignal
      ? "Routes missing browser tooling through setup."
      : "Does not clearly handle missing browser tooling.";
  }

  const evidenceSignal = mentionsAtLeast(output, [/screenshot/i, /snapshot/i, /redact/i, /dummy/i, /token/i, /cookie/i], 2);
  scores["Evidence Hygiene"] = evidenceSignal ? 2 : 0;
  notes["Evidence Hygiene"] = evidenceSignal
    ? "Mentions evidence handling and sensitive-data hygiene."
    : "Does not clearly address evidence hygiene.";

  const handoffSignal = mentionsAny(output, [/\$fw:review\b/i, /\/fw:review\b/i, /\$fw:commit\b/i, /\/fw:commit\b/i]);
  scores["Workflow Handoff"] = handoffSignal ? 2 : 0;
  notes["Workflow Handoff"] = handoffSignal
    ? "Carries browser proof into review or commit."
    : "Does not clearly hand off browser proof downstream.";

  return { scores, notes };
}

module.exports = {
  deterministicBrowserTest,
};
