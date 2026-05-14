# `fw-deepen-plan` Grading Rubric

Score each dimension `0`, `1`, or `2`.

## Dimensions

### Plan Targeting

Does the response clearly deepen an existing plan rather than starting over?

### Document Review Integration

Does it incorporate `document-review` or equivalent critique as part of the
strengthening loop and return the plan to a reviewed state?

### Plan Grilling

Does it interrogate the plan until material ambiguity is resolved rather than
asking one broad confirmation? Strong passes inspect repo and docs before
asking, challenge contradictions, stress-test concrete scenarios, ask one
recommended material question at a time, update the plan after answers, and
continue until the remaining blockers are explicit.

### Source And Slice Alignment

Does it compare the plan against its source spec, requirements doc, design doc,
or issue body and tighten implementation units into vertical slices? Strong
passes prevent invented scope, carry acceptance criteria forward, mark true
horizontal exceptions, and make TDD red/green proof points concrete for
behavior-bearing slices.

### Repo Grounding

Does it ground plan edits in repo truth, tests, patterns, or prior solutions?

Strong passes also search `docs/solutions/` for active prior learnings before
asking or deciding when the plan touches a known workflow, support, verification,
or repo-maintenance pattern.

### Context And Decision Capture

Does it inspect context docs and decision records before changing terminology,
boundaries, workflow contracts, architecture, or product scope? Strong passes
route terminology conflicts or ADR-worthy tradeoffs through `fw:decision`, keep
context docs domain-facing, and offer `fw:spin` only for resolved reusable repo
lessons or durable user corrections.

### Work Handoff

Does it keep the plan moving toward `fw-work`, while still allowing another
deepen pass when the reviewed plan is not ready? Strong passes call the host
question tool when available and treat `fw-work` as gated on the user's
confirmation that the strengthened plan is accepted for implementation.

### Runtime Awareness

For runtime-risky plans, does it add rollout, observability, or blast-radius
awareness?
