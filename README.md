# flywheel

## Philosophy

Development should work like a flywheel. We spin the flywheel to preserve
momentum and maintain that momentum over time. The more we spin the wheel, the
faster it turns, the more energy it stores, and the more energy we can recover
later.

In Flywheel, the docs are that stored energy. Each time we spin the flywheel,
we add to the docs so the next task starts with more context, more reusable
structure, and less rediscovery.

Flywheel is a Codex development plugin focused on building and preserving that
momentum across the development loop.

Each cycle spins the flywheel: brainstorms sharpen plans, plans inform future
plans, reviews catch more issues, and patterns get documented.

## What and how Flywheel works

Flywheel is a Codex plugin for taking software work from vague idea to clean
PR, then capturing what was learned so the next task starts with better context.

It is built for fast, high-quality engineering on real repositories:

- shaping ideas and requirements
- writing durable implementation plans
- executing work against repo truth instead of guesswork
- proving bugs before fixing them
- reviewing code with structured risk finding
- shipping with testing and operational validation notes
- handling browser-proof, observability, logging, and optimization work
- storing durable lessons in `docs/solutions/`

Flywheel works especially well for services, APIs, web apps, jobs, queues, and
distributed-system-adjacent codebases, but the core planning and execution flow
is general-purpose.

Flywheel covers the full development loop, plus the support work that usually
gets dropped between implementation and merge.

### Core workflow

- `/fw:ideate` surfaces strong next bets when the problem is not chosen yet.
- `/fw:brainstorm` turns a fuzzy request into a clear requirements direction.
- `/fw:plan` turns requirements or a feature description into a durable
  implementation plan.
- `/fw:work` executes the plan with repo-grounded validation and visible task
  progress.
- `/fw:review` finds bugs, regressions, missing tests, and merge risk.
- `/fw:ship` commits, pushes, creates or refreshes the PR, and adds operational
  validation notes.
- `/fw:spin` captures durable lessons in `docs/solutions/`.

### Support workflows

- `/fw:setup` proves repo and machine readiness before work starts.
- `/fw:debug` investigates bugs by proving the causal chain and getting to a
  red failing test or reproducer.
- `/fw:deepen-plan` strengthens an existing plan before implementation starts.
- `/document-review` reviews requirements docs, plans, ADRs, and other design
  artifacts before execution.
- `/fw:worktree` manages isolated checkouts for safer parallel work.
- `/fw:run` coordinates a bounded task end to end through the remaining stages.
- `/fw:optimize` runs measurement-first optimization loops.
- `/fw-browser-test` proves browser-visible behavior with fresh evidence.
- `/fw-polish` tightens browser-visible behavior in a live test-and-adjust loop.
- `/observability` designs or audits logs, metrics, traces, blast radius, and
  post-deploy validation.
- `/logging` designs or audits structured logging and wide-event shape.
- `/verification-before-completion` checks completion claims against fresh
  evidence.
- `/conventional-commit` drafts conventional commits and asks before using
  breaking-change markers.

## Install and setup

### Quick start

Use Flywheel as a two-step setup flow:

1. **Install the plugin**
2. **Run `/fw:setup` inside the repository you want to work on**

That keeps installation separate from repo bootstrap. Flywheel itself gets
installed once, then `/fw:setup` discovers what this specific repo actually
needs.

If a later Flywheel update adds a required surface that is missing when a stage
tries to use it, route back to `/fw:setup` with the relevant focus instead of
trying to patch the environment ad hoc inside that later stage.

### Install the plugin

Install Flywheel through your normal Codex plugin flow using this repository as
the plugin source. The installable manifest is:

```text
.codex-plugin/plugin.json
```

Flywheel is packaged as a Codex plugin, while the actual workflows live under
`skills/`.

### Run `/fw:setup`

Once the plugin is installed, open the target repository and run:

```text
/fw:setup
```

`/fw:setup` is the repo-local bootstrap pass. It determines:

- what this repo actually requires
- which commands, CLIs, and surfaces are missing or misconfigured
- which setup steps are required now vs optional later
- which host-security posture makes sense here, including trusted MCP use and
  whether sandboxing or a devcontainer should be preferred
- whether Flywheel should bootstrap local config such as
  `.flywheel/config.local.yaml`

It is also the recovery path during upgrades: when `/fw:review`,
`/fw-browser-test`, `/fw:optimize`, `/fw:ship`, or another later stage finds a
missing requirement, use `/fw:setup` again with the closest focus rather than
teaching each stage to do its own environment repair.

### What you need

Required:

- [Codex CLI](https://developers.openai.com/codex/cli) or another Codex surface
  that supports plugins and skills
- a Git repository to work in

Optional, depending on the workflow you want:

- `gh` for PR-aware review and shipping
- `playwright-cli` for browser proof and browser-visible acceptance testing
- Datadog or OTel/LGTM access for runtime optimization and observability work
- repo toolchains such as Node, Python, Go, Ruby, Java, Rust, or Zig as needed
  by the repository itself; `/fw:setup` inspects repo truth and only asks for
  what this repo actually uses
- [Claude Code](https://code.claude.com/docs/en/quickstart) if you want to run
  Flywheel's local eval harness against both Codex and Claude Code

If you want durable local preferences after running `/fw:setup`, copy:

```text
.flywheel/config.local.example.yaml -> .flywheel/config.local.yaml
```

Use that local config for browser defaults, optimization preferences, shipping
preferences, and workflow defaults.

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
Setup? -> Ideate? -> Brainstorm -> Plan -> Work -> Review -> Ship -> Spin
                     \-> Document Review --/

Side paths used when needed:
- Debug
- Worktree
- Browser Test / Polish
- Observability / Logging
- Optimize
- Verification Before Completion
```

The loop is intentionally short:

1. **Decide what to build**: `/fw:ideate` or `/fw:brainstorm`
2. **Decide how to build it**: `/fw:plan`
3. **Build and validate it**: `/fw:work`
4. **Find risk before merge**: `/fw:review`
5. **Publish it cleanly**: `/fw:ship`
6. **Store the useful lesson**: `/fw:spin`

Use the support skills only when the work actually needs them.

## Common paths

### Idea to PR

1. `/fw:brainstorm`
2. `/fw:plan`
3. `/fw:work`
4. `/fw:review`
5. `/fw:ship`
6. optional `/fw:spin`

### Backlog shaping to implementation

1. `/fw:ideate`
2. `/fw:brainstorm`
3. `/fw:plan`
4. `/fw:work`

### Bug to proven fix

1. `/fw:debug`
2. `/fw:plan` if the fix reveals a design problem
3. `/fw:work`
4. `/fw:review`
5. `/fw:ship`

### Changed code to safer merge

1. `/fw:review`
2. `/fw-browser-test` or `/verification-before-completion` when relevant
3. `/fw:ship`

### Performance or cost problem to measured improvement

1. `/fw:setup optimize` if telemetry access is unclear
2. `/fw:optimize`
3. `/fw:review`
4. `/fw:ship`

## What is covered

Flywheel is not just "plan and code." It covers the surrounding engineering
work that makes changes safer and easier to support.

| Area | Covered by Flywheel |
| --- | --- |
| Problem shaping | idea refinement, requirements, scope boundaries, alternatives, YAGNI checks |
| Technical planning | file-level plans, implementation units, test posture, verification, runtime tradeoffs |
| Execution | repo-grounded commands, task tracking, TDD-friendly execution, worktree-safe paths |
| Bug fixing | reproduction, causal chain, red failing test or reproducer before fix |
| Code review | structured review, reviewer personas, confidence gating, autofix/report/headless modes |
| Release discipline | conventional commits, branch safety, PR creation, PR refresh, operational validation notes |
| Browser-visible work | browser proof, smoke checks, changed-path acceptance checks, interactive polish loops |
| Observability | logs, traces, metrics, validation plans, blast radius, readiness framing |
| Logging | structured events, correlation fields, logger-shape audits, wide-event design |
| Optimization | latency, throughput, query cost, build performance, resource usage, measurement contracts |
| Setup and security | repo-grounded toolchain discovery, trusted MCP posture, sandbox or devcontainer readiness, safe local defaults |
| Knowledge capture | searchable `docs/solutions/` entries for solved problems and durable practices |

## Command guide

### Routing and planning

- `/fw:ideate` — generate and rank strong next bets
- `/fw:brainstorm` — refine a request into requirements
- `/fw:plan` — write the implementation plan
- `/fw:deepen-plan` — strengthen an existing plan
- `/document-review` — review requirements, plans, specs, or ADRs
- `/fw:run` — coordinate one bounded task through the remaining stages

### Build and debug

- `/fw:work` — execute the plan and validate the result
- `/fw:debug` — prove the bug before fixing it
- `/fw:worktree` — create or clean isolated worktrees

### Review, release, and proof

- `/fw:review` — review code changes before merge
- `/fw:ship` — commit, push, create or refresh the PR
- `/verification-before-completion` — verify that "done" is actually true
- `/conventional-commit` — draft or validate commit messages

### Runtime, browser, and performance support

- `/fw-browser-test` — prove browser-visible behavior
- `/fw-polish` — tighten browser-visible behavior through interactive loops
- `/observability` — shape operational signals and validation
- `/logging` — shape structured logs and event models
- `/fw:optimize` — improve a measured metric with guardrails

### Knowledge capture

- `/fw:spin` — store the lesson so later work can reuse it

## Knowledge store

Flywheel stores solved problems and durable guidance in `docs/solutions/`.
These entries are written by `/fw:spin` and are meant to be reused by future
ideation, brainstorming, planning, work, review, and debugging sessions.

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

## Eval harness

Flywheel includes a repo-local harness for repeatable skill evaluation.

Quick checks:

```bash
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

## Repository layout

- `.codex-plugin/plugin.json` — plugin manifest
- `.flywheel/config.local.example.yaml` — local config template
- `skills/flywheel/` — umbrella routing skill
- `skills/fw-*/` — command-backed Flywheel workflow skills
- `skills/document-review/` — design-artifact review before execution
- `skills/observability/` — signal design, blast radius, and rollout validation
- `skills/logging/` — structured logging and event-shape guidance
- `skills/verification-before-completion/` — fresh-proof completion checks
- `docs/solutions/` — searchable knowledge store captured by `/fw:spin`
- `scripts/flywheel-eval.js` — repo-local eval helper
- `tools/evals/` — isolated live-eval workspace
