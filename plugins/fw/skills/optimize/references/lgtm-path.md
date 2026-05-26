# OTel-Native / LGTM Collection Path

Use this path when the repo is OpenTelemetry-first or when Grafana,
Prometheus or Mimir, Loki, Tempo, and Pyroscope are the real operational
surfaces.

LGTM is a collection label, not a single service. Use the specific surfaces the
repo and environment actually expose.

## What To Pin First

- service name
- env / namespace / cluster
- version, rollout label, or feature-flag segment
- endpoint, span name, job, queue, or worker
- stable labels shared across metrics, logs, traces, and profiles

## Signal Surfaces

- **Metrics** - Prometheus or Mimir, usually queried through PromQL
- **Logs** - Loki, usually queried through LogQL
- **Traces** - Tempo, often via Grafana Explore or TraceQL-style filters
- **Profiles** - Pyroscope when CPU or allocation hotspots matter

## Environment Modes

- **Local dev stack** - valid for relative improvement work when the workload
  is stable and representative enough to compare before vs after
- **Shared non-production** - useful when local behavior diverges from the real
  deployment shape
- **Production** - use only when realistic traffic is required and labels can
  isolate the change cleanly

## Good LGTM Posture

- prefer the same label set across signals so you can pivot cleanly
- use exemplars or trace links when available
- compare the same workload and same rollout slice
- keep the exact dashboard, Explore view, or query expression in the run notes
- if the repo is OTLP-based, verify the collector and label mapping before
  trusting the dashboards

## Development And Test Environments

For self-managed development or demo stacks, the Grafana `docker-otel-lgtm`
path is useful for fast OpenTelemetry-backed testing and for relative
improvement checks, but it is still a development surface. Treat production
claims separately.

## Common Mistakes

- mixing labels between metrics, logs, and traces so correlation breaks
- comparing dashboards built from different rollouts or time windows
- optimizing a PromQL proxy metric without checking traces or logs for the real
  cause
- ignoring profile data when the bottleneck is CPU or allocation driven
