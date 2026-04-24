---
title: Make commit the user-facing finish stage and move message drafting into a helper
date: 2026-04-21
last_updated: 2026-04-24
category: workflow-issues
module: flywheel-finish-stage
problem_type: workflow_issue
component: developer_workflow
severity: medium
doc_status: active
files_touched:
  - README.md
  - skills/start/SKILL.md
  - skills/run/SKILL.md
  - skills/commit/SKILL.md
  - skills/spin/SKILL.md
  - skills/shape/SKILL.md
  - skills/commit-message/SKILL.md
  - skills/work/references/commit-workflow.md
  - evals/flywheel/
  - evals/fw-commit/manifest.json
  - tools/evals/src/scoring/fw-commit.cjs
applies_when:
  - the branch-finishing command no longer matches the word developers naturally reach for
  - a finish-stage rename also changes what the stage owns and how downstream handoffs work
symptoms:
  - users reach for commit, but the repo teaches a different finishing command
  - commit planning and commit-message drafting are split awkwardly across separate stages
  - workflow docs, config, and evals drift because the rename is treated as a label change instead of a finish-stage rewrite
root_cause: workflow_gap
resolution_type: workflow_improvement
tags:
  - finish-stage
  - commit-command
  - helper-split
  - branch-finish
  - workflow-contract
  - command-surface
related_docs:
  - docs/solutions/workflow-issues/treat-user-facing-skill-renames-as-contract-sweeps-2026-04-19.md
---

# Make commit the user-facing finish stage and move message drafting into a helper

## Context

Flywheel originally taught `ship` as the final branch-finishing stage while
`commit` only drafted Conventional Commit text. That split made the product
harder to remember at the point where developers most often want a single
command: finish the branch cleanly.

The migration from `ship` to `commit` was not just a rename. It promoted
`commit` into the full finish-stage command and moved commit-message drafting
into a helper skill. A later workflow correction kept `commit` as the remembered
finish command, but moved conditional `spin` before the final commit so solution
docs created from the session can land in the same logical change set.

## Guidance

When the visible finish-stage command changes, treat it as a workflow-contract
rewrite, not a wording pass.

Use these rules:

- make the user-facing finish-stage command own the whole branch-finishing job:
  pre-commit spin checkpoint, logical commit planning, local commits, push, and
  PR create or refresh
- publish by default after local commits are ready: push the branch and create
  or refresh the PR unless the user explicitly requested `local-only`
- run conditional `spin` before staging and committing when the completed work
  surfaced a durable project lesson, so the `docs/solutions/` update is reviewed
  and committed with the work that produced it
- keep narrower support concerns in helpers; for commit flows, message drafting
  belongs in `commit-message`, called by `commit`
- keep direct `commit` invocation moving forward; auto-run missing finish-stage
  checks and review when needed, and stop only on real blockers
- when the diff should be split, show a short multi-commit plan before
  execution instead of silently inventing commit boundaries
- sweep every active workflow surface that teaches the finish stage, including
  README guidance, router language, config policy text, skill docs, active
  solution docs, eval suite names, and scorer wiring

## Why This Matters

The visible finish-stage command is part of the product interface. If the
command name does not match the job users expect, or if the heavy lifting is
hidden in another stage, the loop becomes harder to remember and easier to use
incorrectly.

Splitting the responsibilities cleanly also makes later repo work faster.
Future changes to finish-stage behavior land in one canonical stage, while
`commit-message` stays a narrow reusable helper instead of competing with the
main user mental model.

## When to Apply

- when a finish-stage rename changes the command developers should learn and
  remember
- when one stage currently owns the real branch-finishing workflow and another
  stage only owns a narrow helper concern
- when config, evals, or docs still teach an older finish-stage contract after
  the runtime behavior has moved

## Examples

For the `ship` -> `commit` migration, the canonical sweep included:

```text
README.md
skills/start/SKILL.md
skills/commit/SKILL.md
skills/commit-message/SKILL.md
skills/work/references/commit-workflow.md
.flywheel/config.local.example.yaml
evals/fw-commit/
tools/evals/src/scoring/fw-commit.cjs
```

The resulting product loop became:

```text
shape -> work -> review -> optional spin -> commit
```

With that contract:

- `commit` is the single remembered finish-stage command
- `commit` defaults to commit, push, and PR creation or refresh
- `commit-message` is an internal helper used by `commit`
- `spin` stays conditional and captures durable lessons worth keeping before the
  final commit is made

## Related

- [Treat user-facing skill renames as contract sweeps](docs/solutions/workflow-issues/treat-user-facing-skill-renames-as-contract-sweeps-2026-04-19.md)
