---
title: Keep eval suite IDs separate from runtime skill names
date: 2026-04-19
category: developer-experience
module: flywheel-eval-harness
problem_type: developer_experience
component: test_harness
severity: low
doc_status: active
files_touched:
  - evals/flywheel/manifest.json
  - evals/flywheel/cases.jsonl
  - evals/flywheel/README.md
  - README.md
applies_when:
  - an eval suite name already has history and harness meaning
  - the runtime command surface changes but the suite identity should stay stable
symptoms:
  - the suite id `flywheel` can be mistaken for the router invocation
  - harness labels such as `fw-*` look like command names if the boundary is not stated explicitly
root_cause: contract_mismatch
resolution_type: documentation_update
tags:
  - eval-suite-id
  - runtime-skill-name
  - harness-labels
  - flywheel-evals
  - api-boundary
related_docs:
  - docs/solutions/developer-experience/journey-evals-without-a-harness-redesign-2026-04-19.md
  - docs/solutions/developer-experience/use-flywheel-start-as-the-router-entrypoint-2026-04-19.md
  - docs/solutions/workflow-issues/treat-user-facing-skill-renames-as-contract-sweeps-2026-04-19.md
---

# Keep eval suite IDs separate from runtime skill names

## Context

The Flywheel router now runs as `$fw:start`, but the umbrella eval suite
still uses the stable suite id `flywheel`. That distinction is useful, but only
if the repo states clearly that harness labels are not runtime commands.

## Guidance

Keep eval suite ids stable unless the harness identity itself needs to change.
Keep runtime skill names accurate to the current command surface.

For the router:

```text
runtime command: $fw:start
eval suite id: flywheel
```

If the callable changes, update the eval manifest `skill` field and the literal
case prompts, but do not rename the suite id just to mirror the runtime.

## Why This Matters

Stable suite ids preserve harness history, prepared-run naming, and scoring
identity. Stable runtime names preserve the user API. Blurring the two makes
docs and evals harder to reason about.

## When to Apply

- when `node scripts/flywheel-eval.js prepare <suite>` uses one identifier and
  the runtime uses another
- when README text explains both harness commands and runtime invocations
- when a rename should preserve regression continuity in existing eval packs

## Examples

Harness use:

```text
node scripts/flywheel-eval.js prepare flywheel
```

Runtime use:

```text
Use $fw:start ...
```

Manifest wiring:

```text
id: flywheel
skill: fw:start
```

## Related

- [Journey evals without a harness redesign](docs/solutions/developer-experience/journey-evals-without-a-harness-redesign-2026-04-19.md)
- [Use $fw and $fw:start as Flywheel router entrypoints](docs/solutions/developer-experience/use-flywheel-start-as-the-router-entrypoint-2026-04-19.md)
- [Treat user-facing skill renames as contract sweeps](docs/solutions/workflow-issues/treat-user-facing-skill-renames-as-contract-sweeps-2026-04-19.md)
