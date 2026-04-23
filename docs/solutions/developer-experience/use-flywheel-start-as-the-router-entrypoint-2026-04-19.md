---
title: Use $fw and $fw:start as Flywheel router entrypoints
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
  - a bare plugin-root invocation should choose the right workflow stage
  - the plugin namespace and the umbrella router skill would otherwise share the same name
symptoms:
  - the umbrella router surfaced as $fw:flywheel
  - repo docs and prompts implied a simpler router command than the runtime exposed
  - users expect bare $fw or $flywheel to enter the main router instead of naming a stage
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

# Use $fw and $fw:start as Flywheel router entrypoints

## Context

Flywheel already had a clean plugin namespace, `flywheel`, but its umbrella
router skill was also named `flywheel`. That produced the awkward invocation
`$fw:flywheel` while the repo docs and prompts were teaching a simpler
router concept. Later, users also expected the plugin root itself to behave as
the router rather than forcing a stage suffix before Flywheel can route the
request.

## Guidance

Keep the plugin namespace and the umbrella router skill distinct.

For Flywheel, the canonical router entrypoints are:

```text
$fw
$fw:start
```

If a user writes bare `$flywheel` as plain text, treat it the same way, then
keep rendering follow-up commands as `$fw:<stage>`.

Keep stage skills under the same namespace:

```text
$fw:shape
$fw:work
$fw:review
$fw:commit
$fw:spin
```

Do not use a router skill name that simply repeats the plugin namespace when
the runtime will expose that repetition directly to users.

## Why This Matters

A distinct router name removes namespace stutter, while a bare `$fw` root alias
keeps the easiest entrypoint ergonomic. The repo still teaches one canonical
stage namespace, `$fw:<stage>`, so follow-up commands remain explicit and
stable.

## When to Apply

- when a plugin exposes one umbrella router plus multiple stage skills
- when a plugin root invocation should enter the umbrella router
- when the plugin namespace and the default router name would otherwise collide
- when docs, prompts, or eval inputs need one explicit router command

## Examples

Preferred router:

```text
$fw
$fw:start
```

Stage execution stays explicit:

```text
$fw:shape
$fw:work
$fw:review
```

Avoid the repeated form:

```text
$fw:flywheel
```

## Related

- [Treat user-facing skill renames as contract sweeps](docs/solutions/workflow-issues/treat-user-facing-skill-renames-as-contract-sweeps-2026-04-19.md)
- [Keep eval suite IDs separate from runtime skill names](docs/solutions/developer-experience/keep-eval-suite-ids-separate-from-runtime-skill-names-2026-04-19.md)
