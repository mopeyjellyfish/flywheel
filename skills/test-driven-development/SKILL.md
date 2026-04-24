---
name: test-driven-development
description: "Enforce red-green-refactor for behavior changes. Use before implementing feature, bugfix, refactor, or test-first unit."
metadata:
  argument-hint: "[implementation unit, bug, or behavior change]"
---

# Test-Driven Development

`$fw:test-driven-development` is Flywheel's strict helper for behavior-bearing
implementation. It is normally loaded by `$fw:work` or `$fw:debug`, not used as
a separate visible lifecycle stage.

The goal is to prove one behavior at a time: write a failing test, watch it fail
for the expected reason, write the smallest implementation that makes it pass,
then refactor while the test stays green.

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

### 4. REFACTOR

Only after GREEN, clean the implementation if cleanup is useful.

Rerun the target command after refactoring. Run broader relevant checks when
the unit is complete or the changed surface warrants it.

### 5. Report Evidence

End the unit with a compact evidence block:

```text
TDD evidence
- Red: <command> -> <expected failure>
- Green: <command> -> pass
- Refactor: <command> -> pass, or no refactor
- Broader checks: <commands/results or n/a>
```

If an exception was used, report:

```text
TDD exception
- Reason: <generated/config/docs/mechanical/prototype/etc.>
- Verification: <how completion was still proven>
```
