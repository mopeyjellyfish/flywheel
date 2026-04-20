---
title: Use $flywheel:start as the Flywheel router entrypoint
date: 2026-04-19
category: developer-experience
module: flywheel-command-surface
problem_type: developer_experience
component: tooling
severity: medium
doc_status: active
files_touched:
  - skills/start/SKILL.md
  - .codex-plugin/plugin.json
  - README.md
  - evals/flywheel/
applies_when:
  - the plugin needs one canonical router command for stage selection
  - the plugin namespace and the umbrella router skill would otherwise share the same name
symptoms:
  - the umbrella router surfaced as $flywheel:flywheel
  - repo docs and prompts implied a simpler router command than the runtime exposed
root_cause: contract_mismatch
resolution_type: workflow_improvement
tags:
  - router-entrypoint
  - invocation-contract
  - plugin-namespace
  - skill-naming
  - codex-plugin
related_docs:
  - docs/solutions/workflow-issues/treat-user-facing-skill-renames-as-contract-sweeps-2026-04-19.md
  - docs/solutions/developer-experience/keep-eval-suite-ids-separate-from-runtime-skill-names-2026-04-19.md
---

# Use $flywheel:start as the Flywheel router entrypoint

## Context

Flywheel already had a clean plugin namespace, `flywheel`, but its umbrella
router skill was also named `flywheel`. That produced the awkward invocation
`$flywheel:flywheel` while the repo docs and prompts were teaching a simpler
router concept.

## Guidance

Keep the plugin namespace and the umbrella router skill distinct.

For Flywheel, the canonical router entrypoint is:

```text
$flywheel:start
```

Keep stage skills under the same namespace:

```text
$flywheel:plan
$flywheel:work
$flywheel:spin
```

Do not use a router skill name that simply repeats the plugin namespace when
the runtime will expose that repetition directly to users.

## Why This Matters

A distinct router name removes namespace stutter, makes the command surface
more legible, and aligns the plugin package model with the callable skill
model. It also gives the repo one stable string to teach everywhere.

## When to Apply

- when a plugin exposes one umbrella router plus multiple stage skills
- when the plugin namespace and the default router name would otherwise collide
- when docs, prompts, or eval inputs need one explicit router command

## Examples

Preferred router:

```text
$flywheel:start
```

Stage execution stays explicit:

```text
$flywheel:start
$flywheel:brainstorm
$flywheel:plan
```

Avoid the repeated form:

```text
$flywheel:flywheel
```

## Related

- [Treat user-facing skill renames as contract sweeps](docs/solutions/workflow-issues/treat-user-facing-skill-renames-as-contract-sweeps-2026-04-19.md)
- [Keep eval suite IDs separate from runtime skill names](docs/solutions/developer-experience/keep-eval-suite-ids-separate-from-runtime-skill-names-2026-04-19.md)
