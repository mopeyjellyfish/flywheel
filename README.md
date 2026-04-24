# Flywheel

A workflow skillset for turning repo work into a flywheel of recoverable energy.

## Install

Install Flywheel with the `skills` CLI:

```bash
npx skills add mopeyjellyfish/flywheel --global --skill '*' --agent claude-code --agent opencode --yes
```

Then go to a project where you want Flywheel to help and run setup:

Claude Code:

```text
/fw:setup
```

OpenCode:

```text
fw:setup
```

Setup reads that project, checks the tools and workflow surfaces it actually
uses, reports missing dependencies, and prepares Flywheel to guide the first
real task there.

After setup, start normal work with:

Claude Code:

```text
/fw
```

OpenCode:

```text
fw
```

## Philosophy

Each unit of development work should make the next one faster.

Traditional development leaks momentum. Ideas stay fuzzy for too long,
implementation starts before the path is clear, review happens after the risky
decisions are already made, and useful lessons disappear into chat history, PR
comments, or memory.

Flywheel keeps the loop compact:

- shape the change before coding
- work from a reviewed plan
- review the diff before commit
- finish the branch cleanly
- spin durable lessons back into the repo

In Flywheel, docs are stored energy. Plans, solutions, workflow rules, rollout
notes, and user corrections are not side artifacts. They are repo knowledge
that later work can recover instead of rediscovering.

That is the point of the product: finish the current task and make the next
one faster.

## Workflow

```text
shape -> work -> review -> optional spin -> commit -> repeat
```

`fw` routes a task into the earliest useful stage. Use a specific stage when
the next step is already clear.

| Command | Purpose |
| --- | --- |
| `fw` or `fw:start` | Route a repo task into the right stage. |
| `fw:shape` | Clarify an idea, compare options, write a plan, or deepen an existing plan. |
| `fw:work` | Implement the planned change against repo truth. |
| `fw:review` | Review the finished diff for bugs, regressions, missing tests, and readiness gaps. |
| `fw:spin` | Capture durable lessons in `docs/solutions/` when the work teaches something reusable. |
| `fw:commit` | Verify readiness, commit, push, and create or refresh the PR. |

Common starts:

- Vague idea or new feature: `fw`
- Known scoped change: `fw:shape`
- Bug with an unclear cause: `fw:debug`
- Architecture or pattern decision: `fw:architecture-strategy` or `fw:pattern-recognition`
- One bounded pass through the remaining stages: `fw:run`

Use the host prefix when required: `/fw:work` in Claude Code and `fw:work` in
OpenCode.

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
