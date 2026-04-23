# flywheel

This repository contains the Flywheel plugin for Codex and Claude Code.

## Philosophy

Each unit of development work should make the next one faster.

Traditional development leaks momentum. Ideas stay fuzzy for too long,
implementation starts before the path is clear, review happens after the risky
decisions are already made, and useful lessons disappear into chat history, PR
comments, or memory.

Flywheel keeps the loop compact:

- shapes the change with the user before coding
- works from a reviewed plan
- reviews the diff before commit
- finishes the branch cleanly
- spins durable lessons back into the repo

In Flywheel, docs are stored energy. Plans, solutions, workflow rules, rollout
notes, and user corrections are not side artifacts. They are repo knowledge
that later work can recover instead of rediscovering.

That is the point of the product: finish the current task and make the next
one faster.

## Install

### Codex

```bash
make install/codex
```

Codex should use the Flywheel plugin install. The standalone `skills` CLI
install exposes each skill without the plugin namespace, which makes Codex show
commands such as `$start` instead of `$fw:start`.

From this checkout, `make install/codex` refreshes the local plugin cache and
removes standalone global Flywheel skills from `~/.agents/skills` so the
namespaced `$fw:*` command surface is the only Flywheel surface Codex sees.

### Skills CLI for Claude Code and OpenCode

```bash
npx skills add mopeyjellyfish/flywheel --global --skill '*' --agent claude-code --agent opencode --yes
```

From a Flywheel checkout, the matching Make target is:

```bash
make install/skills/global
```

That target uses `npx skills add` too, but it is local-checkout only and avoids
the Codex agent target. It expects this repo to expose an installable `skills/`
package and fails fast if the local `skills/` tree is missing or empty. It does
not silently fall back to the published GitHub package.

Then in your tool of choice:

```text
fw:setup
```

Use the host's native syntax:

- Codex: `$fw:<stage>`
- Claude Code: `/fw:<stage>`

In Codex, bare `$fw` is the root router alias for `$fw:start`: it chooses the
earliest useful stage across `shape -> work -> review -> commit -> spin`. If a
user writes bare `$flywheel`, treat it as the same root request but keep
follow-up commands on the canonical `$fw:<stage>` surface.

Flywheel's interaction contract is shared across hosts: use the host's
structured choice UI instead of asking for raw `1/2/3` replies. Claude Code
uses `AskUserQuestion`, Codex uses `request_user_input` when the active runtime
exposes it, and OpenCode uses `question`. Risky-edge hook guardrails are
bundled with the Claude plugin install. Codex uses an optional global
`~/.codex/hooks.json` guardrail because current Codex hooks are repo-local or
user-global rather than plugin-bundled.

### Getting started

Run `fw:setup` in any project after installing. Use `$fw:setup` in
Codex or `/fw:setup` in Claude Code. It inspects the repo,
checks the local workflow surface, and shows what is missing before you start
shaping or finish-stage work.

If you want repo-local defaults for browser proof, finish-stage policy, optimization, or
workflow gates, copy:

```text
.flywheel/config.local.example.yaml -> .flywheel/config.local.yaml
```

## Workflow

```text
shape -> work -> review -> commit -> spin -> repeat
```

| Command | Purpose |
| --- | --- |
| `$fw` or `$fw:start` | Route a repo task into the right stage when you do not want to pick one yourself. |
| `$fw:shape` | Shape the work through ideation, brainstorming, planning, or plan-deepening before execution. |
| `$fw:work` | Execute the plan against repo truth and pull in helper stages when the task needs them. |
| `$fw:review` | Review the finished diff with reviewer personas selected from the change. |
| `$fw:commit` | Commit, push, and create or refresh the PR with the right context. |
| `$fw:spin` | Capture durable lessons in `docs/solutions/` so later work starts faster. |

`shape` is the first main workflow stage. Inside it, `ideate` helps choose
among multiple bets, `brainstorm` sharpens one direction with the user, `plan`
writes the implementation path, and `deepen` strengthens a reviewed plan when
needed. Before `work` starts, Flywheel runs `document-review` on the plan and
lets the user choose whether to deepen the plan or start execution.

When topic investigation or current best practices are the real question,
Flywheel can pull in `research` inside shaping or review to sharpen the next
artifact or finding set. When
boundaries, pattern choices, or code-quality pressure are the real question,
Flywheel can pull in focused helper surfaces such as `architecture-strategy`,
`pattern-recognition`, `maintainability`, and `simplify` without turning any
of them into new mandatory visible stages.

`work` is the execution stage. It can pull in `docs`, `debug`, `browser-test`,
`verify`, `rollout`, `observability`, `logging`, `architecture-strategy`,
`pattern-recognition`, `maintainability`, `simplify`, `optimize`, or
`worktree` when the task actually needs them.

`review` is the default gate after work. `commit` finishes the branch cleanly.
`spin` is how Flywheel stores the lesson so the next task starts with more repo
knowledge than the last one.

Common starts:

- new feature or vague idea: `$fw` or `$fw:shape`
- research a topic or current best practices: `$fw`, or
  `$fw:research` when the research brief itself is the main artifact
- known scoped change: `$fw:shape`
- architecture or pattern decision: `$fw:architecture-strategy` or `$fw:pattern-recognition`
- bug with an unclear cause: `$fw:debug`
- one bounded pass through the remaining stages: `$fw:run`

---

## Development

Everything below is for working on Flywheel itself.

### Local development

From this checkout:

Claude Code:

```bash
make install/claude
```

Codex:

```bash
make install/codex
```

Restart the host session after either command finishes.

To install the Flywheel skills through `npx skills` for non-Codex skills-CLI
hosts:

```bash
make install/skills/global
```

Do not use this as the Codex install path. Codex reads standalone global skills
as unnamespaced commands such as `$start`; `make install/codex` removes those
standalone Flywheel skills and installs the namespaced plugin surface instead.

To install them at project scope in another repo:

```bash
cd /path/to/target-repo
/path/to/flywheel/scripts/skills-install.sh --scope project --source local
```

Project scope in the `skills` CLI writes to the current directory's `skills/`
tree. Inside the Flywheel repo that path is the authored product source, so the
repo-local project target validates the local source and exits without running
`skills add` back into the same tree. Local-source targets fail instead of
falling back to the published package when this checkout does not expose
`skills/*/SKILL.md`.

`make install/codex` now refreshes the local Flywheel plugin install shape,
turns on the experimental Codex hooks feature, and merges the Flywheel Bash
guardrail into `~/.codex/hooks.json`.

From another checkout or worktree:

Claude Code:

```bash
make install/claude/force-source
```

Codex:

```bash
make install/codex/force-link
```

For a project-scoped Claude install from this checkout:

```bash
make install/claude/refresh/project
```

To remove Flywheel from both hosts and retest a clean local install:

```bash
make uninstall/all
```

That cleanup now removes host-specific plugin installs plus Flywheel `npx skills`
global installs, including stale global skill directories whose lock entries are
missing. From this repo root it treats project scope as source-tree metadata and
never deletes the authored `skills/` files.

### Validation

```bash
make verify
make doctor
make validate
node scripts/flywheel-doctor.js --host codex --codex-session-smoke
node scripts/flywheel-doctor.js --host claude --smoke
```

`make verify` is the full plugin verification pass for this repo: doctor smoke
checks plus eval-suite validation. In broad verification it validates repo
packaging for both hosts, requires live smoke for the hosts currently enabled
from this checkout, and skips the Claude live invocation when this repo is not
currently installed in Claude or Claude's API credentials are invalid. Use
`make install/claude` followed by `node scripts/flywheel-doctor.js --host claude --smoke`
when the installed Claude path itself must be proven.

For side-by-side local comparisons between Codex and Claude Code:

```bash
npm --prefix tools/evals install
npm --prefix tools/evals run doctor
npm --prefix tools/evals run compare -- --suite flywheel
```

Setup and troubleshooting notes:

- [compatibility.md](docs/setup/compatibility.md)
- [troubleshooting.md](docs/setup/troubleshooting.md)

### Repository layout

- `.agents/plugins/marketplace.json` - Codex marketplace manifest for this repo
- `.codex-plugin/plugin.json` - Codex plugin manifest used directly and by the repo marketplace
- `.claude-plugin/plugin.json` - Claude plugin manifest
- `.claude-plugin/marketplace.json` - Claude marketplace manifest for this repo
- `.flywheel/config.local.example.yaml` - local config template
- `hooks/` - shared hook policy script and Claude plugin hook pack
- `skills/` - shared Flywheel workflow skills
- `docs/setup/` - compatibility and troubleshooting notes
- `docs/solutions/` - searchable knowledge captured by `spin`
- `scripts/` - repo-local doctor, refresh, and eval helpers
- `tools/evals/` - isolated live-eval workspace
