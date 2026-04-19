# Signal Design

Use this reference after platform detection.

## Logs

Use logs when the question is:

- what happened to this request, job, or message?
- which tenant, user, object, or external system was involved?
- what was the outcome and why?

Logs should carry:

- stable event name
- outcome or status
- correlation identifiers
- business context that matters for triage
- environment and deployment context
- failure details that support search and grouping

## Traces

Use traces when the question is:

- where did latency accumulate?
- which downstream call or span failed?
- how did this execution move across components?

Traces are especially useful around:

- request lifecycles
- queue or worker execution
- external API or storage boundaries
- fan-out or retry behavior

## Metrics

Use metrics when the question is:

- how often is this succeeding or failing?
- what is the latency distribution?
- is backlog, throughput, or saturation changing over time?

Prefer a small number of durable, high-signal metrics over dashboards packed
with vanity counters.

## Operational Validation

Every runtime-facing change should answer:

- which log queries or search terms help investigate failures?
- which metrics or dashboards show healthy behavior?
- what failure threshold triggers rollback or mitigation?
- who owns the validation window?
