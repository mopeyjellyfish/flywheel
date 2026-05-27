# Service Readiness Matrix

Use this matrix when planning, executing, reviewing, or commit a change that
can affect a live service, job system, queue, migration, integration, cache,
workflow, or distributed boundary.

The goal is not to produce ceremony. The goal is to make the support and
rollout posture explicit before the change surprises someone in production.

## When To Use

Use the matrix when at least one of these is true:

- the change crosses process, service, queue, or storage boundaries
- the change mutates persistent state
- the change changes retries, timeouts, fallback behavior, or degradation mode
- the change alters a public contract, event, or operational workflow
- the blast radius could exceed one local request or one isolated user action

## The Matrix

For each applicable dimension, capture five short facts:

1. **Current truth** - what the system does today
2. **Change introduced** - what this work alters
3. **Primary failure mode** - how it can fail or degrade
4. **Proof hook** - test, query, metric, trace, log, or validation step that
   proves the posture
5. **Mitigation / owner** - rollback, disablement, or operational owner

### Dimensions

1. **Entrypoints and callers**
   - Which request paths, jobs, workers, commands, or downstream consumers are
     touched?

2. **Contracts and compatibility**
   - What user-facing, API, CLI, schema, event, or storage contracts change?
   - Is the change backward compatible?

3. **State and data correctness**
   - What persistent state can be created, mutated, duplicated, orphaned, or
     partially written?

4. **Failure modes and blast radius**
   - If this path breaks, how far can the mistake spread: one request, one
     tenant, one queue, one worker pool, one region, or global?

5. **Timeouts, retries, and backpressure**
   - Do retry loops, deadlines, queue growth, or partial outages change?

6. **Ordering, idempotency, and concurrency**
   - What happens on replay, duplicate delivery, parallel requests, or retry
     after partial success?

7. **Observability and correlation**
   - Which logs, metrics, traces, and identifiers will show whether the change
     is healthy or broken?

8. **Rollout and guarding**
   - Is there a flag, canary, phased rollout, migration gate, or other control
     surface?

9. **Recovery and rollback**
   - What can be reversed quickly, and what requires forward-fix or cleanup?

10. **Validation window and owner**
    - Who confirms the change after release, over what window, with which
      signals?

## Scaling Guidance

- **Small local change** -> only 2-3 dimensions may apply
- **Cross-service or migration-heavy change** -> most dimensions apply
- **Docs-only or pure refactor** -> matrix can be skipped explicitly

## Output Shape

When a full table is unnecessary, a concise readiness note is enough:

- applicable dimensions
- top failure modes
- blast radius
- proof hooks
- mitigation and owner
