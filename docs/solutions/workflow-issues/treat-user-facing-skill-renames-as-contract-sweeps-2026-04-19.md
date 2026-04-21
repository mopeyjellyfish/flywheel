---
title: Treat user-facing skill renames as contract sweeps
date: 2026-04-19
category: workflow-issues
module: flywheel-command-surface
problem_type: workflow_issue
component: developer_workflow
severity: medium
doc_status: active
last_updated: 2026-04-21
files_touched:
  - skills/start/SKILL.md
  - .codex-plugin/plugin.json
  - README.md
  - evals/flywheel/manifest.json
  - evals/flywheel/cases.jsonl
  - evals/flywheel/README.md
applies_when:
  - a user-facing Flywheel skill name changes
  - prompts, README guidance, and eval cases teach the invocation string directly
symptoms:
  - the runtime callable changed but default prompts and examples still taught the old form
  - eval packs still exercised the previous invocation contract
root_cause: workflow_gap
resolution_type: workflow_improvement
tags:
  - rename-sweep
  - invocation-contract
  - plugin-manifest
  - eval-pack
  - doc-sync
related_docs:
  - docs/solutions/developer-experience/use-flywheel-start-as-the-router-entrypoint-2026-04-19.md
  - docs/solutions/developer-experience/keep-eval-suite-ids-separate-from-runtime-skill-names-2026-04-19.md
  - docs/solutions/developer-experience/journey-evals-without-a-harness-redesign-2026-04-19.md
  - docs/solutions/workflow-issues/make-commit-the-user-facing-finish-stage-2026-04-21.md
---

# Treat user-facing skill renames as contract sweeps

## Context

Renaming Flywheel's umbrella router from `flywheel` to `start` was not just a
single skill edit. The command string appears in plugin prompts, repo docs,
eval manifests, eval case prompts, and manual instructions.

## Guidance

Treat any user-facing skill rename as a repo-wide contract sweep.

At minimum, update:

- the skill path and frontmatter name
- `.codex-plugin/plugin.json` default prompts
- README command examples and naming rules
- eval manifest `skill` values
- eval case prompts and expected handoff text
- eval README manual-run instructions

After the sweep, run:

```text
node scripts/flywheel-eval.js validate
```

Do not consider the rename complete just because the skill file itself moved.

## Why This Matters

Flywheel teaches its invocation surface directly in repo text. If only one
layer changes, the repo starts advertising commands that no longer match the
runtime, and eval coverage stops testing the canonical user path.

## When to Apply

- when a skill name or invocation string appears in README examples
- when plugin prompts seed the host with the callable command
- when eval packs include literal user prompts for that command

## Examples

For the router rename to `$flywheel:start`, the sweep touched:

```text
skills/start/SKILL.md
.codex-plugin/plugin.json
README.md
evals/flywheel/manifest.json
evals/flywheel/cases.jsonl
evals/flywheel/README.md
```

## Related

- [Use $flywheel:start as the Flywheel router entrypoint](docs/solutions/developer-experience/use-flywheel-start-as-the-router-entrypoint-2026-04-19.md)
- [Keep eval suite IDs separate from runtime skill names](docs/solutions/developer-experience/keep-eval-suite-ids-separate-from-runtime-skill-names-2026-04-19.md)
- [Journey evals without a harness redesign](docs/solutions/developer-experience/journey-evals-without-a-harness-redesign-2026-04-19.md)
- [Make commit the user-facing finish stage and move message drafting into a helper](docs/solutions/workflow-issues/make-commit-the-user-facing-finish-stage-2026-04-21.md)
