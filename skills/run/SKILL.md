---
name: run
description: "Optionally orchestrate remaining Flywheel stages. Use only when one coordinated pass is better than manual stage handoffs."
metadata:
  argument-hint: "[task description, requirements doc path, plan path, or existing branch goal]"
---

# Run The Flow

`$fw:run` is Flywheel's optional orchestration wrapper. It is not part of the
critical path.

Use it when the task is bounded enough that one coordinated pass is more useful
than manually invoking every stage.

This skill does not replace the stage skills. It coordinates them.

The critical path remains:

```text
shape -> work -> review -> optional spin -> commit
```

`run` uses the same routing logic as `start`, then continues across the
remaining stage boundaries until it reaches a required approval gate, clean
handoff, or finish point.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Call the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

Because this workflow coordinates multiple stages, use the host task-tracking
tool named in `../references/host-interaction-contract.md` to create and
maintain a task list for the remaining stages and major handoffs.

## Reference Loading Map

Do not preload every reference. Load only what the current phase needs:

- Read `../references/workflow-gates.md` when coordinating a stage boundary,
  deciding whether to continue, or summarizing a pause/finish point.

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

Use the same routing logic as `fw:start`, then continue instead of stopping.

Typical starts:

- fuzzy request -> `$fw:shape`
- existing requirements doc -> `$fw:shape`
- existing plan -> `$fw:work`
- runtime incident or live evidence -> `$fw:incident`
- changed code -> `$fw:review`
- ready branch -> `$fw:commit`

### Phase 1: Run The Remaining Stages

Continue through the remaining path until one of these stop points:

- user approval is needed
- planning is complete but the user has not explicitly asked to begin
  implementation
- the repo is not ready
- the work reveals a design problem that must route upstream
- review finds blocking issues or release decisions that need user direction
- a pre-commit spin choice needs user direction
- commit is complete

If the run reaches `fw:shape` and its selected mode is `fw:plan`, do not cross
into `fw:work` unless the user explicitly asked for implementation in the same
request or explicitly approves the reviewed plan when presented. Let the plan
stage complete its mandatory `document-review` pass and preserve the user's
choice to address findings, deepen, or work instead of flattening that boundary.

When relevant:

- use `document-review` before work when the plan or requirements doc needs
  hardening
- when the run goes through `$fw:shape` and plan mode, let the user choose
  whether to address review findings, run `$fw:deepen`, or enter `$fw:work`
- move from `$fw:work` into `$fw:review` by default before commit;
  use inline self-review only when the narrower work contract explicitly allows it
- use `$fw:docs` after `$fw:work` when the change altered setup, public
  APIs, CLI flows, configuration, or user workflows and the user wants docs
  refreshed before review
- use `$fw:incident` before `$fw:debug` when the task begins with live
  degradation, alerts, logs, traces, or metrics rather than a settled local bug
- use `$fw:browser-test` before review or commit for browser-visible changes
- use `$fw:rollout` after review and before commit when the change is
  runtime-risky and release posture is still unresolved
- use `$fw:spin` after review or rollout and before commit when the completed
  work surfaced a durable project-specific lesson worth preserving
- use `observability` or `logging` when runtime support shape needs deliberate
  design
- use `$fw:optimize` when the dominant remaining work is measured tuning

### Phase 2: Close Cleanly

When the branch is finished or paused at a deliberate handoff, summarize:

1. current stage reached
2. artifacts created or updated
3. what was completed
4. what still needs user approval or follow-up
5. whether the pre-commit `$fw:spin` checkpoint captured, skipped, or found no
   durable lesson

Then include the canonical handoff card from
`../references/workflow-gates.md`: Stage, Artifact, Ready, Open decisions,
Evidence, and Next.
