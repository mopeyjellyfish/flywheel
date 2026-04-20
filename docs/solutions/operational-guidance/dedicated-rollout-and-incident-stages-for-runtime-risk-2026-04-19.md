---
title: Route runtime-risky work through dedicated rollout and incident stages
date: 2026-04-19
last_updated: 2026-04-19
category: operational-guidance
module: flywheel-runtime-workflows
problem_type: operational_guidance
component: deployment
severity: high
doc_status: active
files_touched:
  - skills/rollout/SKILL.md
  - skills/incident/SKILL.md
  - skills/start/SKILL.md
  - skills/review/SKILL.md
  - skills/ship/SKILL.md
  - skills/debug/SKILL.md
applies_when:
  - a change affects live contracts, state, retries, queues, migrations, or other meaningful blast-radius boundaries
  - work starts from alerts, logs, traces, metrics, or a live customer-impact event instead of a settled local reproducer
symptoms:
  - runtime-risky changes were being flattened directly into shipping
  - live incidents could jump into debug before mitigation versus rollback was framed
root_cause: workflow_gap
resolution_type: workflow_improvement
tags:
  - rollout-planning
  - incident-response
  - blast-radius
  - runtime-risk
  - mitigation
related_docs:
  - docs/solutions/operational-guidance/shared-evidence-bundle-for-stage-handoffs-2026-04-19.md
  - docs/solutions/developer-experience/journey-evals-without-a-harness-redesign-2026-04-19.md
  - docs/solutions/developer-experience/use-flywheel-start-as-the-router-entrypoint-2026-04-19.md
---

# Route runtime-risky work through dedicated rollout and incident stages

## Context

Flywheel already had strong work, review, and ship stages, but runtime-risky
changes and live incidents were too easy to flatten into generic shipping or
bug fixing. That made blast radius, rollback posture, and mitigation choices
too implicit.

## Guidance

Use dedicated stages for the decisions that are unique to live systems:

- `$flywheel:rollout` for staged release posture on runtime-risky changes
- `$flywheel:incident` for live issues that start from runtime evidence and need
  mitigation versus rollback versus patch framing

Do not hide those decisions inside `$flywheel:ship` or `$flywheel:debug`.

Preferred downstream paths:

```text
$flywheel:review -> $flywheel:rollout -> $flywheel:ship
$flywheel:incident -> $flywheel:debug
$flywheel:incident -> $flywheel:rollout -> $flywheel:ship
```

## Why This Matters

Risky release work and active incidents are not ordinary coding tasks. They
need explicit treatment of:

- blast radius
- mixed-state or compatibility windows
- activation sequence
- validation window and owner
- rollback or mitigation trigger

Making those decisions explicit keeps runtime work supportable and prevents
ordinary bug-fix flows from skipping the stabilizing step.

## When to Apply

- when a release changes live queue, retry, timeout, contract, schema, or state
  behavior
- when rollback or staged disablement is a real alternative to patching
- when an incident begins from logs, traces, dashboards, or alerts
- when review concludes the code is clean enough but release posture is still
  unresolved

## Examples

Use rollout for risky release planning:

```text
$flywheel:review -> $flywheel:rollout -> $flywheel:ship
```

Use incident before debug when a live problem is still being framed:

```text
$flywheel:incident -> $flywheel:debug
```

Use incident plus rollout when disablement or rollback is safer than immediate
patching:

```text
$flywheel:incident -> $flywheel:rollout -> $flywheel:ship
```

## Related

- [Shared evidence bundle for stage handoffs](docs/solutions/operational-guidance/shared-evidence-bundle-for-stage-handoffs-2026-04-19.md)
- [Journey evals without a harness redesign](docs/solutions/developer-experience/journey-evals-without-a-harness-redesign-2026-04-19.md)
- [Use $flywheel:start as the Flywheel router entrypoint](docs/solutions/developer-experience/use-flywheel-start-as-the-router-entrypoint-2026-04-19.md)
