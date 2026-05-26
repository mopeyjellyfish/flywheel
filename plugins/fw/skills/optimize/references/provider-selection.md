# Provider Selection

Choose the measurement source from repo truth first, user-confirmed access
second, and convenience last.

## Datadog Signals

Indicators that Datadog is likely the operational front door:

- Datadog SDKs, tracers, or log shippers in the repo
- `DD_` environment variables or Datadog agent configuration
- Datadog dashboard, monitor, or notebook references
- service tags such as `service`, `env`, `version` already aligned to Datadog
- team language indicating Datadog monitors or APM are the place they debug

Use the Datadog path only when the user can actually query it, typically
through Datadog MCP or another approved read path.

## OTel-Native Signals

Indicators that OTel-native tooling is the operational front door:

- OpenTelemetry SDKs or OTLP exporters in the repo
- Grafana, Loki, Tempo, Mimir, Pyroscope, Alloy, Prometheus, or otelcol config
- PromQL, LogQL, TraceQL, or Grafana dashboard references in docs or code
- `OTEL_` environment variables or collector pipelines
- team language indicating Grafana Explore, Prometheus, Loki, Tempo, or
  Pyroscope are the real debugging surfaces

Use the OTel-native path when the repo is OTel-first and the user can actually
read the relevant Grafana or backend surfaces.

## Local-Only Signals

Use local-only when:

- the code is not deployed anywhere relevant yet
- the hotspot is build, test, bundle, or machine-local performance
- remote access is unavailable
- the runtime signal is too noisy to guide iteration and a local benchmark or
  profile is the real bottleneck detector

## Environment Selection

After choosing the backend family, choose the environment separately:

- **Local dev stack** when the service and telemetry stack can run on the
  machine and the goal is relative improvement under a stable workload
- **Shared non-production** when local signals are incomplete and the team has
  a safer shared environment
- **Production** when only real traffic can answer the question, and labels or
  rollout binding can isolate the experiment cleanly

LGTM is only a collection label. In practice the relevant surface may be one or
more specific services such as Grafana, Prometheus or Mimir, Loki, Tempo, or
Pyroscope.

## Hybrid Guidance

Hybrid is often the honest answer:

- local benchmark or profile to iterate quickly
- shared telemetry to validate the real-world effect

Recommend hybrid when both of these are true:

- there is a fast local way to reproduce the hotspot or a representative proxy
- there is a trustworthy shared telemetry surface to confirm the improvement

## Tie-Breakers

When both Datadog and OTel-native surfaces are visible:

1. prefer the system that is actually used for day-to-day support
2. prefer the one whose service, env, and version labeling is already stable
3. prefer the one with the most direct access to the target signal
4. if still ambiguous, ask the user which is the source of truth
