---
name: incident
description: "Handle production or runtime incidents from live evidence. Use when the work starts from alerts, logs, traces, metrics, or visible degradation and the immediate job is to bound blast radius, choose mitigation vs rollback vs patch, and hand off cleanly into debug, planning, rollout, or commit."
metadata:
  argument-hint: "[incident report, alert, log/trace summary, issue, or blank to inspect current runtime evidence]"
---

# Incident Response

`$flywheel:incident` is Flywheel's incident-first workflow.

Use it when the work starts from a live or recently live problem and the first
question is:

- what is affected right now?
- should we mitigate, roll back, patch, or observe a little longer?
- what evidence must be preserved before the tree changes?

This skill is not a full SRE handbook. It is the shortest honest path from
runtime evidence to the right next Flywheel stage.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Use the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When the workflow spans multiple material steps, use the host task-tracking
tool named in `../references/host-interaction-contract.md` to create and
maintain a short task list.

Ask one question at a time. When multiple response paths are viable, present
the recommended label first and rely on the host's native freeform final path
when it exists.

## Input

<incident_input> #$ARGUMENTS </incident_input>

Interpret the input as:

- an alert, page, or on-call summary
- logs, traces, metrics, or runtime symptoms
- a production bug or customer-impact report
- a blank request to inspect current runtime evidence and determine the next
  move

## Reference Loading Map

Do not preload every reference. Load only what the current phase needs:

- Read `references/incident-template.md` when producing the local incident
  handoff artifact.
- Read `references/decision-matrix.md` when choosing mitigation, rollback,
  patch, or observe posture.
- Read `../observability/references/service-readiness-matrix.md` when the
  incident crosses contracts, state, retries, queues, or other blast-radius-
  sensitive boundaries.
- Read `../commit/references/evidence-bundle.md` when incident evidence should
  feed later debug, rollout, or commit work.

## Core Principles

1. **Start from runtime evidence** - logs, traces, metrics, alerts, and live
   symptoms outrank guessed fixes.
2. **Stabilize before polishing** - the first job is to reduce harm and bound
   blast radius, not to produce a perfect root-cause writeup.
3. **Separate mitigation, rollback, and patch** - these are different decisions
   with different risks.
4. **Preserve the evidence trail** - later debug and rollout work should not
   depend on memory or chat alone.
5. **Route as soon as the next job is clear** - use `$flywheel:debug`, `$flywheel:rollout`,
   `$flywheel:plan`, `$flywheel:work`, or `$flywheel:commit` once the incident posture is decided.

## Workflow

### Phase 1: Touch Grass

Ground the incident in current truth:

- read the incident report, alert, issue, or user report in full
- inspect logs, traces, metrics, dashboards, queue state, error trackers, and
  rollout artifacts for the affected surface
- read `AGENTS.md`, `CLAUDE.md`, nearby runbooks, and relevant entries from the
  active repo's `docs/solutions/`
- inspect `.flywheel/config.local.yaml` when present for repo-local bug-fix or
  runtime gates
- inspect the latest review, rollout, commit, or evidence-bundle artifacts if
  the incident likely ties back to a recent change

Capture:

- current symptom
- affected runtime surface
- likely blast radius
- current mitigation or rollback levers
- what evidence still needs to be preserved before code changes begin

### Phase 2: Frame The Incident

State, as concretely as possible:

- what is failing or degraded
- who or what is affected
- whether the issue appears ongoing, contained, or historical
- whether the likely next move is mitigation, rollback, patch, or more
  evidence-gathering

If the incident crosses contracts, state, retries, queues, or other recovery-
heavy boundaries, read
`../observability/references/service-readiness-matrix.md` so the blast radius
and recovery frame stay concrete.

### Phase 3: Choose The Immediate Path

Read `references/decision-matrix.md`.

Choose one of:

- **Mitigate in place** - disable, rate-limit, degrade, or isolate the bad
  path while keeping service up
- **Roll back** - revert or disable the recent change when a rollback lever is
  safer than patching live
- **Patch now** - route into `$flywheel:debug` when a quick local causal proof
  and fix path is realistic
- **Observe briefly** - only when impact is low or confidence is too low for a
  stronger move, and only with an explicit time box
- Freeform path when the incident needs a different response

State why the recommended path is best given impact, confidence, rollback
levers, and time-to-recovery.

### Phase 4: Produce The Handoff

Read `references/incident-template.md`.

Prefer a local incident artifact at:

```text
.context/flywheel/incident/<run-id>/incident.md
```

Also create or update the shared evidence bundle under:

```text
.context/flywheel/evidence/<bundle-id>/
```

Preserve only what later stages need:

- incident summary
- runtime evidence references
- chosen immediate path
- mitigation or rollback lever
- next handoff stage

Then route cleanly:

- **mitigate or patch** -> `$flywheel:debug`
- **rollback or staged disablement** -> `$flywheel:rollout` or `$flywheel:commit`
- **design-level follow-up after stabilization** -> `$flywheel:plan` or
  `$flywheel:brainstorm`

## Output Contract

Return a concise incident brief:

1. **Incident surface** - what is failing or degraded
2. **Current evidence** - the logs, traces, metrics, alerts, or runtime facts
3. **Blast radius** - who or what is affected
4. **Recommended immediate path** - mitigate, roll back, patch, or observe
5. **Artifact paths** - incident artifact path and shared evidence-bundle path
   when created
6. **Next handoff** - `$flywheel:debug`, `$flywheel:rollout`, `$flywheel:plan`, `$flywheel:work`, or
   `$flywheel:commit`

---

## Included References

@./references/incident-template.md
@./references/decision-matrix.md
@../observability/references/service-readiness-matrix.md
@../commit/references/evidence-bundle.md
