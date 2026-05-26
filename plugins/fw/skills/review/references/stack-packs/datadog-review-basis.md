# Datadog Review Basis

Use this reference only when the Datadog stack pack is selected.

## Truth Order

1. Repo truth first: local wrappers, tag conventions, saved-query examples,
   deployment docs, and adjacent instrumentation.
2. Existing dashboard, monitor, and log-query surfaces already named in the
   repo.
3. Durable Datadog usage shape: stable service and environment tagging plus
   supportable log and trace queries.

## Review Pressure

- preserve stable service, env, and version tagging
- make sure changed behavior remains visible in the log, trace, and monitor
  surfaces the repo already relies on
- avoid vendor-specific field churn when adjacent code already defines the query
  contract

## Source Links

- Datadog OpenTelemetry docs:
  https://docs.datadoghq.com/opentelemetry/
