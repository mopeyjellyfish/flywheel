# `architecture-strategy` Grading Rubric

Score each dimension `0`, `1`, or `2`.

## Dimensions

### Repo Truth

Does the response ground the architecture advice in current repo or system
truth?

### Boundary Judgment

Does it identify the actual ownership, dependency, or integration boundary
being decided?

### Pattern Posture

Does it use named architectural or reliability patterns only when they solve a
concrete seam or failure mode?

### Right-Sizing

Does it compare lighter and heavier options and recommend the minimum durable
shape?

### Deepening Quality

When the task asks to improve architecture, does it identify shallow-module or
leaky-seam opportunities, use module/interface/depth/locality/leverage language,
apply deletion-test reasoning, and keep final interface design until after a
candidate is selected? For boundary-only tasks, score this dimension as strong
when the response does not force an irrelevant deepening pass.
