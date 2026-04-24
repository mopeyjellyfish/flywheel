# `fw-brainstorm` Grading Rubric

Score each dimension `0`, `1`, or `2`.

## Dimensions

### Requirements Focus

Does the response sharpen requirements, success criteria, and scope through
collaborative questions and bounded choice surfaces rather than silent
assumptions?

### Scope Assessment

Does it right-size the brainstorming depth?

### Artifact Discipline

Does it preserve a durable brainstorm artifact under `docs/brainstorms/` and
leave a checkpoint summary the user can correct before planning?

When current published guidance materially changes the requirements, strong
passes either reuse a matching `docs/research/` brief or explicitly say they
are doing a focused research pass, fold only the decision-changing findings and
recommendation into the brainstorm, and still preserve the brainstorm artifact.

### Plan Handoff

Does it carry the outcome into `fw-plan` rather than stopping at ideas?
Strong passes also make document review a visible pre-planning option for the
requirements/spec artifact, and route simplification, feasibility, scope, or
supportability findings back to questions or brainstorming before planning when
they change the product shape.

### Simplicity Pressure

When the prompt invites over-design, does it apply YAGNI or simplicity pressure?

For architecture-bearing brainstorms, strong passes keep architecture guidance
high level and tied to scope or behavior rather than drifting into
implementation mechanics.

### Interaction Quality

Does it use structured, bounded choice surfaces without drifting into raw-number
reply UX or unnecessary questioning? Strong passes explicitly call the host
question tool when available, keep the explicit options portable across Claude
Code and Codex, and use chat menus only as the fallback path.
