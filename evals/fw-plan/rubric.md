# `fw-plan` Grading Rubric

Score each dimension `0`, `1`, or `2`.

## Dimensions

### Planning Discipline

Does the response stay in planning instead of drifting into implementation?
Strong passes also break the work into atomic implementation units instead of
vague phases.

When research is involved, strong passes stay plan-shaped rather than turning
into a research report.

### Repo Grounding

Does it sound grounded in repo files, patterns, or validation surfaces rather
than generic product advice?

When current published guidance matters, strong passes reuse or explicitly
invoke a matching `docs/research/` brief when available and keep repo truth
distinct from external guidance. They also integrate the research takeaway into
plan decisions rather than drifting into a research report.

### Test Strategy

Does it include testing posture, verification, or red/green expectations?
Strong passes default behavior-changing units to `tdd`, provide concrete red
and green proof points, and use non-TDD postures only with explicit exception
reasoning.

For architecture-bearing work, strong passes also make the relevant boundary or
pattern decisions explicit enough that work does not have to rediscover them.
For execution-shape-sensitive work, strong passes also make dependencies and
serial vs `parallel-ready` posture explicit enough that `work` can track units
one-for-one.

### Runtime Awareness

For runtime-risky work, does it account for observability, rollout, or blast
radius?

### Workflow Handoff

Does it preserve source review when useful, then planning -> document-review ->
user choice between addressing findings, deepening, and work as the next stage,
rather than sliding into execution automatically? Strong handoff should also
make it clear what changed during planning, what the plan review found, whether
anything should be pushed back to questions or planning, and what execution
would start with.
Strong passes treat the plan-to-work choice as an explicit user confirmation
that they are happy with the reviewed plan as the implementation basis, using
the host question tool when available instead of a markdown menu.
When mixed execution modes matter, strong handoff also makes the first serial
unit or first eligible parallel-ready batch obvious.

### Restraint

Is it right-sized instead of bloated?

### Interaction Quality

Does it use structured, bounded choice surfaces and avoid raw-number reply UX
or over-questioning? Strong passes explicitly call the host question tool when
available, keep the explicit options portable across Claude Code and Codex, and
use chat menus only as the fallback path.
