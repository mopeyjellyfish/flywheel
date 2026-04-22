---
name: observability
description: "Discover, design, or review logs, metrics, traces, dashboards, and operational validation for runtime-facing changes. Use when a change affects production behavior, jobs, queues, integrations, APIs, migrations, or when telemetry quality determines whether the work is supportable."
metadata:
  argument-hint: "[feature, path, runtime surface, or blank to inspect repo truth]"
---

# Observability

Use this skill to answer two questions:

1. How will we know this change is healthy?
2. How will we know it is broken, degraded, or behaving unexpectedly?

Observability is not a vendor choice alone. It is the combination of useful
logs, traces, metrics, and post-deploy validation that lets engineers and
agents understand a live system without guessing.

`$flywheel:observability` is a support skill. It can be used during planning, execution,
review, or debugging.

**When directly invoked, always do observability work.** Do not stop at naming
tools. Ground the repo, identify the relevant runtime surface, and produce a
usable signal plan or gap report.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Use the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When the workflow spans multiple material steps, use the host task-tracking
tool named in `../references/host-interaction-contract.md` to create and
maintain a short task list.

When the user needs to choose between viable reliability or supportability
postures:

- present 2-4 predicted options at most
- put the recommended option first
- keep the tradeoffs concrete
- rely on the host's native freeform final path when it exists

Do not lead with an open-ended question when repo truth supports a short,
useful menu.

## Input

<observability_input> #$ARGUMENTS </observability_input>

Interpret the input as:

- a runtime-facing feature or bug to instrument
- a path, module, or subsystem to inspect
- a prompt to discover the repo's observability stack
- a request to review whether a change is operationally visible enough

If the input is blank, inspect the repo's current observability truth first and
build from there.

## Reference Loading Map

Do not load every reference by default. Load only what the current phase needs:

- Read `references/platform-detection.md` when discovering repo truth.
- Read `references/signal-design.md` when shaping logs, metrics, traces, and
  validation.
- Read `references/reliability-choice-surface.md` when the work has meaningful
  failure-mode or blast-radius tradeoffs and the user needs grounded options.
- Read `references/service-survivability.md` when the change affects retries,
  queues, degradation, health checks, or user-visible reliability under stress.
- Read `references/service-readiness-matrix.md` when the change crosses a
  service, state, rollout, or blast-radius-sensitive boundary and the user
  needs a concise readiness frame.
- Read `references/otel.md` only when the repo shows OpenTelemetry signals.
- Read `references/datadog.md` only when the repo shows Datadog signals.

## Core Principles

1. **Repo truth first** - use the platform the project already has before
   inventing a new telemetry path.
2. **One runtime question -> one signal plan** - define what you need to know,
   then pick the smallest mix of logs, traces, and metrics that answers it.
3. **Logs are for context, traces are for journeys, metrics are for shape** -
   do not force one signal to do every job.
4. **Correlation beats volume** - request IDs, trace IDs, message IDs, job IDs,
   tenant IDs, and stable field names matter more than extra noise.
5. **Operational validation must be executable** - name the dashboards, log
   queries, trace filters, or smoke checks people will actually use.
6. **Do not add duplicate telemetry pipelines** - extend the repo's existing
   stack unless there is a concrete reason not to.
7. **Tradeoffs should be presented, not implied** - use the choice-surface
   protocol when multiple reliability postures are viable.
8. **Distill, do not lecture** - present condensed Flywheel guidance grounded
   in repo truth. Do not turn the output into a source roundup unless the user
   explicitly asks for references.

## Workflow

### Phase 1: Touch Grass

Inspect the repo for observability truth before making recommendations.

Ground in:

- `AGENTS.md`, `CLAUDE.md`, and nearby durable docs
- app manifests and dependency files
- config or infra files
- CI workflows
- runtime environment examples
- existing code patterns near the affected surface

Look for evidence of:

- logging libraries and wrappers
- tracing libraries and context propagation
- metrics libraries, dashboards, or alert configuration
- error trackers
- deployment or monitoring docs
- existing event names, tags, or query fields used by the team

If the repo appears to use a known platform, load the relevant reference only
after detecting it.

### Phase 2: Scope the Runtime Surface

Define what runtime surface the work changes:

- request or handler path
- background job
- queue consumer or producer
- external API call
- database migration or backfill
- cache or invalidation path
- CLI or workflow execution

Then ask:

- what the current code and infra already do on this path
- what success looks like
- what failure looks like
- what degradation looks like
- what identifiers will let us correlate one execution across components
- what business context matters for triage
- how far a bad change could spread if this path is wrong

### Phase 2.5: Build A Reliability Choice Surface When Needed

If the work changes a runtime boundary with meaningful tradeoffs, do not stop
at "we should monitor this." Use the choice-surface protocol from
`references/reliability-choice-surface.md` and keep it short: current truth,
failure modes, blast radius, predicted options plus a freeform path, and a clear
recommendation.

Typical triggers include retries, deadlines, fallbacks, degraded modes, queue
backlog behavior, health checks, or rollout-sensitive telemetry choices.

### Phase 3: Build the Signal Plan

Produce the smallest useful plan across the signals that matter:

- **Logs** — canonical events, fields, search terms, and failure context
- **Traces** — span boundaries, propagated context, and key attributes
- **Metrics** — counters, rates, latency, queue depth, failure counts, or other
  durable health indicators
- **Validation** — post-deploy queries, smoke checks, dashboards, and failure
  triggers

Prefer extending existing instrumentation over parallel bespoke surfaces.

When the change is runtime-risky, use the service-readiness matrix to make sure
the signal plan matches the actual contract, state, rollout, and recovery
posture rather than just adding logs.

### Phase 4: Report Gaps and Next Moves

When reviewing an existing design or diff, call out:

- missing instrumentation on risky boundaries
- telemetry that exists but is too noisy or uncorrelated to help
- dashboards, queries, or monitors that the rollout depends on but never names
- places where logging belongs in `$flywheel:logging` specifically

When the missing piece is not signal design but staged release posture, route
the next step into `$flywheel:rollout` so activation sequence, validation window, and
rollback triggers become explicit.

When the work starts from a live outage, page, or customer-impact event rather
than instrumentation design, route the next step into `$flywheel:incident` so the
blast radius and immediate decision are framed before deeper debugging.

## Output Contract

Return a concise operational brief:

1. **Platform summary** — what observability stack the repo appears to use
2. **Relevant runtime surface** — what part of the system is changing
3. **Failure modes and blast radius** — the most important support risks
4. **Choice surface** — options and recommendation when tradeoffs are real
5. **Signal plan** — logs, traces, metrics, and validation to add or extend
6. **Gap report** — what is missing or weak
7. **Rollout or incident hooks** — what `$flywheel:rollout`, `$flywheel:incident`, or
   `$flywheel:commit` should reference

If the repo exposes no observability stack, say so clearly and give a
platform-neutral plan rather than pretending a vendor exists.

---

## Included References

@./references/platform-detection.md
@./references/signal-design.md
@./references/reliability-choice-surface.md
@./references/service-survivability.md
@./references/service-readiness-matrix.md
@./references/otel.md
@./references/datadog.md
