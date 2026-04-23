---
title: Protect Authored Skills During npx skills Cleanup
date: 2026-04-23
category: developer-experience
module: flywheel-skills-install-cleanup
problem_type: developer_experience
component: developer_workflow
severity: high
doc_status: active
files_touched:
  - Makefile
  - scripts/skills-install.sh
  - scripts/skills-remove.sh
  - README.md
  - AGENTS.md
  - docs/setup/compatibility.md
  - docs/setup/troubleshooting.md
applies_when:
  - changing Flywheel's `npx skills` install or uninstall behavior
  - running install or uninstall Make targets from the Flywheel repo root
  - debugging why Flywheel remains visible after `make uninstall/all`
symptoms:
  - `make uninstall/all` removes tracked files from the repo-root `skills/` source tree
  - Codex still shows Flywheel after uninstall because global `~/.agents/skills` directories remain
  - `~/.agents/.skill-lock.json` does not list Flywheel even though Flywheel skill directories still exist
root_cause: wrong_api_assumption
resolution_type: tooling_addition
tags:
  - skills-cli
  - uninstall-safety
  - source-tree
  - stale-locks
  - local-install
  - codex-visibility
related_docs:
  - docs/solutions/developer-experience/treat-claude-auth-as-environmental-in-broad-doctor-smoke-2026-04-23.md
  - docs/solutions/workflow-issues/use-install-and-uninstall-for-local-plugin-make-targets-2026-04-22.md
---

# Protect Authored Skills During npx skills Cleanup

## Context

Flywheel added `npx skills` support so the same local checkout could be
installed through the public `skills` CLI used by skills-CLI hosts. The first
implementation treated project scope like an isolated install output and
treated the global skills lock as authoritative.

Both assumptions were wrong for this repo. The `skills` CLI project scope writes
to the current directory's `skills/` tree, which is Flywheel's authored product
source when commands run from the Flywheel repo root. Separately, stale global
Flywheel directories can remain in `~/.agents/skills` even when
`~/.agents/.skill-lock.json` no longer records them, so lock-only uninstall can
leave Flywheel visible to fresh Codex sessions.

## Guidance

Keep repo-root install and uninstall commands usable, but make repo-root project
scope non-destructive.

Use these rules:

- `make install/all` may install the local checkout globally through
  host-specific plugin paths, but it should not leave standalone global
  Flywheel skills visible to Codex.
- Codex should use the Flywheel plugin install. Standalone global skills expose
  entries such as `$start`, which conflicts with the canonical `$fw:start`
  plugin surface.
- `make install/skills/global` may install the local checkout through
  `npx skills add <repo>/skills --global --skill '*' --agent claude-code --agent opencode --yes`.
- `make install/skills/project` from the Flywheel repo root should validate
  `./skills` and exit successfully without running `skills add`, because the
  destination is the same authored source tree.
- project-scope installs for another repo should run the helper from that target
  repo, using the Flywheel checkout as the source path.
- `make uninstall/all` may remove global `npx skills` installs and host plugin
  installs, but it must never invoke `skills remove` against repo-root
  `./skills`.
- global uninstall should combine lock-file matches with an on-disk fingerprint
  fallback for stale Flywheel directories. Scan installed skill directories so
  old renamed Flywheel skills are removed too. For current local skill names,
  Flywheel branding or Flywheel command text is enough; for unknown stale names,
  require both Flywheel branding and Flywheel command text before treating an
  unlocked directory as a stale Flywheel install.

## Why This Matters

The repo-root `skills/` directory is product code, not disposable install state.
Deleting it during cleanup destroys the source package needed for local
development and makes later installs fall back or fail.

The stale-global-skill case is the opposite failure mode: the source tree is
protected, but the installed copy remains and Codex still exposes Flywheel after
the user explicitly ran `make uninstall/all`. A reliable teardown path must
clean both host plugin state and stale global `npx skills` state.

## When to Apply

- when changing `scripts/skills-install.sh` or `scripts/skills-remove.sh`
- when adding new `install/skills/*` or `uninstall/skills/*` Make targets
- when `npx skills ls -g` still shows Flywheel after uninstall
- when `git status --short skills` shows deletions after cleanup

## Examples

Safe repo-root project install behavior:

```text
make install/skills/project
OK  project-scope Flywheel skills are served directly from /path/to/flywheel/skills
OK  not running `skills add` because project scope would write back into this repo's authored skills source
```

Safe repo-root uninstall behavior:

```text
make uninstall/all
OK  removing 29 Flywheel skill(s) from global scope
OK  skipping project-scope skills removal because /path/to/flywheel/skills is this checkout's authored skills source
```

Validation after cleanup:

```text
npx skills ls -g
codex debug prompt-input test
git diff --name-only --diff-filter=D
find skills -maxdepth 2 -name SKILL.md
```

Expected result: no global Flywheel skills, no `fw` plugin surface in fresh
Codex prompt input, no tracked deletions, and all 29 authored skill files still
present.

## Related

- [Treat Claude auth as environmental in broad doctor smoke](docs/solutions/developer-experience/treat-claude-auth-as-environmental-in-broad-doctor-smoke-2026-04-23.md)
- [Use install and uninstall for local plugin Make targets](docs/solutions/workflow-issues/use-install-and-uninstall-for-local-plugin-make-targets-2026-04-22.md)
