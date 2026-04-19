# Platform Detection

Detect the repo's real observability stack before recommending anything.

## Search Order

1. Written instructions:
   - `AGENTS.md`
   - `CLAUDE.md`
   - deployment or monitoring docs
2. Dependency and manifest files
3. Config and infra files
4. Existing code near the affected surface
5. CI, deployment, or runtime env examples

## Common Signals

### OpenTelemetry

Look for:

- `opentelemetry`
- `@opentelemetry/`
- `otel`
- OTLP exporters
- Collector config
- `TraceId`, `SpanId`, `traceparent`
- semantic-convention packages

### Datadog

Look for:

- `datadog`
- `dd-trace`
- `datadog-ci`
- `DD_SERVICE`, `DD_ENV`, `DD_VERSION`
- Datadog agent config
- named monitors, dashboards, or log queries

### Other common observability signals

Look for:

- Grafana, Prometheus, Loki
- Sentry, Bugsnag, Rollbar, AppSignal, Honeycomb, Better Stack, New Relic
- repo-local logger wrappers or instrumentation helpers

## Decision Rules

- If the repo already has one clear stack, extend it.
- If the repo uses OTel feeding a vendor backend, treat OTel as the
  instrumentation path and the vendor as the consumption surface.
- If multiple tools exist, prefer the one adjacent code already uses for the
  affected surface.
- If the repo has no clear stack, stay vendor-neutral and design the signal
  plan around stable structured fields and explicit validation checks.
