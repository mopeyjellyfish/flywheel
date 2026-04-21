---
name: rollout
description: "Plan the release posture for runtime-risky changes before final commit. Use when a change affects live behavior, contracts, state, retries, queues, migrations, or blast radius and the immediate job is deciding how to validate, sequence, and roll it out safely."
metadata:
  argument-hint: "[change description, plan path, PR context, or blank to inspect current runtime-risky work]"
---

# Roll Out Runtime-Risky Changes

`$flywheel:rollout` is Flywheel's change-management stage for runtime-risky work.

Use it when the question is not "how do we code this?" but:

- how should this change reach users or traffic?
- what must be proven before and during rollout?
- what signals tell us to continue, pause, mitigate, or roll back?

This skill does not automate deployments. It produces a grounded rollout
posture, validation playbook, and commit handoff.

## Interaction Method

Use the platform's blocking question tool when available. Otherwise present
numbered options in chat and wait for the user's reply.

Ask one question at a time. When multiple rollout postures are viable, present
the recommended option first and keep `Custom` last.

## Input

<rollout_input> #$ARGUMENTS </rollout_input>

Interpret the input as:

- a runtime-risky change ready for release planning
- a plan or PR context that needs rollout posture
- a request for canary, feature-flag, staged-release, or rollback planning
- a blank request to inspect current work and decide whether rollout is needed

If the change is clearly not runtime-facing or the blast radius is trivial,
say so plainly and hand off to `$flywheel:commit` with a grounded no-rollout rationale.

## Reference Loading Map

Do not preload every reference. Load only what the current phase needs:

- Read `references/rollout-template.md` when producing the rollout handoff
  artifact.
- Read `references/validation-playbook.md` when choosing rollout posture or
  validation shape.
- Read `../observability/references/service-readiness-matrix.md` when the
  change crosses contracts, state, retries, queues, migrations, or other
  blast-radius-sensitive boundaries.
- Read `../commit/references/evidence-bundle.md` when rollout proof should
  feed `$flywheel:commit`.

## Core Principles

1. **Rollout is about blast radius control** - choose the smallest honest path
   to production confidence.
2. **Compatibility outranks speed** - if readers, writers, schemas, queues, or
   clients may disagree during transition, design for mixed-state operation.
3. **Validation must be executable** - name the exact queries, dashboards,
   traces, smoke checks, and owners.
4. **Rollback is part of the plan** - define what gets undone, how, and under
   which trigger before calling the rollout ready.
5. **Reuse evidence, do not restate it** - consume the shared evidence bundle
   when proof already exists and add only the rollout-specific summary.

## Workflow

### Phase 1: Touch Grass

Ground the rollout in repo and release truth:

- read `AGENTS.md` and `CLAUDE.md` when present
- read the plan, latest review outcome, and any shared evidence bundle when
  they already exist
- inspect deploy docs, runbooks, feature-flag config, kill switches, migration
  playbooks, queue controls, and environment docs
- inspect observability surfaces, dashboards, alerts, saved queries, and error
  trackers for the affected path
- read `.flywheel/config.local.yaml` when present for repo-local commit or
  runtime gates
- inspect the active repo's `docs/solutions/` for prior rollout or incident
  lessons in the same area

Capture:

- the runtime surface being changed
- the compatibility window, if any
- the likely blast radius if the change is wrong
- the rollback or mitigation levers that already exist
- the signals and owners available during rollout

### Phase 2: Decide Whether A Dedicated Rollout Is Needed

Use rollout when one or more of these are true:

- contracts or client expectations can be mixed during transition
- state or schema changes may race with live traffic
- retries, queues, jobs, or backfills can amplify bad behavior
- the change touches auth, permissions, billing, or other high-cost paths
- the blast radius is wider than a trivial local leaf
- the repo or team already expects staged enablement for this surface

If none apply and the runtime impact is small, say that a dedicated rollout
stage is not needed and hand off to `$flywheel:commit` with the exact rationale.

### Phase 3: Choose Rollout Posture

Read `references/validation-playbook.md`.

Choose the narrowest viable posture, for example:

1. **Feature-flagged progressive enablement**
2. **Canary or percentage rollout**
3. **Tenant, region, cell, or queue partition rollout**
4. **Shadow, dual-write, or read-compare transition**
5. **All-at-once** only when blast radius is genuinely low and rollback is
   trivial
6. **Custom**

State why the recommended posture fits the current compatibility constraints,
rollback levers, and blast radius better than the alternatives.

### Phase 4: Build The Validation Playbook

Use the chosen posture to define:

- preflight checks
- activation sequence
- healthy signals
- failure signals
- rollback or mitigation trigger
- validation window and owner
- evidence to capture or reuse

If the change is runtime-risky, read
`../observability/references/service-readiness-matrix.md` so the rollout plan
accounts for contract, state, degradation, and recovery rather than just
"watching logs."

### Phase 5: Produce The Handoff Artifact

Read `references/rollout-template.md`.

Prefer a local rollout artifact at:

```text
.context/flywheel/rollout/<run-id>/rollout.md
```

Also create or update the shared evidence bundle under:

```text
.context/flywheel/evidence/<bundle-id>/
```

Add only the rollout-specific reusable summary:

- chosen rollout posture
- activation sequence
- validation window and owner
- rollback or mitigation trigger
- any PR-safe evidence references the commit stage should cite

Keep bulky dashboards, raw logs, and detailed incident notes in their native
locations and reference them from the artifact instead of duplicating them.

## Output Contract

Return a concise rollout brief:

1. **Runtime surface** - what is being rolled out
2. **Why rollout is or is not needed**
3. **Chosen posture** - the recommended rollout shape
4. **Compatibility and blast-radius notes**
5. **Validation playbook** - preflight, healthy signals, failure signals,
   rollback trigger, owner, and validation window
6. **Artifacts** - rollout artifact path and shared evidence-bundle path when
   created
7. **Next handoff** - usually `$flywheel:commit`, or `$flywheel:work` or `$flywheel:plan` if the
   rollout assumptions are not yet satisfiable

---

## Included References

@./references/rollout-template.md
@./references/validation-playbook.md
@../observability/references/service-readiness-matrix.md
@../commit/references/evidence-bundle.md
