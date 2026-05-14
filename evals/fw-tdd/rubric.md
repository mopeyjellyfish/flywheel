# `fw-tdd` Grading Rubric

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

### Vertical Slice Discipline

Does it reject horizontal RED-all-tests/GREEN-all-code execution and instead
work in tracer bullets: one observable behavior test, one minimal
implementation, then repeat? Strong passes test through public interfaces or
real chains where practical and avoid mocks of internal collaborators.

### Incremental Design Discipline

Does it keep a prioritized behavior/test list, pick the next highest-value
behavior, and let design emerge from small verified executable test cases or
reproducers? Strong passes use the smallest credible route to green, generalize
only when additional executable cases justify it, and treat refactoring as
removing duplication and improving interfaces after the bar is green.

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
