---
name: setup
description: "Diagnose and bootstrap the repo-local development environment for Flywheel work. Use when onboarding a repo, checking whether the machine can execute the project workflow, reconciling setup after a Flywheel update, validating host security posture, or proving which tools and commands are actually available before planning, work, review, or commit."
metadata:
  argument-hint: "[blank to inspect current repo, or pass a focus such as project, security, worktrees, review, commit, doctor, or evals]"
---

# Setup And Bootstrap

`$flywheel:setup` is the environment and workflow bootstrap pass for Flywheel.

After Flywheel is installed, this should usually be the first command run in a
new repository.

It is also Flywheel's update and recovery path: if a later stage discovers a
missing CLI, service, local config, or proof surface, route back here with the
relevant focus instead of improvising setup inside that other stage.

Use it to answer:

1. What does this repo actually require to work on it?
2. Which commands, CLIs, and local surfaces are missing or misconfigured?
3. What is the smallest safe bootstrap that gets the user moving?
4. Should Flywheel bootstrap durable local config such as
   `.flywheel/config.local.yaml` for this repo?
5. If a later Flywheel stage is blocked after an update, what setup step should
   restore the missing surface cleanly?

This skill is repo-grounded. It should not guess a toolchain from memory when
the repository, its instructions, or its scripts can prove the answer.

When the repo has observability or optimization surfaces, setup should also
clarify which measurement backends and environments, if any, are available to
future Flywheel runs.

Setup should also clarify the host security posture Flywheel should assume:

- whether the repo is sensitive enough to prefer sandboxing or a devcontainer
- whether only trusted MCP servers should be used
- whether later stages should stay in a permissioned posture rather than
  encouraging broad autonomy

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Use the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When the workflow spans multiple material steps, use the host task-tracking
tool named in `../references/host-interaction-contract.md` to create and
maintain a short task list.

Ask one question at a time. When multiple setup postures are viable, present a
short predicted choice list with the recommended label first and rely on the
host's native freeform final path when it exists.

## Focus Hint

<setup_focus> #$ARGUMENTS </setup_focus>

Interpret a provided argument as optional emphasis:

- `project` or blank -> full repo setup pass
- `security` -> host security posture, trusted MCP inventory, and isolation readiness
- `worktrees` -> isolate branch and worktree readiness
- `browser` -> browser-proof and acceptance-test readiness
- `review` -> GitHub CLI, diff, and review-surface readiness
- `commit` -> commit, push, PR, and branch-safety readiness
- `doctor` -> repo-owned health checks, recovery wrappers, and Flywheel-local readiness
- `evals` -> local harness and comparison-tool readiness
- `optimize` -> telemetry access, measurement paths, and optimization readiness

## Reference Loading Map

Do not load support files until needed:

- Read `references/setup-ledger-template.md` only when the user wants a durable
  local setup note under `.context/flywheel/`.
- Read `references/config-template.yaml` only when the user wants Flywheel's
  structured local config bootstrapped under `.flywheel/`.

## Core Principles

1. **Repo truth over generic assumptions** - read the repo's instructions,
   manifests, scripts, and workflows before naming required tools.
2. **Differentiate required from optional** - do not block on tools the current
   workflow does not actually need.
3. **Prefer proof surfaces** - tests, lint, worktree commands, PR tooling, and
   eval scripts should come from files the repo already owns.
4. **Keep secrets local** - bootstrap local config and env handling without
   nudging users toward committing secrets.
5. **Prefer durable local config over repeated rediscovery** - when a browser,
   optimization, or workflow preference will matter again, record it in
   `.flywheel/config.local.yaml` rather than relying on chat memory.
6. **Present fixes in tiers** - fastest path first, then fuller setup if the
   user wants it.
7. **Setup recovery belongs here** - if another Flywheel stage discovers a
   missing requirement, send the user back to `$flywheel:setup <focus>` instead of
   teaching every downstream stage to bootstrap itself differently.
8. **Trust external surfaces deliberately** - only recommend trusted MCP
   servers, trusted telemetry paths, and explicit browser evidence capture.
   Do not normalize untrusted integrations.
9. **Prefer repo-native or pinned installs** - prefer the repo's own install
   path first; when that does not exist, prefer pinned versions or explicit
   user choice over floating global installs.

## Workflow

### Phase 1: Touch Grass

Build a setup ledger from the current repo:

- read repo-root `AGENTS.md` when present
- read `CLAUDE.md` only when present or still used as compatibility context
- inspect top-level manifests and automation files such as `package.json`,
  `go.mod`, `pyproject.toml`, `Cargo.toml`, `Gemfile`, `Makefile`, `justfile`,
  `docker-compose.yml`, `.github/workflows/*`, or repo-local scripts
- inspect `tools/evals/`, `scripts/`, and Flywheel support directories when
  they exist
- confirm whether the repo uses GitHub PR workflows, worktrees, env files,
  browser tests, local services, or build containers
- inspect `.mcp.json`, `.claude/settings.json`, `.claude/settings.local.json`,
  `.devcontainer/`, `devcontainer.json`, or similar local host-security config
  when present
- inspect whether `.flywheel/config.local.yaml` or
  `.flywheel/config.local.example.yaml` already exist
- inspect whether repo-owned doctor or recovery surfaces exist under `scripts/`,
  `tools/`, or nearby docs

From that pass, determine:

- core validation commands
- core developer CLIs
- optional but high-leverage CLIs
- local config or env files that must stay ignored
- whether browser-proof work is likely in this repo and whether the project
  already uses Playwright or other browser automation
- whether local workflow policy already exists for browser proof, reproducer
  requirements, review-before-commit, or runtime validation
- whether the repo already expects isolated worktrees
- whether the repo appears Datadog-first, OTel-native-first, or local-only for
  runtime telemetry
- whether the repo appears security-sensitive enough to prefer a sandbox,
  devcontainer, or stricter approval posture
- whether MCP servers are already configured and, if so, which ones appear
  trusted vs unclear

### Phase 2: Detect Required And Optional Surfaces

Classify setup needs into these buckets:

- **Required now** - missing blocks the requested work
- **Recommended** - not strictly required, but strongly improves flow
- **Optional** - useful later, not needed for today's job

Typical surfaces to check, but only when repo evidence supports them:

- `git`
- `gh`
- `jq`
- `node`, `npm`, `pnpm`, `yarn`, or `bun`
- `python`, `pip`, `uv`, or `poetry`
- `ruby`, `bundle`
- `go`
- `cargo`
- `java`, `javac`, `mvn`, `gradle`, or `./gradlew`
- `zig`
- `docker` / `docker compose`
- `make` or `just`
- `playwright-cli`, local `npx playwright-cli`, or repo-native Playwright test surfaces
- `psql`, `redis-cli`, or `kcat` only when repo evidence suggests those local
  debugging surfaces matter
- worktree support through `$flywheel:worktree`

Also check workflow-specific readiness:

- **planning/work** - tests, lint, typecheck, dev boot
- **browser** - acceptance-test proof via `playwright-cli`
- **review** - GitHub auth, clean diff scope, base-branch resolution surfaces
- **commit** - commit, push, PR, and branch safety
- **worktrees** - `.worktrees/` ignore coverage and env-file strategy
- **doctor / recovery** - repo-owned health checks, plugin or tool recovery
  wrappers, and troubleshooting docs when present
- **evals** - `tools/evals/` install and doctor commands when present
- **optimize** - measurement path readiness: Datadog MCP, OTel-native
  backends, local observability stack, or local-only
- **security** - host permission posture, sandbox or devcontainer readiness,
  trusted MCP inventory, and whether the repo should stay in a stricter mode

### Phase 3: Diagnose

Run the smallest factual checks that answer the setup question:

- `command -v` for required CLIs
- `--version` when the tool exists and version matters
- `gh auth status` only when GitHub workflows are relevant
- `git check-ignore .worktrees` when worktree-local isolation is expected
- repo-local setup commands only when they are safe and clearly read-oriented
- `command -v playwright-cli` or `npx --no-install playwright-cli --version`
  when browser proof or acceptance checks are likely to matter
- inspect existing host-security config files rather than inventing one from
  memory
- run repo-owned doctor or recovery wrappers when present and when they are
  read-oriented or clearly diagnostic
- when the repo looks security-sensitive, determine whether a sandbox,
  devcontainer, or stricter approval posture should be the default recommendation

Do not run installs speculatively.
Do not recommend bypass-style autonomy or untrusted MCP additions by default.

If observability surfaces are present, also determine which usable read surfaces
exist for future optimization work:

- Datadog MCP or another approved Datadog read path
- Grafana / Prometheus / Loki / Tempo / Pyroscope or equivalent OTel-native
  access
- local observability stack for relative improvement work
- local-only for now

Also determine browser-proof readiness when the repo has a web surface:

- whether `playwright-cli` is globally available
- whether local `npx playwright-cli` is available
- whether the repo already owns `@playwright/cli` or another browser-proof
  install path
- whether the repo already includes Playwright tests or config
- whether a likely dev-server command and target URL can be proven from repo
  truth

If browser-proof work is relevant and neither `playwright-cli` nor the local
`npx --no-install playwright-cli` path is available, say so plainly:

```text
Browser proof is currently blocked: `playwright-cli` was not found.
```

Treat that as a concrete setup gap, not a vague recommendation.

### Phase 4: Choose A Bootstrap Posture

When fixes are needed, present a short choice surface:

- **Minimum viable bootstrap** (recommended) - only unblock the immediate
  workflow
- **Workflow-ready bootstrap** - immediate workflow plus review, commit, and
  worktree readiness
- **Full local environment** - everything the repo appears to support,
  including eval and optional tooling
- Freeform path when the repo needs a different bootstrap posture

For each missing item, give:

- why the repo appears to need it
- whether it is required now or merely recommended
- the safest install or bootstrap command you can prove from repo or standard
  tooling

If the user wants you to make changes, do so conservatively:

- create ignored local directories only when needed
- prefer `.flywheel/config.local.yaml` for durable machine-local workflow
  settings
- use `$flywheel:worktree` for worktree bootstrap rather than ad hoc git commands
- keep secret-bearing files local and ignored

When Flywheel will be used repeatedly in this repo, offer to bootstrap
structured local config:

- `.flywheel/config.local.example.yaml` from `references/config-template.yaml`
  when the repo would benefit from a visible example for future users
- `.flywheel/config.local.yaml` from the same template for machine-local
  preferences
- `.gitignore` coverage for `.flywheel/*.local.yaml` when missing

Typical config values worth persisting:

- browser proof preference (`playwright-cli`)
- browser install strategy and optional pinned CLI version
- preferred browser mode (`headed` or `headless`)
- browser evidence level and whether sensitive evidence should ever be allowed
- reusable dev command or base URL when the repo has a stable local surface
- preferred optimization backend and environment
- whether bug fixes must prove a reproducer before implementation
- whether review is required before commit
- whether runtime changes must carry explicit operational validation
- whether commit should require browser proof for browser-visible changes
- worktree env-copy posture
- security posture, trusted MCP servers, and sandbox or devcontainer preference

When browser-proof work is likely for this repo, offer setup for
`playwright-cli` in this order:

1. **Repo-native** - if the repo already owns `@playwright/cli`, a package
   script, or another proven install path, use that first
2. **Existing local path** - if `npx --no-install playwright-cli --version`
   works, keep using that path
3. **Pinned global fallback** - only when the repo has no better path and the
   user accepts a host-global install

If a pinned global fallback is chosen, prefer:

```bash
npm install -g @playwright/cli@<pinned-version>
playwright-cli install --skills
```

If no pinned version is available and the repo has no local path, present a
short choice surface instead of silently defaulting to `@latest`.

When the user wants you to fix the browser gap now, `$flywheel:setup browser` should
offer to run the chosen install path directly instead of merely documenting it.

When optimization is likely to matter for this repo, ask whether the user wants
to persist a local setup ledger under `.context/flywheel/setup-ledger.md`.
If yes, use `references/setup-ledger-template.md` and record:

- the repo's likely telemetry source of truth
- whether Datadog MCP is available
- whether OTel-native access is available
- which environments are observable: local, shared non-production, production,
  or unknown
- which OTel-native services are actually available
- the preferred optimization path for this repo

When security focus is relevant, ask whether the user wants to persist a
security posture section in the setup ledger. If yes, record:

- whether the repo should default to a permissioned posture
- whether sandboxing or a devcontainer is recommended
- whether MCP config exists and which servers appear trusted
- whether untrusted MCP additions should be avoided entirely

### Phase 5: Report

Return a setup brief with:

1. **Repo setup summary**
2. **Required now**
3. **Recommended next**
4. **Commands or fixes applied**
5. **Remaining gaps**
6. **Config status** - `.flywheel/` local config or example readiness
7. **Browser proof readiness** - `playwright-cli`, repo Playwright surfaces, and
   likely local URL or dev command
8. **Suggested optimization path** - Datadog, OTel-native, hybrid, local stack,
   or local-only
9. **Workflow policy** - configured or recommended local gates for reproducer,
   review, browser proof, and runtime validation
10. **Doctor / recovery readiness** - repo-owned health-check or recovery
   surfaces and when to use them
11. **Security posture** - permission posture, sandbox or devcontainer
   recommendation, and trusted MCP status
12. **Suggested next Flywheel stage**

If browser proof is blocked because `playwright-cli` is missing, say that
explicitly in both **Required now** and **Browser proof readiness**, and include
the next runnable setup command.

If the repo is already ready, say so clearly and name the next usable workflow
surface, such as `$flywheel:plan`, `$flywheel:work`, `$flywheel:review`, or `$flywheel:commit`.
