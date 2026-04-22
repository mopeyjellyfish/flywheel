# `fw-work` Grading Rubric

Score each dimension `0`, `1`, or `2`.

## Dimensions

### Execution Discipline

Does the response act like execution rather than analysis-only planning?

### Repo Grounding

Does it rely on repo truth, commands, or patterns?

### Continuous Validation

Does it make checks, tests, or verification part of the work loop?

For architecture-bearing work, strong passes preserve planned boundary or
pattern constraints and use simplification or maintainability pressure when the
implementation starts to overgrow.

### Runtime Support Awareness

When runtime-sensitive, does it acknowledge observability or service-readiness?

### Browser Proof Awareness

When browser-visible, does it call for browser proof before completion?

### Workflow Closure

Does it preserve the default path into review and commit while keeping helper-stage handoffs honest?
Strong passes also keep task state and any plan-unit checkboxes synchronized by
the time execution closes.

### Delegation Discipline

When delegation or parallel work is mentioned, is it bounded, host-aware, and
used only for independent work?
Strong passes also use explicit plan-unit metadata such as dependencies and
`parallel-ready` posture rather than hand-waving about parallelism.

### Restraint

Does it keep execution moving without adding unnecessary ceremony for clear or
trivial work?
