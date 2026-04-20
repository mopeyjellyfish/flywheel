const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicSetup(caseItem, output) {
  const scores = {};
  const notes = {};

  const groundingSignal = mentionsAtLeast(output, [/AGENTS\.md/i, /manifest/i, /scripts/i, /repo truth/i, /workflow/i], 1);
  scores["Repo Grounding"] = groundingSignal ? 2 : 0;
  notes["Repo Grounding"] = groundingSignal
    ? "Grounds setup in repo truth."
    : "Does not clearly ground setup in repo truth.";

  const classificationSignal = mentionsAtLeast(output, [/required now/i, /recommended/i, /optional/i], 2);
  scores["Surface Classification"] = classificationSignal ? 2 : 0;
  notes["Surface Classification"] = classificationSignal
    ? "Classifies required, recommended, or optional setup."
    : "Does not clearly classify setup surfaces.";

  const securityCase = (caseItem.special_constraints || []).some((item) => /security/i.test(item));
  if (securityCase) {
    const securitySignal = mentionsAtLeast(output, [/trusted MCP/i, /sandbox/i, /devcontainer/i, /permission/i], 2);
    scores["Security Posture"] = securitySignal ? 2 : 0;
    notes["Security Posture"] = securitySignal
      ? "Mentions trusted MCP or isolation posture."
      : "Does not clearly cover security posture.";
  }

  const browserCase = (caseItem.special_constraints || []).some((item) => /browser/i.test(item));
  if (browserCase) {
    const browserSignal = mentionsAny(output, [/playwright-cli/i, /npx --no-install playwright-cli/i, /browser proof is currently blocked/i]);
    scores["Browser Readiness"] = browserSignal ? 2 : 0;
    notes["Browser Readiness"] = browserSignal
      ? "Covers browser-readiness setup."
      : "Does not clearly cover browser readiness.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicSetup,
};
