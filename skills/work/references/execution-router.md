# Execution Router

Load this file when `fw:work` needs detailed execution strategy, delegation
rules, or testing-completeness reminders. Keep `SKILL.md` focused on routing
and completion gates.

## Execution Strategy

Default to inline execution. Use delegated or parallel execution only when the
platform supports it and the user explicitly asked for delegation, subagents,
or parallel agent work.

| Strategy | When to use |
| --- | --- |
| Inline | Normal direct `fw:work`, 1-2 small tasks, or tasks needing user interaction. |
| Serial delegated units | Several clear units with dependencies and isolated scope. |
| Parallel delegated units | Independent `parallel-ready` units after dependency and file-overlap checks, only when the user asked for parallel work. |

## Parallel Safety Check

Before any parallel dispatch:

1. Start only from dependency-cleared units marked `parallel-ready`.
2. Map every candidate unit to its planned source, test, doc, config,
   migration, generated, and proof files.
3. Downgrade to serial if any file overlaps.
4. Instruct delegated workers not to stage, commit, or run full-suite checks.
5. Review actual modified files before accepting a batch; rerun colliding work
   serially when overlap appears.

## Per-Slice Execution

For each vertical slice:

1. Mark the task in progress.
2. Read plan references, nearby implementation, and existing tests.
3. Check existing context or decision records when terminology, boundaries, or
   workflow contracts matter.
4. If `Test posture: tdd`, load `test-driven-development` and complete red,
   green, and refactor for this one slice before starting another.
5. If `characterization`, capture current behavior before changing it.
6. If `no-new-tests`, verify the exception reason and remaining proof path.
7. Route browser-visible proof to `browser-test` when relevant.
8. Route runtime support design to `observability`, `logging`, or `rollout`
   when blast radius or local policy requires it.
9. Route docs-impacting changes to `docs` before review when a separate docs
   pass is worth it.
10. Run the slice's targeted checks and update task state only after proof
    passes.

## Test Completeness

Before writing or updating tests for behavior-bearing work, check whether the
current slice covers:

- happy path
- edge cases
- error or failure paths
- integration through the real chain where practical

Before marking a slice complete, ask:

- what callbacks, middleware, observers, event handlers, or generated surfaces
  fire when this runs?
- do tests exercise the real public interface or chain?
- can failure leave orphaned state?
- what sibling interfaces or mirrored surfaces need parity?
- do error strategies align across layers?

Skip the system-wide check only for true leaf-node changes with no callbacks,
no persistence, and no parallel interfaces.

## Incremental Commits

Evaluate an incremental commit after a verified logical unit. Commit only when
tests pass and the message describes a complete valuable change. Do not commit
WIP, failing tests, or delegated worker output before orchestrator review.
