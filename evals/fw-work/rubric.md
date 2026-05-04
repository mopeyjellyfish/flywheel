# `fw-work` Grading Rubric

Score each dimension `0`, `1`, or `2`.

## Dimensions

### Execution Discipline

Does the response act like execution rather than analysis-only planning?
Strong passes treat `fw:work` as an execution router plus completion gate:
specialist skills are loaded at activation points instead of duplicating their
full doctrine in the main work response.

### Repo Grounding

Does it rely on repo truth, commands, or patterns?

### Continuous Validation

Does it make checks, tests, or verification part of the work loop?
Strong passes load or follow `test-driven-development` for `tdd` units, verify
the red signal before implementation, keep the green change minimal, and report
red/green/refactor evidence.

For architecture-bearing work, strong passes preserve planned boundary or
pattern constraints and use simplification or maintainability pressure when the
implementation starts to overgrow.

### Vertical Slice Execution

Does execution complete one planned vertical behavior slice at a time rather
than batching all tests, all service edits, all docs, all config, or all
generated artifacts across the whole plan? Strong passes keep each slice on a
red -> green -> refactor loop, run the slice's proof before moving on, and only
use horizontal prep or reconciliation when the plan justifies it.

### Runtime Support Awareness

When runtime-sensitive, does it acknowledge observability or service-readiness?

### Browser Proof Awareness

When browser-visible, does it call for browser proof before completion?

### Workflow Closure

Does it preserve the default path into review and commit while keeping helper-stage handoffs honest?
Strong passes also keep task state and any plan-unit checkboxes synchronized by
the time execution closes, then close with a handoff card that names readiness,
evidence, open decisions, and the next stage.

### Plan Approval Gate

When execution starts from a plan or specification without an explicit same-turn
implementation request or prior plan-handoff selection, does it stop and confirm
that the user is happy with the artifact as the implementation basis before
editing? Strong passes call the host question tool when available and offer
portable choices to start work, review/deepen first, or pause.

### Delegation Discipline

When delegation or parallel work is mentioned, is it bounded, host-aware, and
used only for independent work?
Strong passes also use explicit plan-unit metadata such as dependencies and
`parallel-ready` posture rather than hand-waving about parallelism.

### Restraint

Does it keep execution moving without adding unnecessary ceremony for clear or
trivial work?
