---
name: fw-run
description: "Run a bounded task through the remaining Flywheel stages end to end. Use when the user wants one coordinated pass from the earliest missing stage through work, review, shipping, and spin rather than invoking each stage manually."
metadata:
  argument-hint: "[task description, requirements doc path, plan path, or existing branch goal]"
---

# Run The Flow

`/fw:run` is Flywheel's optional orchestration wrapper.

Use it when the task is bounded enough that one coordinated pass is more useful
than manually invoking every stage.

This skill does not replace the stage skills. It coordinates them.

## Core Principles

1. **Start at the earliest missing stage** - do not rerun already-complete work
   just for ceremony.
2. **Keep stage boundaries visible** - even when orchestration is continuous,
   each stage should still produce its artifact.
3. **Pause only for real decisions** - branch safety, breaking commits, and
   ambiguous scope still deserve explicit user choice.
4. **Carry artifacts forward** - requirements, plans, review findings, browser
   proof, and learnings should feed the next stage automatically.

## Workflow

### Phase 0: Determine The Earliest Missing Stage

Use the same routing logic as `flywheel`, then continue instead of stopping.

Typical starts:

- fuzzy request -> `fw-brainstorm`
- existing requirements doc -> `fw-plan`
- existing plan -> `fw-work`
- changed code -> `fw-review`
- ready branch -> `fw-ship`

### Phase 1: Run The Remaining Stages

Continue through the remaining path until one of these stop points:

- user approval is needed
- the repo is not ready
- the work reveals a design problem that must route upstream
- shipping is complete

When relevant:

- use `document-review` before work when the plan or requirements doc needs
  hardening
- use `fw-browser-test` before shipping for browser-visible changes
- use `observability` or `logging` when runtime support shape needs deliberate
  design
- use `fw-optimize` when the dominant remaining work is measured tuning

### Phase 2: Close Cleanly

When the branch is shipped or paused at a deliberate handoff, summarize:

1. current stage reached
2. artifacts created or updated
3. what was completed
4. what still needs user approval or follow-up
5. whether `/fw:spin` should run now
