---
name: run
description: "Run a bounded task through the remaining Flywheel stages with explicit approval at major boundaries. Use when the user wants one coordinated pass from the earliest missing stage through work, review, commit, and spin rather than invoking each stage manually."
metadata:
  argument-hint: "[task description, requirements doc path, plan path, or existing branch goal]"
---

# Run The Flow

`$flywheel:run` is Flywheel's optional orchestration wrapper.

Use it when the task is bounded enough that one coordinated pass is more useful
than manually invoking every stage.

This skill does not replace the stage skills. It coordinates them.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Use the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

Because this workflow coordinates multiple stages, use the host task-tracking
tool named in `../references/host-interaction-contract.md` to create and
maintain a task list for the remaining stages and major handoffs.

## Core Principles

1. **Start at the earliest missing stage** - do not rerun already-complete work
   just for ceremony.
2. **Keep stage boundaries visible** - even when orchestration is continuous,
   each stage should still produce its artifact.
3. **Pause for real decisions and before execution** - branch safety, planning
   approval, breaking commits, and ambiguous scope still deserve explicit user
   choice.
4. **Carry artifacts forward** - requirements, plans, review findings, browser
   proof, and learnings should feed the next stage automatically.

## Workflow

### Phase 0: Determine The Earliest Missing Stage

Use the same routing logic as `flywheel`, then continue instead of stopping.

Typical starts:

- fuzzy request -> `$flywheel:brainstorm`
- existing requirements doc -> `$flywheel:plan`
- existing plan -> `$flywheel:work`
- runtime incident or live evidence -> `$flywheel:incident`
- changed code -> `$flywheel:review`
- ready branch -> `$flywheel:commit`

### Phase 1: Run The Remaining Stages

Continue through the remaining path until one of these stop points:

- user approval is needed
- planning is complete but the user has not explicitly asked to begin
  implementation
- the repo is not ready
- the work reveals a design problem that must route upstream
- review finds blocking issues or release decisions that need user direction
- commit is complete

If the run reaches `flywheel:plan`, do not cross into `flywheel:work` unless
the user explicitly asked for implementation in the same request or explicitly
approves the reviewed plan when presented. Let the plan stage complete its
mandatory `document-review` pass and preserve the user's `deepen` vs `work`
choice instead of flattening that boundary.

When relevant:

- use `document-review` before work when the plan or requirements doc needs
  hardening
- when the run goes through `$flywheel:plan`, treat the reviewed-plan handoff as
  part of shape: let the user choose between `$flywheel:deepen` and
  `$flywheel:work`
- move from `$flywheel:work` into `$flywheel:review` by default before commit;
  use inline self-review only when the narrower work contract explicitly allows it
- use `$flywheel:docs` after `$flywheel:work` when the change altered setup, public
  APIs, CLI flows, configuration, or user workflows and the user wants docs
  refreshed before review
- use `$flywheel:incident` before `$flywheel:debug` when the task begins with live
  degradation, alerts, logs, traces, or metrics rather than a settled local bug
- use `$flywheel:browser-test` before review or commit for browser-visible changes
- use `$flywheel:rollout` after review and before commit when the change is
  runtime-risky and release posture is still unresolved
- use `observability` or `logging` when runtime support shape needs deliberate
  design
- use `$flywheel:optimize` when the dominant remaining work is measured tuning

### Phase 2: Close Cleanly

When the branch is finished or paused at a deliberate handoff, summarize:

1. current stage reached
2. artifacts created or updated
3. what was completed
4. what still needs user approval or follow-up
5. whether `$flywheel:spin` should run now
