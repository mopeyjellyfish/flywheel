# OpenTelemetry Review Basis

Use this reference only when the OTel stack pack is selected.

## Truth Order

1. Repo truth first: local instrumentation helpers, config, collector files,
   manifests, env examples, and adjacent code.
2. Existing repo naming and attribute conventions.
3. Durable OTel guidance: correlate logs, traces, and metrics through shared
   context and stable attributes.

## Review Pressure

- preserve or extend trace-context propagation across changed boundaries
- keep attribute names stable when the same concept appears in multiple signals
- prefer existing logging-library appenders or bridges over parallel bespoke
  pipelines
- do not emit telemetry in one place and forget the correlation fields needed
  downstream

## Source Links

- OpenTelemetry logs specification:
  https://opentelemetry.io/docs/specs/otel/logs/
