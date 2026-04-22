# `fw-review` Grading Rubric

Score each dimension `0`, `1`, or `2`.

## Dimensions

### Mode Handling

Does the response respect explicit mode cues such as `mode:headless`?

### Review Structure

Does it clearly look like a review workflow with findings, reviewers, or a
verdict? Strong passes should make the selected reviewer/persona set visible
when the diff evidence justifies it.

### Risk Focus

Does it prioritize bugs, regressions, missing tests, and merge risk?

### Requirements Completeness

When a plan is provided, does it account for plan-backed completeness checks?

### Specialist Suite

When the diff is pattern-heavy or boundary-changing, does it make the relevant
specialist reviewer set visible without turning the report into a scorecard?

### Browser Proof Handoff

When browser-visible behavior changed, does it offer browser proof before commit?

### Research Support

When judging the diff depends on current external guidance, does it allow
targeted research or saved research-brief reuse without turning review into a
standalone research stage?

Strong passes attach that research to findings or verdict reasoning rather than
leaving it as detached background.

### Commit Handoff

Does it preserve commit as the downstream step?

### Review Budget Discipline

Does it keep the reviewer set bounded and justified by diff or repo evidence
rather than assuming maximal fan-out by default?
