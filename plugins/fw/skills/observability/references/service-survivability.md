# Service Survivability

Use this reference when the work affects whether a system stays useful under
load, failure, or degraded conditions.

The point is not to collect more telemetry. The point is to preserve
understandability and safe behavior when the system is stressed.

## Start From User Harm

Ask:

- what user-visible failure matters here?
- what would "degraded but acceptable" look like?
- what would silently wrong behavior look like?
- what would make recovery slow even if the service never fully goes down?

Prefer signals tied to user impact over internal noise.

## Runtime Surfaces And What To Watch

### Request/response paths

Care about:

- success and failure rate
- latency distribution, not just averages
- overload or saturation signals
- whether failures are fast, bounded, and explainable

Useful signals:

- request outcome events with correlation and actor/object identifiers
- latency and timeout metrics
- explicit load-shedding or degraded-mode activation signals
- version, flag, and cohort context during rollouts

### External dependency calls

Care about:

- timeout posture
- retry posture
- whether retries are safe
- whether fallback behavior is bounded and observable

Useful signals:

- dependency identity and logical target
- latency and outcome class
- attempt number
- retryable vs non-retryable classification
- timeout budget or deadline context when available
- fallback or degraded-mode activation

### Async and queue-backed flows

Care about:

- backlog age, not just queue length
- time to drain
- retry churn
- dead-letter growth
- freshness and completeness of processed data

Useful signals:

- enqueue, dequeue, completion, retry, drop, and dead-letter outcomes where
  they materially change state
- age of oldest work item
- attempt number and retry reason
- idempotency or dedupe identity when replay is possible

### Mutable or side-effecting operations

Care about:

- duplicate writes
- lost writes
- partial completion across systems
- replay safety

Useful signals:

- idempotency keys or stable mutation identifiers
- durable outcome classification
- reconciliation counts or mismatch signals
- cleanup or compensation outcomes when a failure occurs mid-flight

### Degraded modes and fallbacks

Care about:

- whether the mode can actually be exercised safely
- how much traffic or which tenants it affects
- whether operators can tell it is active
- what returns the system to normal

Useful signals:

- activation event
- affected scope
- exit event or recovery signal
- explicit reason for activation

### Health checks

Care about:

- whether the health signal means "process alive" or "safe to receive work"
- whether a dependency issue should make the instance unready
- whether the health signal could cause thrash or overreaction

Useful signals:

- separate liveness, readiness, and startup posture where the platform supports
  them
- explicit dependency failure classification rather than one generic unhealthy
  bit

## Operability Heuristics

- prefer a small number of high-signal metrics over dashboard sprawl
- prefer bounded failure over silent corruption
- prefer fail-fast and clear retries over hung work
- prefer backlog age and drain-time signals over raw queue size alone
- prefer explicit degraded-mode state over hidden fallback behavior
- prefer signals that show containment and blast radius, not only occurrence

## Choice Compression

When multiple postures are viable, compress them into:

1. a recommended option that best matches repo truth
2. one meaningful alternative with a different tradeoff
3. a freeform final path for user-specified constraints

Do not present a long menu. The point is fast, informed choice.
