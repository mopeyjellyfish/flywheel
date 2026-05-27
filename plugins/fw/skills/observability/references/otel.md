# OpenTelemetry

Use this reference only when the repo shows OpenTelemetry evidence.

## Durable Guidance

- OpenTelemetry standardizes telemetry transport and data models. It does not
  decide what business context to emit.
- Prefer the repo's existing OTel path over a second custom telemetry path.
- Correlate logs with traces by carrying trace and span context when the stack
  supports it.
- Reuse resource attributes, service identity, and existing semantic fields
  instead of inventing parallel names.
- When the repo already uses logging libraries, prefer the established appender
  or bridge approach over rewriting logging wholesale.
- Keep attribute names stable across logs, traces, and metrics when they refer
  to the same thing.

## Review Pressure

Flag:

- missing trace context propagation across changed boundaries
- new logs that drop correlation fields already present elsewhere
- span additions that ignore existing naming or attribute conventions
- greenfield instrumentation that duplicates an existing collector or exporter
