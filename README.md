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

### Global install for Codex, Claude Code, and OpenCode

```bash
npx skills add mopeyjellyfish/flywheel --global --skill '*' --agent codex --agent claude-code --agent opencode --yes
```

This installs Flywheel outside the current project by default and limits the
install to those three agent targets.

Then in your tool of choice:

```text
flywheel:setup
```

Use the host's native syntax:

- Codex: `$flywheel:<stage>`
- Claude Code: `/flywheel:<stage>`

Flywheel's interaction contract is shared across hosts: use the host's
structured choice UI instead of asking for raw `1/2/3` replies. Claude Code
uses `AskUserQuestion`, Codex uses `request_user_input` when the active runtime
exposes it, and OpenCode uses `question`. Risky-edge hook guardrails are
bundled with the Claude plugin install. Codex uses an optional global
`~/.codex/hooks.json` guardrail because current Codex hooks are repo-local or
user-global rather than plugin-bundled.

### Getting started

Run `$flywheel:setup` in any project after installing. It inspects the repo,
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
  ^
  ideate / brainstorm / plan / deepen
```

| Command | Purpose |
| --- | --- |
| `$flywheel:start` | Route a repo task into the right stage when you do not want to pick one yourself. |
| `$flywheel:ideate` | Surface and rank the strongest next bets when the work is not chosen yet. |
| `$flywheel:brainstorm` | Clarify one direction through user questions, tradeoffs, and requirement shaping. |
| `$flywheel:plan` | Turn a chosen direction into an implementation plan. |
| `$flywheel:deepen` | Strengthen a reviewed plan before execution starts. |
| `$flywheel:work` | Execute the plan against repo truth and pull in helper stages when the task needs them. |
| `$flywheel:review` | Review the finished diff with reviewer personas selected from the change. |
| `$flywheel:commit` | Commit, push, and create or refresh the PR with the right context. |
| `$flywheel:spin` | Capture durable lessons in `docs/solutions/` so later work starts faster. |

`shape` is the interactive front half of the loop. `ideate` helps choose among
multiple bets. `brainstorm` sharpens one direction with the user. `plan`
writes the implementation path. Before `work` starts, Flywheel runs
`document-review` on the plan and lets the user choose whether to `deepen` the
plan or start execution.

`work` is the execution stage. It can pull in `docs`, `debug`, `browser-test`,
`verify`, `rollout`, `observability`, `logging`, `optimize`, or `worktree`
when the task actually needs them.

`review` is the default gate after work. `commit` finishes the branch cleanly.
`spin` is how Flywheel stores the lesson so the next task starts with more repo
knowledge than the last one.

Common starts:

- new feature or vague idea: `$flywheel:start`, `$flywheel:ideate`, or `$flywheel:brainstorm`
- known scoped change: `$flywheel:plan`
- bug with an unclear cause: `$flywheel:debug`
- one bounded pass through the remaining stages: `$flywheel:run`

---

## Development

Everything below is for working on Flywheel itself.

### Local development

From this checkout:

Claude Code:

```bash
make claude-dev
```

Codex:

```bash
make dev
```

Restart the host session after either command finishes.

`make dev` now refreshes the local Flywheel plugin install shape, turns on the
experimental Codex hooks feature, and merges the Flywheel Bash guardrail into
`~/.codex/hooks.json`.

From another checkout or worktree:

Claude Code:

```bash
make claude-dev-force-source
```

Codex:

```bash
make dev-force-link
```

For a project-scoped Claude install from this checkout:

```bash
make claude-refresh-project
```

### Validation

```bash
make doctor
make validate
node scripts/flywheel-doctor.js --host codex --codex-session-smoke
node scripts/flywheel-doctor.js --host claude --smoke
```

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
- `.codex-plugin/plugin.json` - Codex plugin manifest
- `.claude-plugin/plugin.json` - Claude plugin manifest
- `.claude-plugin/marketplace.json` - Claude marketplace manifest for this repo
- `.flywheel/config.local.example.yaml` - local config template
- `hooks/` - shared hook policy script and Claude plugin hook pack
- `plugins/flywheel/` - Codex marketplace plugin wrapper
- `skills/` - shared Flywheel workflow skills
- `docs/setup/` - compatibility and troubleshooting notes
- `docs/solutions/` - searchable knowledge captured by `spin`
- `scripts/` - repo-local doctor, refresh, and eval helpers
- `tools/evals/` - isolated live-eval workspace
