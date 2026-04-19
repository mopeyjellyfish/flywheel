# Operability Logging Patterns

Use this reference when logging needs to help operators and agents understand
live behavior under failure, retries, or degraded conditions.

## What A Good Runtime Log Answers

A useful event usually answers:

- what happened
- to whom or to what object
- on which attempt
- against which dependency or subsystem
- with what outcome
- under which version, flag, or environment context
- what happens next

## Default Shapes

### Request or handler outcome event

Prefer one canonical outcome event for the request when the repo's pattern
supports it.

Include when relevant:

- request or trace identifiers
- actor, tenant, and object identifiers
- status or outcome
- duration
- error class or reason
- feature flag or rollout cohort
- dependency or downstream target when one boundary dominated the result

### Async or job outcome event

For queued or scheduled work, include when relevant:

- job, message, or task identifier
- queue or topic
- attempt number
- age or freshness indicator
- outcome
- retry reason or dead-letter reason
- idempotency or dedupe identifier

### External dependency event

When a downstream call determines behavior, include when relevant:

- logical dependency name
- operation name
- outcome class
- latency
- retryable classification
- timeout or deadline context
- fallback or degraded-mode activation

### Degraded-mode event

When the system changes behavior to stay alive:

- emit an activation event
- include scope, reason, and expected effect
- emit a recovery or exit event when normal behavior resumes

## Hot-Path Discipline

Avoid:

- one debug line per tiny internal step on a hot path
- log spam that scales with item count when aggregate context would do
- string-only narration with no fields

If deeper detail is occasionally needed, prefer:

- debug-gated detail
- sampled detail
- one summary event plus a smaller number of explicit state-transition events

## Field Guidance For Failure-Prone Paths

When relevant, strongly consider:

- `attempt`
- `retry_reason`
- `retryable`
- `timeout_ms` or deadline context
- `idempotency_key`
- `queue_age_ms`
- `degraded_mode`
- `dependency`
- `feature_flag`
- `service_version`

Only log fields that really exist on the flow. Do not fabricate signal.

## Review Questions

- If this path misbehaves, will one or two events explain the failure?
- Can operators group events by tenant, request, job, or dependency?
- Will retries, backlog growth, or degraded mode be visible?
- Is the logging shape cheap enough to keep in production?
- Does the event help someone decide what to do next?
