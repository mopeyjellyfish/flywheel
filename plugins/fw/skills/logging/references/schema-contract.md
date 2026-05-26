# Schema Contract

Favor stable, queryable field names over ad hoc text.

## Common Required Fields

- `event`
- `timestamp` or repo-equivalent
- `outcome` or `status`
- `service`
- `env`
- `duration_ms` when the flow has a duration

## Common Correlation Fields

- `request_id`
- `trace_id`
- `span_id`
- `job_id`
- `message_id`
- `tenant_id`
- `user_id`

Only include fields that actually exist on the flow. Do not fabricate values.

## Useful Context Fields

- object or domain identifiers
- feature flags
- version, commit, deployment, or region
- retry attempt
- retry reason or retryable classification
- timeout or deadline context
- idempotency or dedupe key
- queue or backlog age
- degraded-mode or fallback activation
- downstream target or dependency
- error class, error code, or failure reason

## Naming Rules

- prefer one casing convention across the repo
- use the same field name everywhere for the same concept
- avoid embedding data inside message strings when a field exists
- prefer fields that explain the next operational question, not just the code
  branch that ran
