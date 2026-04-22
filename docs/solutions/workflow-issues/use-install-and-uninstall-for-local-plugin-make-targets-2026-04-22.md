---
title: Use install and uninstall for local plugin Make targets
date: 2026-04-22
category: workflow-issues
module: flywheel-local-plugin-make-targets
problem_type: workflow_issue
component: developer_workflow
severity: medium
doc_status: active
files_touched:
  - Makefile
  - README.md
  - AGENTS.md
  - docs/setup/compatibility.md
  - docs/setup/troubleshooting.md
  - scripts/flywheel-doctor.js
  - tools/evals/src/doctor.cjs
applies_when:
  - local Make targets expose plugin lifecycle actions such as install, refresh, or teardown
  - developers need to predict the right Flywheel setup command without rereading repo docs
symptoms:
  - developers reach for install or uninstall, but the repo teaches dev or remove
  - setup and troubleshooting docs drift because lifecycle verbs do not match the job being performed
  - narrow refresh helpers and full install flows feel related, but the command names do not explain that relationship cleanly
root_cause: workflow_gap
resolution_type: workflow_improvement
tags:
  - make-targets
  - install-uninstall
  - local-plugin
  - developer-workflow
  - command-surface
related_docs:
  - docs/solutions/workflow-issues/treat-user-facing-skill-renames-as-contract-sweeps-2026-04-19.md
---

# Use install and uninstall for local plugin Make targets

## Context

Flywheel's local host commands originally mixed verbs like `dev`, `refresh`,
and `remove` for the same plugin lifecycle. The commands worked, but the names
did not match the intent developers naturally reach for when setting up or
tearing down a local plugin install.

## Guidance

For local plugin lifecycle commands, prefer `install/*` and `uninstall/*` as
the top-level Make target verbs.

Use this structure:

- `install/<host>` for the full local install or reinstall flow
- `install/<host>/force-*` when the install flow needs an explicit override
- `install/<host>/refresh/...` for narrower maintenance helpers that reuse the
  same install surface
- `uninstall/<host>` for teardown
- `install/all` and `uninstall/all` when both hosts should move together

Treat the Make target names as a user-facing contract sweep. When the command
surface changes, update the current docs, doctor guidance, helper script output,
and any PR or setup examples that teach those commands directly.

## Why This Matters

`install` and `uninstall` describe the job directly. They reduce the gap
between what maintainers think they want to do and the command Flywheel
teaches them to run.

That clarity matters in setup and troubleshooting flows. If the verbs feel
indirect, developers have to remember repo-specific jargon instead of following
the lifecycle they already expect. Keeping narrower refresh helpers nested
under `install/<host>/refresh/...` also preserves discoverability without
splitting the mental model into separate unrelated families.

## When to Apply

- when a Make target provisions or reinstalls Flywheel into a host
- when a Make target removes Flywheel from a host
- when narrower maintenance helpers are really sub-actions of the same install
  surface

## Examples

Prefer:

```text
make install/codex
make install/claude
make install/codex/refresh/dry-run
make uninstall/all
```

Instead of teaching lifecycle work through less direct verbs such as:

```text
make dev/codex
make refresh/codex
make remove/all
```

In this repo, the canonical sweep for that rename included:

```text
Makefile
README.md
AGENTS.md
docs/setup/compatibility.md
docs/setup/troubleshooting.md
scripts/flywheel-doctor.js
tools/evals/src/doctor.cjs
```

## Related

- [Treat user-facing skill renames as contract sweeps](docs/solutions/workflow-issues/treat-user-facing-skill-renames-as-contract-sweeps-2026-04-19.md)
