# flywheel

## Philosophy

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

## What and how Flywheel works

Flywheel is a plugin for taking software work from vague idea to clean PR, then
capturing what was learned so the next task starts with better context.

It is built for fast, high-quality engineering on real repositories:

- shaping ideas and requirements
- writing durable implementation plans
- executing work against repo truth instead of guesswork
- proving bugs before fixing them
- reviewing code with structured risk finding
- shipping with testing, reusable evidence bundles, and operational validation
  notes
- handling browser-proof, observability, logging, and optimization work
- storing durable lessons in `docs/solutions/`

Flywheel works especially well for services, APIs, web apps, jobs, queues, and
distributed-system-adjacent codebases, but the core planning and execution flow
is general-purpose.

Flywheel covers the full development loop, plus the support work that usually
gets dropped between implementation and merge.

### Core workflow

- `$flywheel:ideate` surfaces strong next bets when the problem is not chosen yet.
- `$flywheel:brainstorm` turns a fuzzy request into a clear requirements direction.
- `$flywheel:plan` turns requirements or a feature description into a durable
  implementation plan.
- `$flywheel:work` executes the plan with repo-grounded validation and visible task
  progress.
- `$flywheel:review` finds bugs, regressions, missing tests, and merge risk.
- `$flywheel:rollout` plans staged release posture for runtime-risky changes.
- `$flywheel:ship` commits, pushes, creates or refreshes the PR, and adds operational
  validation notes.
- `$flywheel:spin` captures durable lessons in `docs/solutions/`.

### Support workflows

- `$flywheel:setup` proves repo and machine readiness before work starts.
- `$flywheel:debug` investigates bugs by proving the causal chain and getting to a
  red failing test or reproducer.
- `$flywheel:incident` starts from live runtime evidence and chooses mitigation,
  rollback, patch, or follow-up routing.
- `$flywheel:deepen` strengthens an existing plan before implementation starts.
- `$flywheel:document-review` reviews requirements docs, plans, ADRs, and other design
  artifacts before execution.
- `$flywheel:worktree` manages isolated checkouts for safer parallel work.
- `$flywheel:run` coordinates a bounded task end to end through the remaining stages.
- `$flywheel:optimize` runs measurement-first optimization loops.
- `$flywheel:browser-test` proves browser-visible behavior with fresh evidence.
- proof-producing stages can leave a shared evidence bundle under
  `.context/flywheel/evidence/` so shipping can reuse clean or redacted proof
  instead of depending on chat memory.
- `$flywheel:polish` tightens browser-visible behavior in a live test-and-adjust loop.
- `$flywheel:observability` designs or audits logs, metrics, traces, blast radius, and
  post-deploy validation.
- `$flywheel:logging` designs or audits structured logging and wide-event shape.
- `$flywheel:verify` checks completion claims against fresh
  evidence.
- `$flywheel:commit` drafts conventional commits and asks before using
  breaking-change markers.

## Install and setup

### Install Flywheel

For most users, install the shared Flywheel skills with `npx skills`:

```bash
npx skills add https://github.com/mopeyjellyfish/flywheel.git --skill '*' -a claude-code -a codex -g -y
```

That installs Flywheel into both hosts from the same repo with one command.

#### Claude Code

```bash
claude plugin marketplace add https://github.com/mopeyjellyfish/flywheel.git --scope user
claude plugin install flywheel@flywheel --scope user
```

Then run `/reload-plugins` in Claude Code or start a fresh Claude session.

#### Codex

```bash
codex marketplace add https://github.com/mopeyjellyfish/flywheel.git
```

Then start a fresh Codex session.

### Start using Flywheel

After installation, run `flywheel:setup` in the repository you want to work in
when you need Flywheel to bootstrap the local environment. Then route work
through `flywheel:start` or go straight to a stage such as
`flywheel:brainstorm`, `flywheel:plan`, or `flywheel:review`.

If you are using the repo-local plugin installs from the Development section
below, the native command surface is `$flywheel:<stage>` in Codex and
`/flywheel:<stage>` in Claude Code.

`setup` is the repo-local bootstrap pass. It determines:

- what this repo actually requires
- which commands, CLIs, and surfaces are missing or misconfigured
- which setup steps are required now vs optional later
- which host-security posture makes sense here, including trusted MCP use and
  whether sandboxing or a devcontainer should be preferred
- whether Flywheel should bootstrap local config such as
  `.flywheel/config.local.yaml`

It is also the recovery path during upgrades: when `$flywheel:review`,
`$flywheel:browser-test`, `$flywheel:optimize`, `$flywheel:ship`, or another later
stage finds a missing requirement, use `setup` again with the closest focus
instead of trying to patch the environment ad hoc inside that later stage.

### What you need

Required:

- [Codex CLI](https://developers.openai.com/codex/cli) or
  [Claude Code](https://code.claude.com/docs/en/quickstart)
- a Git repository to work in

Optional, depending on the workflow you want:

- `gh` for PR-aware review and shipping
- `playwright-cli` for browser proof and browser-visible acceptance testing
- Datadog or OTel/LGTM access for runtime optimization and observability work
- repo toolchains such as Node, Python, Go, Ruby, Java, Rust, or Zig as needed
  by the repository itself; `$flywheel:setup` inspects repo truth and only asks for
  what this repo actually uses
- Claude Code if you want the Claude-installed plugin flow or local Claude eval
  runs

If you want durable local preferences after running `$flywheel:setup`, copy:

```text
.flywheel/config.local.example.yaml -> .flywheel/config.local.yaml
```

Use that local config for browser defaults, optimization preferences, shipping
preferences, and workflow defaults. It is also the right place for repo-local
strictness such as requiring a reproducer before bug fixes, requiring review
before shipping, or requiring explicit operational validation for runtime
changes.

### Workflow-specific setup surfaces

You do not need every optional tool on day one. Set up only what the current
job needs.

| Surface | Needed for | Typical requirement |
| --- | --- | --- |
| Review / ship | PR-aware review, PR creation, PR refresh | `gh` auth |
| Browser proof | Browser-visible changes | `playwright-cli` |
| Optimize / observability | Runtime-facing optimization or supportability work | Datadog or OTel/LGTM access |
| Evals | Local side-by-side CLI testing | `tools/evals/` install + Codex / Claude CLIs |
| Worktrees | Isolated implementation or review branches | `git worktree` support |
| Security posture | Sensitive repos, trusted integrations, isolated execution | sandbox/devcontainer readiness + trusted MCP inventory |

## Workflow at a glance

```text
Setup? -> Ideate? -> Brainstorm -> Plan -> Work -> Review -> Rollout? -> Ship -> Spin
                     \-> Document Review --/

Side paths used when needed:
- Incident
- Debug
- Worktree
- Browser Test / Polish
- Observability / Logging
- Optimize
- Verify
```

The loop is intentionally short:

1. **Decide what to build**: `$flywheel:ideate` or `$flywheel:brainstorm`
2. **Decide how to build it**: `$flywheel:plan`
3. **Build and validate it**: `$flywheel:work`
4. **Find risk before merge**: `$flywheel:review`
5. **Plan the release when blast radius matters**: `$flywheel:rollout`
6. **Publish it cleanly**: `$flywheel:ship`
7. **Store the useful lesson**: `$flywheel:spin`

Use the support skills only when the work actually needs them.

## Common paths

### Idea to PR

1. `$flywheel:brainstorm`
2. `$flywheel:plan`
3. `$flywheel:work`
4. `$flywheel:review`
5. `$flywheel:ship`
6. optional `$flywheel:spin`

### Backlog shaping to implementation

1. `$flywheel:ideate`
2. `$flywheel:brainstorm`
3. `$flywheel:plan`
4. `$flywheel:work`

### Bug to proven fix

1. `$flywheel:debug`
2. `$flywheel:plan` if the fix reveals a design problem
3. `$flywheel:work`
4. `$flywheel:review`
5. `$flywheel:ship`

### Incident to safe follow-up

1. `$flywheel:incident`
2. `$flywheel:debug`, `$flywheel:rollout`, or `$flywheel:plan` depending on the decision
3. `$flywheel:work` if code changes are needed
4. `$flywheel:review`
5. `$flywheel:ship`

### Changed code to safer merge

1. `$flywheel:review`
2. `$flywheel:browser-test` or `$flywheel:verify` when relevant
3. `$flywheel:ship`

### Runtime-risky change to safer release

1. `$flywheel:review`
2. `$flywheel:rollout`
3. `$flywheel:ship`

### Performance or cost problem to measured improvement

1. `$flywheel:setup optimize` if telemetry access is unclear
2. `$flywheel:optimize`
3. `$flywheel:review`
4. `$flywheel:ship`

## What is covered

Flywheel is not just "plan and code." It covers the surrounding engineering
work that makes changes safer and easier to support.

| Area | Covered by Flywheel |
| --- | --- |
| Problem shaping | idea refinement, requirements, scope boundaries, alternatives, YAGNI checks |
| Technical planning | file-level plans, implementation units, test posture, verification, runtime tradeoffs |
| Execution | repo-grounded commands, task tracking, TDD-friendly execution, worktree-safe paths |
| Bug fixing | reproduction, causal chain, red failing test or reproducer before fix |
| Incident handling | runtime-evidence intake, blast-radius framing, mitigation vs rollback vs patch routing |
| Code review | structured review, reviewer personas, confidence gating, autofix/report/headless modes |
| Release discipline | conventional commits, branch safety, rollout planning for risky changes, PR creation, PR refresh, evidence bundles, operational validation notes |
| Browser-visible work | browser proof, smoke checks, changed-path acceptance checks, interactive polish loops |
| Observability | logs, traces, metrics, validation plans, blast radius, readiness framing |
| Logging | structured events, correlation fields, logger-shape audits, wide-event design |
| Optimization | latency, throughput, query cost, build performance, resource usage, measurement contracts |
| Setup and security | repo-grounded toolchain discovery, trusted MCP posture, sandbox or devcontainer readiness, safe local defaults |
| Knowledge capture | searchable `docs/solutions/` entries for solved problems and durable practices |

## Command guide

### Routing and planning

- `$flywheel:ideate` — generate and rank strong next bets
- `$flywheel:brainstorm` — refine a request into requirements
- `$flywheel:plan` — write the implementation plan
- `$flywheel:deepen` — strengthen an existing plan
- `$flywheel:document-review` — review requirements, plans, specs, or ADRs
- `$flywheel:run` — coordinate one bounded task through the remaining stages

### Build and debug

- `$flywheel:work` — execute the plan and validate the result
- `$flywheel:debug` — prove the bug before fixing it
- `$flywheel:worktree` — create or clean isolated worktrees

### Review, release, and proof

- `$flywheel:review` — review code changes before merge
- `$flywheel:ship` — commit, push, create or refresh the PR
- `$flywheel:verify` — verify that "done" is actually true
- `$flywheel:commit` — draft or validate commit messages

### Runtime, browser, and performance support

- `$flywheel:browser-test` — prove browser-visible behavior
- `$flywheel:polish` — tighten browser-visible behavior through interactive loops
- `$flywheel:observability` — shape operational signals and validation
- `$flywheel:logging` — shape structured logs and event models
- `$flywheel:optimize` — improve a measured metric with guardrails

### Knowledge capture

- `$flywheel:spin` — store the lesson so later work can reuse it

## Knowledge store

In any repository that uses Flywheel, `docs/solutions/` is the place for solved
problems and durable guidance. These entries are written by `$flywheel:spin` and
meant to be reused by future ideation, brainstorming, planning, work, review,
and debugging sessions.

Each solution doc uses YAML frontmatter so agents can search cheaply before
opening the full file. Common retrieval fields include:

- `doc_status`
- `title`
- `module`
- `files_touched`
- `problem_type`
- `component`
- `tags`
- `severity`
- `supersedes`
- `superseded_by`

Prefer docs with `doc_status: active`. If a strong hit has `superseded_by`,
follow that path first and treat the older doc as historical context.

## Development

Everything below is for working on Flywheel itself rather than using Flywheel
inside another repository.

Flywheel is authored once under `skills/`. The host-specific packaging for that
shared skill tree lives under `.codex-plugin/` and `.claude-plugin/`.

### Local development

#### From your local checkout

Claude Code

```bash
make claude-dev
```

Then run `/reload-plugins` in Claude Code or start a fresh Claude session.

Codex

```bash
make dev
```

Then start a fresh Codex session.

#### From another local checkout or worktree

Claude Code

```bash
make claude-dev-force-source
```

Use `make claude-refresh-project` when you want a project-scoped install from
that checkout.

Codex

```bash
make dev-force-link
```

#### Individual commands

Use the narrower targets when you only need one part of the loop:

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

Flywheel includes a repo-local harness for repeatable skill evaluation.

Quick checks:

```bash
node scripts/flywheel-doctor.js
node scripts/flywheel-eval.js doctor
node scripts/flywheel-eval.js list
node scripts/flywheel-eval.js validate
node scripts/flywheel-eval.js prepare flywheel
node scripts/flywheel-eval.js prepare fw-review
node scripts/flywheel-eval.js prepare fw-spin
```

For local live comparisons between Codex and Claude Code, use the isolated
workspace in `tools/evals/`:

```bash
npm --prefix tools/evals install
npm --prefix tools/evals run doctor
npm --prefix tools/evals run compare -- --suite flywheel
npm --prefix tools/evals run compare -- --suite fw-review
```

This is optional. You do not need the eval harness to use Flywheel as a plugin.

The `fw-*` names in eval commands are suite IDs only. They are harness labels,
not runtime skill invocations. Use `$flywheel:<stage>` in Codex and
`/flywheel:<stage>` in Claude Code.

The Claude subject runner in `tools/evals/` still uses repo-root `--plugin-dir`
for direct local comparisons. Installed-plugin validation lives in
`node scripts/flywheel-doctor.js` and the local refresh helpers.

To verify the installed Claude plugin surface from this repo, prefer:

```bash
node scripts/flywheel-doctor.js --host claude --smoke
```

That path validates the manifest, install state, callable `/flywheel:start`
behavior, and the registered `flywheel:*` command list.

Setup, compatibility, and troubleshooting notes for working on Flywheel itself:

- [docs/setup/compatibility.md](docs/setup/compatibility.md)
- [docs/setup/troubleshooting.md](docs/setup/troubleshooting.md)

### Repository layout

- `.agents/plugins/marketplace.json` — Codex marketplace manifest for this repo
- `.codex-plugin/plugin.json` — Codex plugin manifest
- `.claude-plugin/plugin.json` — Claude plugin manifest
- `.claude-plugin/marketplace.json` — Claude marketplace manifest for this repo
- `.flywheel/config.local.example.yaml` — local config template
- `docs/setup/` — compatibility and troubleshooting notes for Flywheel itself
- `plugins/flywheel/` — Codex marketplace plugin wrapper that points at the shared skill tree
- `skills/start/` — umbrella routing skill
- `skills/<stage>/` — command-backed Flywheel workflow skills
- `skills/document-review/` — design-artifact review before execution
- `skills/observability/` — signal design, blast radius, and rollout validation
- `skills/logging/` — structured logging and event-shape guidance
- `skills/verify/` — fresh-proof completion checks
- `docs/solutions/` — searchable knowledge store captured by `$flywheel:spin`
- `Makefile` — local development targets such as `make dev` and targeted refresh / doctor helpers
- `scripts/codex-refresh-local.sh` — dev-only local Codex plugin refresh helper
- `scripts/claude-refresh-local.sh` — dev-only Claude marketplace/install refresh helper
- `scripts/flywheel-doctor.js` — repo-local health and recovery wrapper
- `scripts/flywheel-eval.js` — repo-local eval helper
- `tools/evals/` — isolated live-eval workspace
