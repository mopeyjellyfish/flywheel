---
name: tdd
description: "Enforce red-green-refactor for feature work, bug fixes, refactors, and behavior changes."
metadata:
  argument-hint: "[implementation unit, bug, or behavior change]"
---

# Test-Driven Development

`$fw:tdd` is Flywheel's strict helper for behavior-bearing implementation. It
is normally loaded by `$fw:work` or `$fw:debug`, not used as a separate visible
lifecycle stage.

Use it to prove one behavior at a time: write a failing test, watch it fail for
the expected reason, write the smallest implementation that makes it pass, then
refactor while the test stays green.

## Reference Loading Map

Do not preload every reference. Load only what the current cycle needs:

- Read `references/tests.md` when choosing the test shape or repairing tests
  that are coupled to implementation details.
- Read `references/mocking.md` when deciding whether a mock is valid or where
  the system boundary belongs.
- Read `references/interface-design.md` when the public interface is hard to
  test without changing production design.
- Read `references/deep-modules.md` when the current cycle exposes shallow
  modules or too much implementation detail in the interface.
- Read `references/refactoring.md` after green when cleanup is warranted.

## Philosophy

Tests should verify behavior through public interfaces, not implementation
details. Code can change entirely; behavior-focused tests should survive that
change.

Good tests are integration-style: they exercise real code paths through public
APIs. They describe what the system does, not how it does it. A good test reads
like a specification: "user can checkout with valid cart" names the capability
that exists.

Bad tests are coupled to implementation. They mock internal collaborators, test
private methods, assert call counts, or verify behavior by bypassing the public
interface. The warning sign is a test that fails after a refactor even though
observable behavior did not change.

## Anti-Pattern: Horizontal Slices

Do not write all tests first, then all implementation. That is horizontal
slicing: treating RED as "write all tests" and GREEN as "write all code."

Horizontal slicing produces weak tests:

- tests written in bulk test imagined behavior, not actual behavior
- tests drift toward data structures, function signatures, and private shape
  instead of user-facing behavior
- tests can pass when behavior breaks and fail when behavior is fine
- the test structure gets committed before the implementation has taught the
  right interface

Use vertical tracer bullets instead: one test -> one implementation -> repeat.
Each test responds to what the previous cycle taught.

```text
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED -> GREEN: test1 -> impl1
  RED -> GREEN: test2 -> impl2
  RED -> GREEN: test3 -> impl3
  ...
```

## When To Use

Use this skill before implementation when any of these are true:

- a plan unit has `Test posture: tdd`
- the user or repo policy asks for TDD, test-first, or red-green-refactor
- the work changes externally observable behavior, a public contract, a bug
  fix, a regression-prone path, or a refactor that should preserve behavior

Use a different posture only when the exception is explicit:

- generated code
- pure configuration or dependency metadata
- documentation-only changes
- trivial renames or mechanical edits
- pure styling/text changes with no behavior to unit-test
- throwaway prototypes the user intentionally accepts

Record the exception and the remaining verification path. Do not silently skip
TDD for behavior-bearing work.

## Hard Rules

- No production implementation for the current unit before a red signal.
- Do not write the test and implementation in the same step.
- Verify the red test fails for the expected reason before writing code.
- Implement only enough code for the current red test to pass.
- Refactor only after the target test is green, then rerun the target test.
- Test behavior through public interfaces, command surfaces, API contracts, or
  real integration chains where practical.
- Mock only true system boundaries. Avoid mocks of internal collaborators.
- Do not batch tests horizontally across future behaviors.
- Keep tests coupled to observable behavior, not private methods, call order,
  internal data shapes, or implementation names.
- Protect user work. Never delete or revert pre-existing or user-authored dirty
  changes to enforce this skill.

If implementation code for the current unit was written before the red signal:

1. Identify only the agent-authored implementation hunks for this unit.
2. Discard those hunks or move them out of the way without touching user work.
3. Restart from RED.
4. If ownership is unclear, stop and ask before deleting anything.

Do not use destructive git commands such as `git reset --hard` or broad
checkout/revert commands for TDD cleanup.

## Workflow

### 1. Scope One Behavior

Name the behavior, public contract, bug, or preservation claim under test.
Find the nearest existing test idiom before creating a new pattern.

When exploring the codebase, use the project's domain glossary so test names
and interface vocabulary match the project's language. Respect ADRs and
decision records in the area being changed.

Before RED, make or update a compact behavior/test list:

- prioritize critical paths, risky logic, regressions, and public contracts
- skip exhaustive edge-case collection until the main behavior works
- identify opportunities for deep modules and testable interfaces
- choose the next test because it should change the implementation or protect a
  real contract
- note interface questions that need user input before writing the test

If the plan already provides `Red signal` and `Green signal`, use them unless
repo truth proves a better target. If the plan is silent, choose the narrowest
test or reproducer that can fail before the change and pass after it.

### 2. RED

Write one failing test or equivalent executable reproducer.

Run the narrowest useful command and confirm:

- it fails
- the failure is expected
- the failure proves missing or broken behavior, not a typo or bad setup

If the test passes, the test is not proving the new behavior. Fix the test.
If it errors for the wrong reason, fix the test or setup and rerun until it is a
valid red signal.

### 3. GREEN

Write the smallest implementation that makes the red signal pass.

Run the same target command until it passes. Do not add adjacent features,
cleanup, or abstractions while the target is still red.

Do not anticipate future tests. Future behavior gets its own red signal after
the current tracer bullet is green.

### 4. REFACTOR

Only after GREEN, clean the implementation if cleanup is useful.

Prefer refactors that remove duplication, improve names, simplify the public
interface, deepen a module behind a small interface, or move external-system
complexity behind an explicit boundary. Never refactor while red.

Rerun the target command after each meaningful refactor step. Run broader
relevant checks when the unit is complete or the changed surface warrants it.

### 5. Next Cycle Decision

After the current tracer bullet is green and refactored:

1. mark the behavior/test list item done
2. choose the next highest-value behavior
3. decide whether the next behavior needs another executable test case, a
   characterization test, or an explicit TDD exception
4. stop when the planned slice is proven instead of expanding the slice
   opportunistically

### 6. Report Evidence

End the unit with a compact evidence block:

```text
TDD evidence
- Red: <command> -> <expected failure>
- Green: <command> -> pass
- Refactor: <command> -> pass, or no refactor
- Broader checks: <commands/results or n/a>
- Output summary: <optional 1-6 lines of sanitized failure/pass/coverage output>
```

Use `Output summary` when the raw command output helps later review or commit
understand the proof. Keep it condensed: include the failing assertion or error
shape for RED, the pass count for GREEN, and coverage or report deltas only
when they are material. Do not paste full logs, stack traces, secrets, tokens,
cookies, PII, or unrelated warnings.

If an exception was used, report:

```text
TDD exception
- Reason: <generated/config/docs/mechanical/prototype/etc.>
- Verification: <how completion was still proven>
```
