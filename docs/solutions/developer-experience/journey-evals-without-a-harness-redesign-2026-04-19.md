---
title: Add journey evals without redesigning the Flywheel eval harness
date: 2026-04-19
category: developer-experience
module: flywheel-eval-harness
problem_type: developer_experience
component: test_harness
severity: medium
doc_status: active
files_touched:
  - scripts/flywheel-eval.js
  - tools/evals/src/scoring/index.cjs
  - tools/evals/src/scoring/flywheel-runtime-change.cjs
  - tools/evals/src/scoring/flywheel-incident-response.cjs
  - evals/flywheel-runtime-change/
  - evals/flywheel-incident-response/
applies_when:
  - a Flywheel change needs regression coverage for a multi-stage workflow rather than a single skill
  - the existing per-skill eval model already works and should be extended additively
symptoms:
  - per-skill eval packs could not express runtime-change or incident-response journeys
  - adding scenario coverage risked turning into a harness redesign
root_cause: workflow_gap
resolution_type: tooling_addition
tags:
  - eval-harness
  - journey-suites
  - regression-testing
  - suite-type
  - workflow-testing
related_docs:
  - docs/solutions/operational-guidance/dedicated-rollout-and-incident-stages-for-runtime-risk-2026-04-19.md
  - docs/solutions/operational-guidance/shared-evidence-bundle-for-stage-handoffs-2026-04-19.md
---

# Add journey evals without redesigning the Flywheel eval harness

## Context

Flywheel needed regression coverage for end-to-end runtime-change and
incident-response paths, but the existing eval harness was already working well
for per-skill packs. Replacing it would have added maintenance cost and likely
broken the current validator and prepare flow.

## Guidance

Extend the existing harness with a thin journey layer instead of inventing a
separate scenario platform.

Use the same suite contract:

- `manifest.json`
- `cases.jsonl`
- `rubric.md`

Add only the minimum extra metadata for journey suites:

- `suiteType: "journey"`
- `journeyStages: [...]`

Keep the same `prepare`, `validate`, and `summarize` commands. Register
deterministic scorers for the new journey suites alongside the existing
single-skill scorers.

## Why This Matters

This preserves the current harness as the source of truth while making it
possible to score cross-stage regressions such as:

- runtime-risky change paths
- incident response paths

The result is additive coverage instead of a parallel eval product.

## When to Apply

- when a new workflow spans multiple Flywheel stages and needs regression
  coverage
- when the existing suite model already captures enough metadata to stay usable
- when maintainability matters more than introducing a new scenario framework

## Examples

New journey suites:

```text
evals/flywheel-runtime-change/
evals/flywheel-incident-response/
```

Minimal harness extension:

```text
manifest.suiteType = "journey"
manifest.journeyStages = [...]
```

Prepare still works through the existing command:

```text
node scripts/flywheel-eval.js prepare flywheel-runtime-change
node scripts/flywheel-eval.js prepare flywheel-incident-response
```

## Related

- [Dedicated rollout and incident stages for runtime risk](docs/solutions/operational-guidance/dedicated-rollout-and-incident-stages-for-runtime-risk-2026-04-19.md)
- [Shared evidence bundle for stage handoffs](docs/solutions/operational-guidance/shared-evidence-bundle-for-stage-handoffs-2026-04-19.md)
