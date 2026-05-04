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

  const verticalCase = (caseItem.special_constraints || []).some((item) => /vertical behavior slice|horizontal reconciliation|batch all tests/i.test(item));
  if (verticalCase) {
    const verticalSignal = mentionsAtLeast(output, [/vertical slice/i, /behavior slice/i, /one slice/i, /slice by slice/i], 2);
    const tddCycleSignal = mentionsAtLeast(output, [/red/i, /green/i, /refactor/i, /test-driven-development/i, /\btdd\b/i], 3);
    const antiHorizontalSignal = mentionsAtLeast(output, [/horizontal/i, /batch/i, /all tests/i, /all service edits/i, /all docs/i, /all config/i, /generated artifacts/i, /reconciliation/i], 2);
    const score = verticalSignal && tddCycleSignal && antiHorizontalSignal ? 2 : verticalSignal || tddCycleSignal ? 1 : 0;
    scores["Vertical Slice Execution"] = score;
    notes["Vertical Slice Execution"] =
      score === 2
        ? "Executes one vertical behavior slice at a time with TDD cycle discipline and rejects horizontal batching."
        : score === 1
          ? "Mentions vertical or TDD execution, but does not fully reject horizontal batching."
          : "Does not clearly execute as vertical behavior slices.";
  } else {
    const verticalSignal = mentionsAny(output, [/vertical slice/i, /behavior slice/i]);
    scores["Vertical Slice Execution"] = verticalSignal ? 2 : 1;
    notes["Vertical Slice Execution"] = verticalSignal
      ? "Mentions vertical slice execution."
      : "Vertical slice execution was not central to this case.";
  }

  const reviewSignal = mentionsAny(output, [/\$fw:review\b/i, /\/fw:review\b/i, /\breview\b/i]);
  const commitSignal = mentionsAny(output, [/\$fw:commit\b/i, /\/fw:commit\b/i, /\bcommit\b/i, /\bpull request\b/i, /\bPR\b/i]);
  const closureScore = reviewSignal && commitSignal ? 2 : reviewSignal || commitSignal ? 1 : 0;
  scores["Workflow Closure"] = closureScore;
  notes["Workflow Closure"] =
    closureScore === 2
      ? "Carries work forward into review and commit while keeping helper-stage closure visible when needed."
      : closureScore === 1
        ? "Only part of the expected review -> commit closure is explicit."
        : "Does not clearly preserve review and commit as the downstream path.";

  const browserCase = (caseItem.special_constraints || []).some((item) => /browser/i.test(item));
  if (browserCase) {
    const browserAware = mentionsAny(output, [/\$fw:browser-test\b/i, /\/fw:browser-test\b/i]);
    scores["Browser Proof Awareness"] = browserAware ? 2 : 0;
    notes["Browser Proof Awareness"] = browserAware
      ? "Calls for browser proof on browser-visible work."
      : "Misses browser-proof handoff on a browser-visible case.";
  }

  const architectureCase = (caseItem.special_constraints || []).some((item) => /architecture-bearing|abstraction-heavy/i.test(item));
  if (architectureCase) {
    const architectureAware = mentionsAtLeast(output, [/architecture/i, /pattern/i, /boundary/i, /simplify/i, /maintainability/i], 2);
    scores["Repo Grounding"] = architectureAware ? 2 : scores["Repo Grounding"];
    notes["Repo Grounding"] = architectureAware
      ? "Preserves planned architecture or code-quality constraints during execution."
      : notes["Repo Grounding"];
  }

  return { scores, notes };
}

module.exports = {
  deterministicWork,
};
