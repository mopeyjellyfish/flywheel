const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicTdd(caseItem, output) {
  const scores = {};
  const notes = {};
  const constraints = caseItem.special_constraints || [];

  const triggerSignal = mentionsAny(output, [
    /\bTDD\b/i,
    /red-green-refactor/i,
    /test-first/i,
    /behavior change requires/i,
    /unless an explicit exception/i,
  ]);
  scores["Trigger Discipline"] = triggerSignal ? 2 : 0;
  notes["Trigger Discipline"] = triggerSignal
    ? "Treats behavior-bearing work as TDD-required unless an exception applies."
    : "Does not clearly trigger TDD for behavior-bearing work.";

  const redSignal = mentionsAtLeast(output, [
    /\bred\b/i,
    /failing test/i,
    /\breproducer\b/i,
    /before implementation/i,
    /expected reason/i,
  ], 2);
  scores["Red Proof"] = redSignal ? 2 : 0;
  notes["Red Proof"] = redSignal
    ? "Requires a red test or reproducer before implementation."
    : "Does not clearly require expected red proof before implementation.";

  const greenSignal = mentionsAtLeast(output, [
    /\bgreen\b/i,
    /\bminimal\b/i,
    /smallest/i,
    /\bpass(?:es|ing)?\b/i,
  ], 2);
  scores["Green Minimality"] = greenSignal ? 2 : 0;
  notes["Green Minimality"] = greenSignal
    ? "Keeps implementation focused on turning the current red proof green."
    : "Does not clearly keep green implementation minimal.";

  const verticalSignal = mentionsAtLeast(output, [
    /vertical/i,
    /tracer bullet/i,
    /one behavior/i,
    /one test/i,
    /horizontal/i,
    /all tests/i,
  ], 2);
  scores["Vertical Slice Discipline"] = verticalSignal ? 2 : 0;
  notes["Vertical Slice Discipline"] = verticalSignal
    ? "Uses one vertical behavior slice at a time and rejects horizontal batching."
    : "Does not clearly enforce vertical TDD slices.";

  const incrementalSignal = mentionsAtLeast(output, [
    /behavior\/test list/i,
    /prioriti[sz]e/i,
    /next highest-value/i,
    /generalize/i,
    /executable (?:test )?cases?/i,
  ], 2);
  scores["Incremental Design Discipline"] = incrementalSignal ? 2 : 0;
  notes["Incremental Design Discipline"] = incrementalSignal
    ? "Lets design emerge from prioritized executable cases."
    : "Does not clearly use prioritized incremental design pressure.";

  const refactorSignal = mentionsAtLeast(output, [
    /refactor/i,
    /after green/i,
    /rerun/i,
  ], 2);
  scores["Refactor Safety"] = refactorSignal ? 2 : 0;
  notes["Refactor Safety"] = refactorSignal
    ? "Refactors only after green and reruns proof."
    : "Does not clearly protect refactoring with a green proof.";

  const dirtyTreeExpected = constraints.some((item) => /dirty|destructive|reset|user-authored/i.test(item));
  const dirtyTreeSignal = mentionsAtLeast(output, [
    /user-authored/i,
    /dirty changes/i,
    /agent-authored/i,
    /do not use destructive/i,
    /reset --hard/i,
    /protect/i,
  ], dirtyTreeExpected ? 2 : 1);
  scores["Dirty Tree Safety"] = dirtyTreeSignal ? 2 : dirtyTreeExpected ? 0 : 1;
  notes["Dirty Tree Safety"] = dirtyTreeSignal
    ? "Protects existing user work and avoids destructive cleanup."
    : dirtyTreeExpected
      ? "Does not clearly protect dirty user work in a restart case."
      : "Dirty tree handling was not central to this case.";

  const exceptionExpected = constraints.some((item) => /exception/i.test(item));
  const exceptionSignal = mentionsAtLeast(output, [
    /exception/i,
    /not warranted/i,
    /alternate verification/i,
    /verification path/i,
    /not silently skip/i,
  ], exceptionExpected ? 2 : 1);
  scores["Exception Handling"] = exceptionSignal ? 2 : exceptionExpected ? 0 : 1;
  notes["Exception Handling"] = exceptionSignal
    ? "Records TDD exceptions with a verification path."
    : exceptionExpected
      ? "Does not clearly handle the TDD exception case."
      : "Exception handling was not central to this case.";

  const evidenceSignal = mentionsAtLeast(output, [
    /TDD evidence/i,
    /\bred\b/i,
    /\bgreen\b/i,
    /refactor/i,
    /broader checks/i,
    /output summary/i,
  ], 3);
  scores["Evidence Handoff"] = evidenceSignal ? 2 : 0;
  notes["Evidence Handoff"] = evidenceSignal
    ? "Carries red, green, refactor, and verification evidence forward."
    : "Does not clearly hand off TDD evidence.";

  return { scores, notes };
}

module.exports = {
  deterministicTdd,
};
