const { mentionsAny } = require("./shared.cjs");

function deterministicConventionalCommit(caseItem, output) {
  const scores = {};
  const notes = {};

  const headerSignal = mentionsAny(output, [
    /^(feat|fix|refactor|perf|docs|test|build|ci|chore|revert)(\([^)]+\))?!?: .+/im,
    /proposed commit header/i,
  ]);
  scores["Commit Shape"] = headerSignal ? 2 : 0;
  notes["Commit Shape"] = headerSignal
    ? "Includes a conventional commit header."
    : "Does not clearly provide a conventional commit header.";

  if (caseItem.expected_type) {
    const typeSignal = new RegExp(`\\b${caseItem.expected_type}(\\(|!|:)`, "i").test(output);
    scores["Type Selection"] = typeSignal ? 2 : 0;
    notes["Type Selection"] = typeSignal
      ? `Uses expected type ${caseItem.expected_type}.`
      : `Does not clearly use expected type ${caseItem.expected_type}.`;
  }

  const breakingCase = (caseItem.special_constraints || []).some((item) => /breaking/i.test(item));
  if (breakingCase) {
    const gateSignal = mentionsAny(output, [
      /ask/i,
      /user approval/i,
      /explicit approval/i,
      /breaking change/i,
      /BREAKING CHANGE:/i,
    ]);
    scores["Breaking Change Gate"] = gateSignal ? 2 : 0;
    notes["Breaking Change Gate"] = gateSignal
      ? "Acknowledges the explicit approval gate for breaking changes."
      : "Does not clearly gate breaking changes behind user approval.";
  }

  const outputSignal = mentionsAny(output, [/body/i, /footer/i, /rationale/i]);
  scores["Output Shape"] = outputSignal ? 2 : 1;
  notes["Output Shape"] = outputSignal
    ? "Mentions body, footer, or rationale."
    : "Provides a header but little additional structure.";

  return { scores, notes };
}

module.exports = {
  deterministicConventionalCommit,
};
