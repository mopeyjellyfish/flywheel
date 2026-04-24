# `fw-test-driven-development` Grading Rubric

Score each dimension `0`, `1`, or `2`.

## Dimensions

### Trigger Discipline

Does the response treat behavior changes, bug fixes, public-contract changes,
and refactors as TDD-required unless an explicit exception applies?

### Red Proof

Does it require a failing test or equivalent executable reproducer before
implementation, and does it verify that the failure is expected?

### Green Minimality

Does it keep the implementation to the smallest change needed to turn the red
proof green?

### Refactor Safety

Does it refactor only after green and rerun the target proof afterward?

### Dirty Tree Safety

Does it protect pre-existing and user-authored dirty changes, discarding only
agent-authored implementation for the current unit when restarting from RED?

### Exception Handling

When TDD is skipped, does it state a valid exception and a credible alternate
verification path?

### Evidence Handoff

Does it end with compact red, green, refactor, and broader-check evidence, or a
clear TDD exception record?

Strong passes include a short sanitized output summary when command output,
coverage, or report deltas materially help later review or commit, while
suppressing full logs and sensitive output.
