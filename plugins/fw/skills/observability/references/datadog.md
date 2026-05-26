# Datadog

Use this reference only when the repo shows Datadog evidence.

## Durable Guidance

- Extend the repo's existing Datadog usage instead of inventing a parallel
  monitor, tag, or service-naming scheme.
- Preserve stable service, environment, and version tagging if the repo already
  uses them.
- Prefer dashboards, monitors, log queries, and traces the team can actually
  click or search after deploy.
- If the repo uses OTel to send telemetry into Datadog, treat OTel as the
  instrumentation surface and Datadog as the query and alert surface.
- Avoid adding Datadog-only custom fields when adjacent code already has a
  stable query convention.

## Review Pressure

Flag:

- changed runtime behavior with no obvious Datadog-visible validation path
- missing or inconsistent tagging that would hide the change from existing
  dashboards or monitors
- log or trace fields that break common grouping or search workflows in the
  repo
