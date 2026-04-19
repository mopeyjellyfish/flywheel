# Measurement Contract

Before changing code, define the contract that decides whether an optimization
worked.

## Required Fields

1. **Primary metric**
   - one metric only
   - examples: p95 latency, queue drain time, peak RSS, build duration, rows
     scanned, cache hit ratio

2. **Guardrails**
   - correctness must still hold
   - runtime-facing work should also guard error rate, timeouts, retry storms,
     saturation, or data correctness where relevant

3. **Measurement source**
   - local benchmark, profile, dashboard, Datadog query, PromQL, LogQL,
     TraceQL, or profile view

4. **Sample / workload**
   - fixture, request mix, data volume, or time window

5. **Version or rollout binding**
   - how you keep the measurement attached to the changed code rather than mixed
     production noise

6. **Stop criteria**
   - success threshold
   - failure threshold
   - insufficient-signal rule

## Noise Discipline

- avoid comparing one noisy screenshot to another
- use the same workload, filters, and time window
- prefer percentile metrics and rates over single points
- for shared telemetry, isolate by service, env, version, endpoint, queue,
  worker, or feature flag when possible

## Guardrail Examples

- error rate does not rise
- retries or timeouts do not spike
- queue backlog does not worsen
- allocation pressure stays within budget
- ordering, idempotency, and data correctness remain intact

## Red Flags

Stop and fix the measurement surface before optimizing if:

- there is no reliable baseline
- the metric is clearly dominated by unrelated traffic or deployment noise
- the optimization target and guardrails are still vague
- a query or dashboard cannot distinguish the candidate change from everything
  else happening in the system
