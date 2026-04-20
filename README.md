# flywheel

Flywheel is a development workflow for Codex and Claude Code. It helps you
shape the work, build it, review it, ship it, and keep the useful lesson for
later.

## Install

```bash
npx skills add mopeyjellyfish/flywheel --all -y
```

Then in your tool of choice:

```text
flywheel:setup
```

Use the host's native syntax:

- Codex: `$flywheel:<stage>`
- Claude Code: `/flywheel:<stage>`

## Start here

Run `setup` first when you want Flywheel to inspect the repo, discover missing
tools, or bootstrap local workflow defaults. After that, use `start` to route
the task, or call a stage directly.

## What Flywheel does

Flywheel is built for real repository work:

- turn vague requests into clear requirements
- write durable implementation plans
- execute against repo truth instead of guesswork
- debug from a reproducer instead of a hunch
- review changes before merge
- handle browser proof, observability, logging, and optimization work
- capture reusable guidance in `docs/solutions/`

It works especially well for services, APIs, web apps, jobs, queues, and other
runtime-facing codebases, but the core loop is general-purpose.

### Philosophy

Development should work like a flywheel. We spin the flywheel to preserve
momentum and maintain that momentum over time. The more we spin the wheel, the
faster it turns, the more energy it stores, and the more energy we can recover
later.

In Flywheel, the docs are that stored energy. Each time we spin the flywheel,
we add to the docs so the next task starts with more context, more reusable
structure, and less rediscovery.

Flywheel is a development plugin for Codex and Claude Code focused on building
and preserving that momentum across the development loop.

Each cycle spins the flywheel: brainstorms sharpen plans, plans inform future
plans, reviews catch more issues, and patterns get documented.


## Core workflow

Main stages:

- `brainstorm` to shape the request
- `plan` to decide how to build it
- `work` to implement it
- `review` to find risk before merge
- `ship` to commit, push, and prepare the PR
- `spin` to capture the lesson

Support stages:

- `ideate`
- `deepen`
- `debug`
- `incident`
- `rollout`
- `verify`
- `browser-test`
- `polish`
- `observability`
- `logging`
- `optimize`
- `worktree`
- `commit`
- `run`
- `document-review`

## Common paths

### Idea to PR

1. `brainstorm`
2. `plan`
3. `work`
4. `review`
5. `ship`

### Bug to proven fix

1. `debug`
2. `work`
3. `review`
4. `ship`

### Runtime-risky change

1. `review`
2. `rollout`
3. `ship`

### Browser-visible change

1. `work`
2. `browser-test`
3. `review`
4. `ship`

### Performance or cost problem

1. `setup optimize` if telemetry access is unclear
2. `optimize`
3. `review`
4. `ship`

## What Flywheel expects

Required:

- [Codex CLI](https://developers.openai.com/codex/cli) or
  [Claude Code](https://code.claude.com/docs/en/quickstart)
- a Git repository

Useful extras:

- `gh` for PR-aware review and shipping
- `playwright-cli` for browser proof
- Datadog or OTel/LGTM access for runtime-facing observability and optimization
- the repo's own language and build toolchain

If you want repo-local defaults for browser proof, shipping, optimization, or
stricter workflow gates, copy:

```text
.flywheel/config.local.example.yaml -> .flywheel/config.local.yaml
```

## Command guide

### Shape the work

- `ideate` - generate options and rank next bets
- `brainstorm` - turn a request into requirements
- `plan` - write the implementation plan
- `deepen` - strengthen an existing plan
- `document-review` - review requirements, plans, specs, or ADRs
- `run` - coordinate one bounded task through the remaining stages

### Build and debug

- `work` - execute the plan and validate the result
- `debug` - prove the bug before fixing it
- `worktree` - create or manage isolated worktrees

### Review and ship

- `review` - review code changes before merge
- `verify` - check that "done" is actually true
- `ship` - commit, push, and create or refresh the PR
- `commit` - draft or validate a commit message

### Runtime and browser work

- `browser-test` - prove browser-visible behavior
- `polish` - tighten browser-visible behavior in a live loop
- `observability` - shape runtime signals and validation
- `logging` - shape structured logs and event models
- `optimize` - improve a measured metric
- `rollout` - plan release posture for risky changes
- `incident` - work from live runtime evidence

### Capture the lesson

- `spin` - store the useful lesson for later work

## Store of momentum

When the active repository has `docs/solutions/`, Flywheel treats it as the
local store of momentum for solved problems and durable practices. `spin` writes
new entries there, and later stages can reuse them.

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

### Individual commands

```bash
make codex-refresh-local
make codex-refresh-local-force-link
make claude-refresh-local
make claude-refresh-local-force-source
make claude-refresh-project
make doctor
make validate
```

### Eval harness

Quick checks:

```bash
node scripts/flywheel-doctor.js
node scripts/flywheel-eval.js doctor
node scripts/flywheel-eval.js list
node scripts/flywheel-eval.js validate
```

For side-by-side local comparisons between Codex and Claude Code:

```bash
npm --prefix tools/evals install
npm --prefix tools/evals run doctor
npm --prefix tools/evals run compare -- --suite flywheel
```

Installed Claude plugin smoke check:

```bash
node scripts/flywheel-doctor.js --host claude --smoke
```

Setup and troubleshooting notes:

- [compatibility.md](/Users/david/code/personal/flywheel/docs/setup/compatibility.md)
- [troubleshooting.md](/Users/david/code/personal/flywheel/docs/setup/troubleshooting.md)

### Repository layout

- `.agents/plugins/marketplace.json` - Codex marketplace manifest for this repo
- `.codex-plugin/plugin.json` - Codex plugin manifest
- `.claude-plugin/plugin.json` - Claude plugin manifest
- `.claude-plugin/marketplace.json` - Claude marketplace manifest for this repo
- `.flywheel/config.local.example.yaml` - local config template
- `plugins/flywheel/` - Codex marketplace plugin wrapper
- `skills/` - shared Flywheel workflow skills
- `docs/setup/` - Flywheel compatibility and troubleshooting notes
- `docs/solutions/` - searchable knowledge captured by `spin`
- `scripts/` - repo-local doctor, refresh, and eval helpers
- `tools/evals/` - isolated live-eval workspace
