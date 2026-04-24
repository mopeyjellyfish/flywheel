# Reliability Choice Surface

Use this when a runtime-facing change has more than one viable reliability,
supportability, or rollout posture.

The goal is not to warn vaguely. The goal is to present a small set of
evidence-backed choices grounded in:

- what the repo already does
- what the change is likely to alter
- which failure modes matter most
- how far a mistake could spread

## When To Surface Choices

Call the host question tool with a choice surface when the change touches one or
more of:

- retries, deadlines, backoff, or idempotency
- fallback or degraded-mode behavior
- queue consumers, backlog handling, or replay behavior
- health checks, readiness, or fail-open/fail-closed boundaries
- external calls, rate limits, or dependency failure handling
- logging, tracing, metrics, alerting, or rollout validation
- cache invalidation, staleness, or dual-write behavior

If there is only one clearly correct path from repo truth, state that directly
instead of manufacturing fake options.

## Build The Decision Surface

Keep it concise and structured:

1. **Current repo truth**
   - what adjacent code or infra already does
   - what signals or safeguards already exist
   - what invariants the repo appears to rely on

2. **Change pressure**
   - what this change introduces, removes, or amplifies
   - why the current posture may no longer be enough

3. **Top failure modes**
   - list the 2-5 most plausible failure modes
   - prefer realistic system failures over theoretical edge cases

4. **Blast radius**
   - name the likely radius if the change is wrong:
     - single request
     - single user or tenant
     - single job or message
     - queue or worker pool
     - single node or pod
     - availability zone or region
     - global serving path
     - data correctness, duplication, or loss

5. **Options**
   - present 2-3 portable choices by default
   - for each option, include:
     - what it does
     - why it fits or conflicts with repo truth
     - upside
     - downside
     - blast-radius implications
   - in interactive mode, order them as:
     1. recommended option
     2. most meaningful alternative
     3. any other credible option only if it changes the tradeoff materially
     4. freeform final path — user-defined posture or constraint
   - do not ask an open-ended question first when repo truth supports likely
     options

6. **Recommendation**
   - recommend one option explicitly
   - explain why it is the best fit for this repo and this change

7. **Proof and rollback hooks**
   - what logs, traces, metrics, dashboards, or tests will prove the choice was
     correct
   - what signals would trigger rollback, mitigation, or a safer follow-up

## Reliability Heuristics

- prefer symptom-based user-impact signals over purely internal noise
- prefer bounded, exercised behavior over rarely used fallback paths
- prefer idempotent retryable designs over ambiguous side effects
- prefer fail-fast and small queues over silent backlog growth when freshness
  matters
- prefer simple degraded modes that can actually be exercised and observed
- prefer explicit blast-radius containment over optimistic assumptions

## Output Shape

Use a compact section or table. The minimum useful shape is:

- **Current truth**
- **Failure modes**
- **Blast radius**
- **Options**
- **Recommendation**
- **Proof hooks**

When the user needs to choose, prefer labels that predict intent, for example:

- `Recommended` — aligns with current repo posture
- `Safer / tighter containment`
- `Faster / lower implementation cost`
- freeform final path
