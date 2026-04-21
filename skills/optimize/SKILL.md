---
name: optimize
description: "Run metric-driven optimization loops for latency, throughput, resource use, cost, build time, query performance, or other measurable outcomes. Use when the goal is not just 'make it better' but prove improvement with Datadog, OTel-native backends such as Grafana/Prometheus/Loki/Tempo/Mimir/Pyroscope, or local measurement before commit."
metadata:
  argument-hint: "[optimization goal, hotspot, path, service, or existing optimization note]"
---

# Optimize With Measurement

`$flywheel:optimize` is Flywheel's optimization workflow.

Use it when the question is:

- what is actually slow, expensive, noisy, or inefficient?
- which change improves the metric without breaking correctness?
- how do we prove the improvement against real telemetry or a trustworthy local
  harness?

This is not a "spray tweaks and hope" skill. It is a measurement-first loop.

## Interaction Method

Use the platform's blocking question tool when available. Otherwise present
numbered options in chat and wait for the user's reply.

Ask one question at a time. When multiple measurement paths are viable, present
the recommended option first and keep `Custom` last.

## Input

<optimization_input> #$ARGUMENTS </optimization_input>

Interpret the input as one of:

- a concrete optimization goal
- a known hotspot, service, query path, or component
- a latency, throughput, cost, or saturation problem
- an existing optimization note or spec

If the input is blank, ask what should be optimized and which outcome matters.

## Reference Loading Map

Do not preload every reference. Load only what the current phase needs:

- Read `references/provider-selection.md` when choosing the measurement source.
- Read `references/measurement-contract.md` when building the optimization
  contract.
- Read `references/datadog-path.md` only when the Datadog path is selected.
- Read `references/lgtm-path.md` only when the OTel-native path is selected.
- Read `references/optimization-loop.md` only when execution planning begins.
- Read `../commit/references/evidence-bundle.md` only when a measured result
  should be handed off into `$flywheel:review` or `$flywheel:commit`.
- Read `../observability/references/service-readiness-matrix.md` only when the
  optimization target is runtime-risky or blast-radius-sensitive.

## Execution Notes

Keep the stable optimization scaffold first, gather repo and telemetry truth
before forming hypotheses, and prefer one measured improvement over a bag of
speculative micro-tweaks.

- keep the measurement source explicit
- state the metric, guardrails, and stop criteria before changing code
- use serial experiments by default
- keep changes small enough that the metric movement can still be attributed

## Core Principles

1. **No optimization without a metric** - define what better means before
   editing code.
2. **Use the repo's real observability front door** - Datadog, an OTel-native
   backend surface, or a local harness. Do not invent a telemetry source when
   the project already has one.
3. **Correctness and reliability are guardrails, not optional follow-ups** -
   performance wins that raise error rate, break ordering, or widen blast
   radius do not count as wins.
4. **Prefer hybrid proof when available** - use local benchmarks, local
   profiles, or a local observability stack for fast iteration, then validate
   in a shared environment when the change is runtime-facing.
5. **One experiment, one conclusion** - small deltas beat giant rewrites when
   the goal is attribution.

## Workflow

### Phase 0: Classify The Optimization Target

Decide what category of optimization is in scope:

- request or endpoint latency
- job, queue, or batch throughput
- query or storage efficiency
- CPU, memory, or allocation pressure
- cache hit rate or invalidation churn
- build, test, or developer loop performance
- infrastructure spend or saturation

Also classify whether the target is:

- **local-only** - build, benchmark, or profile work can be proven on the
  machine
- **runtime-facing** - service behavior must be proven against telemetry
- **hybrid** - local measurement is fast, but a shared environment is needed to
  confirm the result matters

### Phase 1: Touch Grass

Build an optimization ledger from repo truth:

- read `AGENTS.md` and `CLAUDE.md` when present
- inspect relevant manifests, scripts, CI workflows, benchmark harnesses, load
  tests, and profiling configs
- inspect nearby code and tests for the target path
- inspect the active repo's `docs/solutions/` for prior performance or
  reliability learnings
- read `.context/flywheel/setup-ledger.md` when present
- inspect observability config, instrumentation libraries, dashboards, monitor
  references, saved queries, and environment variables

Capture:

- the target code path or service boundary
- the current likely bottleneck and alternative hypotheses
- correctness guardrails and reliability risks
- existing measurement surfaces
- whether the repo already appears Datadog-first, OTel-native-first, or
  local-only
- which environments are actually observable: local dev stack, shared
  non-production, production, or only a subset

If the optimization target is runtime-risky, read
`../observability/references/service-readiness-matrix.md` and keep the
applicable dimensions visible while optimizing.

### Phase 2: Choose The Measurement Source

Read `references/provider-selection.md`.

Use repo evidence plus any setup ledger to choose one of these paths:

1. **Hybrid local + shared** (recommended when both a fast local harness and a
   trustworthy shared measurement environment exist)
2. **Datadog-backed measurement**
3. **OTel-native backed measurement**
4. **Local-only benchmark/profile/stack**
5. **Custom**

Selection rules:

- choose **Datadog-backed** when Datadog appears to be the operational system
  of record and the user has Datadog MCP or equivalent read access
- choose **OTel-native backed** when the repo is OTel-first or Grafana,
  Prometheus or Mimir, Loki, Tempo, Pyroscope, or collector-backed dashboards
  are the real support surfaces
- choose **Local-only** when remote access is unavailable, the code is not yet
  deployed, or the hotspot is purely local
- choose **Hybrid** when local measurement is useful for rapid iteration and a
  shared environment is available to validate the real-world effect

If both Datadog and OTel-native surfaces are plausible, first verify which
backend is the source of truth for this target. Then pin the environment
separately: local dev stack, shared non-production, or production.

### Phase 3: Build The Measurement Contract

Read `references/measurement-contract.md`.

Before making changes, define:

1. **Primary metric** - the number that decides whether the change won
2. **Guardrails** - correctness, error rate, resource caps, saturation, or
   reliability constraints that must not regress
3. **Measurement source** - local benchmark, Datadog query, PromQL, TraceQL,
   log query, profile, or dashboard
4. **Workload / sample** - the request mix, traffic window, fixture, or batch
5. **Observation window** - enough time to reduce noise and avoid mixed
   rollouts
6. **Version / rollout binding** - how you will isolate the experiment from
   unrelated traffic or deploys
7. **Stop criteria** - what counts as success, failure, or insufficient signal

If you cannot define a trustworthy baseline, stop and build or identify the
measurement surface first.

### Phase 4: Load The Path-Specific Guidance

If the selected path is Datadog, read `references/datadog-path.md`.

If the selected path is OTel-native backed, read `references/lgtm-path.md`.

Use that guidance to pin:

- exact tags, labels, services, environments, and versions
- the metrics, traces, logs, and profiles that matter most
- the safest query surfaces for comparing before vs after

### Phase 5: Plan The Optimization Loop

Read `references/optimization-loop.md`.

Prefer serial iteration:

1. baseline
2. hypothesis
3. smallest credible change
4. local checks and correctness tests
5. measurement
6. keep, revert, or revise

Only parallelize experiments when:

- the code paths are isolated
- the measurements are independent
- the user explicitly wants parallel work

### Phase 6: Execute And Measure

For each experiment:

- state the hypothesis in one sentence
- make the smallest change that can move the metric
- run correctness checks before treating a metric move as real
- measure against the contract
- compare against baseline and guardrails
- record what changed, what moved, and whether the hypothesis held

Use local worktrees when isolated iteration will reduce confusion or protect
the current checkout.

If the change survives the optimization gate, route through `$flywheel:review` and
`$flywheel:commit` before calling it complete.

When the measurement result should feed later stages, create or update a shared
evidence bundle under:

```text
.context/flywheel/evidence/<bundle-id>/
```

Keep the shared summary focused on:

- baseline
- guardrails
- measurement source
- winning change or current best direction
- the exact query, benchmark, dashboard, or profile name to rerun

Keep bulky raw traces, profiles, or benchmark outputs in their native local
location and reference them from the bundle instead of copying them.

## Output Contract

Return a concise optimization brief:

1. **Target** - what is being optimized
2. **Chosen measurement backend** - Datadog, OTel-native, local-only, or hybrid
3. **Chosen environment** - local dev stack, shared non-production,
   production, or mixed
4. **Baseline and guardrails**
5. **Top hypotheses**
6. **Experiment posture** - serial or parallel, and why
7. **Winning change or current best direction**
8. **Residual risks or missing signal**
9. **Evidence bundle** - shared bundle path when one was created, otherwise
   `not created`
10. **Next Flywheel handoff** - `$flywheel:work`, `$flywheel:review`, `$flywheel:commit`, or
    another optimization iteration

---

## Included References

@./references/provider-selection.md
@./references/measurement-contract.md
@./references/datadog-path.md
@./references/lgtm-path.md
@./references/optimization-loop.md
@../commit/references/evidence-bundle.md
