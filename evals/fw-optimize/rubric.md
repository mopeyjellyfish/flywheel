# `fw-optimize` Grading Rubric

Score each dimension `0`, `1`, or `2`.

## Dimensions

### Backend Selection

Does it choose the right measurement backend family from the case?

### Environment Separation

Does it treat environment as a separate decision from backend?

### Metric Contract

Does it define metric, baseline, and stop criteria or guardrails?

### Guardrails

Does it protect correctness and reliability, not just speed?

### Attribution Discipline

Does it prefer small, attributable experiments over speculative rewrites?

For model-comparison cases, does it keep the comparison controlled by pinning
the models or snapshots and holding the harness or judge setup constant?

### Workflow Handoff

Does it route successful changes back into review and ship?
