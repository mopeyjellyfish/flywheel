---
title: Use shared handoff cards and readiness gates for Flywheel stage boundaries
date: 2026-04-24
category: workflow-issues
module: flywheel-workflow
problem_type: workflow_issue
component: developer_workflow
severity: medium
doc_status: active
files_touched:
  - skills/references/workflow-gates.md
  - skills/start/SKILL.md
  - skills/shape/SKILL.md
  - skills/plan/SKILL.md
  - skills/work/SKILL.md
  - skills/review/SKILL.md
  - skills/spin/SKILL.md
  - skills/commit/SKILL.md
  - skills/run/SKILL.md
  - evals/flywheel-handoff-gates/
applies_when:
  - a Flywheel stage hands off to another stage or pauses for approval
  - stage output needs to carry plans, evidence, review verdicts, or open decisions forward
  - workflow changes risk making Flywheel feel less cohesive across hosts
symptoms:
  - stage outputs explained next steps in slightly different shapes
  - readiness checks were distributed across stage skills instead of one shared contract
  - later stages could lose evidence, artifacts, or open decisions without a canonical handoff
root_cause: workflow_gap
resolution_type: workflow_improvement
tags:
  - handoff-card
  - readiness-gates
  - stage-boundaries
  - workflow-contract
  - cross-host
related_docs:
  - docs/solutions/operational-guidance/shared-evidence-bundle-for-stage-handoffs-2026-04-19.md
  - docs/solutions/workflow-issues/make-commit-the-user-facing-finish-stage-2026-04-21.md
---

# Use shared handoff cards and readiness gates for Flywheel stage boundaries

## Context

Reviewing Flywheel against other development-flow plugins showed that the
compact stage loop was directionally right, but the boundaries needed a more
deterministic contract. Adding more visible stages would have made the command
surface heavier; the sharper fix was to standardize what every material
handoff carries and when a stage is ready to advance.

## Guidance

Keep `skills/references/workflow-gates.md` as the canonical source for stage
handoffs and readiness gates.

Use the compact handoff card whenever a material stage boundary matters:

```text
Stage:
Artifact:
Ready:
Open decisions:
Evidence:
Next:
```

Apply the named gate for the boundary being crossed:

- `Shape-Ready` before moving from shaping into planning or work.
- `Plan-Ready` before treating a plan as execution-ready.
- `Work-Ready` before handing implementation to review.
- `Review-Ready` before moving reviewed work toward spin or commit.
- `Spin-Ready` before treating a captured lesson as durable project knowledge.
- `Commit-Ready` before creating the final local commit or PR payload.

Keep helper skills as helpers. `ideate`, `brainstorm`, `document-review`,
`test-driven-development`, `commit-message`, and similar skills should enrich
the main loop without becoming competing backbone stages.

## Why This Matters

Flywheel optimizes for predictable improvement over time. The user should be
able to see the current stage, the artifact being carried forward, what is
ready, what remains undecided, and what proof exists without reconstructing the
session from chat.

A shared handoff contract also keeps Codex and Claude Code behavior aligned.
Host tools differ, but the workflow boundary should still carry the same core
state and use the same readiness names.

## When to Apply

- when `shape` produces a plan, reviewed document, or approved work direction
- when `work` finishes implementation and needs a review handoff
- when `review` returns a verdict that should drive spin or commit
- when `spin` captures a durable solution that belongs in the same commit
- when `commit` assembles the final evidence, validation, and PR story

## Examples

A work-to-review handoff should look like:

```text
Stage: fw:work
Artifact: docs/plans/handoff-gates.md and implementation diff
Ready: Work-Ready satisfied; implementation complete with TDD and verification evidence
Open decisions: None blocking review
Evidence: make verify passed; TDD evidence block includes condensed output summary
Next: fw:review
```

For document-heavy planning, `Plan-Ready` should explicitly carry the
document-review result before implementation starts. If review finds feasibility
or simplification issues, route back into planning instead of treating the plan
as ready by default.

## Related

- [Use a shared evidence bundle for cross-stage proof handoffs](docs/solutions/operational-guidance/shared-evidence-bundle-for-stage-handoffs-2026-04-19.md)
- [Make commit the user-facing finish stage and move message drafting into a helper](docs/solutions/workflow-issues/make-commit-the-user-facing-finish-stage-2026-04-21.md)
