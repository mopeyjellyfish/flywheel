---
title: Flywheel Cross-Host Plugin Support Plan
type: feat
status: active
date: 2026-04-20
origin: docs/brainstorms/2026-04-20-flywheel-cross-host-plugin-support-requirements.md
---

# Flywheel Cross-Host Plugin Support Plan

## Overview

This plan makes Flywheel a first-class installed plugin in both Codex and
Claude Code while keeping one shared workflow and one shared skill corpus.

The target public contract after this work:

- Codex uses `$flywheel:<stage>`
- Claude Code uses `/flywheel:<stage>`
- the underlying workflow stages and names stay aligned across hosts
- legacy `/fw:*` and `$fw:*` forms are removed from current guidance and runtime
  expectations rather than preserved for compatibility (see origin:
  `docs/brainstorms/2026-04-20-flywheel-cross-host-plugin-support-requirements.md`)

## Problem Frame

Flywheel already has a real Codex plugin surface:

- `.codex-plugin/plugin.json`
- `scripts/codex-refresh-local.sh`
- `make dev`
- `scripts/flywheel-doctor.js`

Claude support is not yet first-class installed-plugin support. The repo still
frames Claude as a direct `--plugin-dir` dev loop, the eval harness rewrites
Flywheel stages to `/fw:<stage>`, and the router skill still contains
Codex-only wording in `skills/start/SKILL.md`.

That means Flywheel is currently:

- installed in Codex
- loadable in Claude
- but not yet documented, validated, or named as one coherent plugin product
  across both hosts

## Requirements Trace

- R1-R3. Support Flywheel as a first-class plugin in both hosts while keeping a
  shared workflow and clearly separating installed behavior from dev-only
  loading.
- R4-R5. Preserve the current Codex install surface and local refresh loop.
- R6-R8. Add official Claude plugin packaging and a real installed usage path,
  not only `--plugin-dir`.
- R8b. Keep this Flywheel repo as the supported install source for both Codex
  and Claude Code rather than introducing a second Claude-only distribution
  repo.
- R9-R13. Keep the `flywheel` namespace and stage names aligned across hosts,
  and do not preserve `/fw:*` or `$fw:*` aliases for compatibility.
- R14-R15. Add repo-local validation that proves the visible callable names in
  both hosts.

## Scope Boundaries

- Do not fork `skills/` into Codex-only and Claude-only copies unless a hard
  host limitation appears during implementation.
- Do not keep `/fw:*` or `$fw:*` as supported current-surface aliases.
- Do not rewrite historical brainstorms or completed plan docs just to erase
  old command examples from the record.
- Do not claim official public marketplace distribution in this pass.
- Do not rename `docs/solutions/` in this pass; that is a separate repo
  knowledge-store boundary decision, not a prerequisite for cross-host plugin
  install support.

## Context & Research

### Relevant Repo Truth

- `.codex-plugin/plugin.json` is the current Codex manifest and already exposes
  the canonical plugin name `flywheel`.
- `README.md`, `docs/setup/compatibility.md`, and
  `docs/setup/troubleshooting.md` still describe Claude primarily through
  `--plugin-dir` and `/fw:*`.
- `tools/evals/src/lib/prompt-rendering.cjs` rewrites Claude Flywheel prompts
  to `/fw:<stage>`.
- `tools/evals/src/lib/run-direct-cli.cjs` runs Claude subject evals only
  through `--plugin-dir`.
- `tools/evals/src/scoring/*.cjs` accept `/fw:*` as the Claude-facing skill
  form.
- `scripts/flywheel-doctor.js` proves Codex visibility only.
- `tools/evals/src/doctor.cjs` checks Claude `--plugin-dir` capability, but not
  a real installed-plugin path.
- `skills/start/SKILL.md` explicitly says to emit Codex-only `$flywheel:*`
  output and suppress slash commands, which conflicts with a shared-skill
  Claude install surface.
- `skills/start/agents/openai.yaml` still uses a stale bare `$flywheel` prompt
  rather than `$flywheel:start`.

### External References

- Claude plugin docs confirm that plugins use `.claude-plugin/plugin.json`,
  plugin skills are namespaced as `/plugin-name:skill`, and `--plugin-dir` is a
  local testing path rather than the installed distribution story.
- Claude marketplace docs confirm that a repo can also ship
  `.claude-plugin/marketplace.json`, users can add that marketplace with
  `claude plugin marketplace add`, and then install the plugin with
  `claude plugin install ...` at `user`, `project`, or `local` scope.
- Claude settings docs confirm `enabledPlugins` and `extraKnownMarketplaces`
  are the supported settings surfaces for repeatable project-scoped install
  posture.

## Key Technical Decisions

- **Shared skills remain the source of truth.** Fix host-specific wording inside
  the shared skill docs instead of cloning the workflow per host.
- **Use dual manifests, not dual workflows.** Keep `.codex-plugin/plugin.json`
  for Codex and add `.claude-plugin/plugin.json` for Claude.
- **Use this repo as the install source in both hosts.** Codex should continue
  to install from this repo, and Claude should install from this repo via the
  repo-hosted marketplace/install flow rather than requiring a separate
  packaging repository.
- **Ship a Claude marketplace surface in this repo.** Add
  `.claude-plugin/marketplace.json` so the same repository can be added as a
  Claude marketplace and can install Flywheel as a real plugin instead of only
  a temporary `--plugin-dir` load.
- **Support installed Claude usage at local and project scope in this pass.**
  That satisfies "installable in Claude Code" without blocking on official
  marketplace publication.
- **Keep `flywheel` as the only runtime namespace.** The host prefix differs,
  but the stage slug does not: `$flywheel:plan` and `/flywheel:plan`.
- **Keep `--plugin-dir` as a dev and eval tool only.** It remains useful for
  local iteration, but docs and doctor output should not treat it as the
  installed contract.
- **Treat the command-surface migration as a contract sweep.** README, setup
  docs, skills, eval prompts, scorers, and doctor text must move together.

## Testing Strategy

- **Project testing idioms:** Flywheel already validates naming and packaging
  changes through `node scripts/flywheel-eval.js validate`,
  `node scripts/flywheel-doctor.js`, `npm --prefix tools/evals run doctor`, and
  direct CLI smoke checks.
- **Plan-level posture mix:** use `no-new-tests` for manifest, documentation,
  and shell-helper work; use `characterization` for eval prompt/scoring changes
  because the repo already has committed suites that describe expected routing
  and stage references.
- **Why no TDD units:** this work changes packaging, install posture, prompt
  rendering, and naming contracts rather than adding new business logic.
- **Public contracts to protect:** Codex plugin visibility, Claude installed
  plugin visibility, `flywheel` namespace stability, stage-name stability, and
  honest docs about which install modes are supported.
- **Primary validation surfaces:** `.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `tools/evals/src/lib/prompt-rendering.cjs`,
  `tools/evals/src/scoring/*.cjs`, `README.md`,
  `docs/setup/compatibility.md`, `docs/setup/troubleshooting.md`,
  `scripts/flywheel-doctor.js`, and `tools/evals/src/doctor.cjs`.

## Dependencies and Sequence

1. Add the Claude packaging surface first so docs and tooling can target a real
   install shape.
2. Normalize shared skill wording and public docs to the new cross-host command
   contract.
3. Update eval prompt rendering and scorer expectations to the canonical Claude
   form.
4. Extend doctor and local-dev helpers so repo validation proves both hosts.
5. Run validation and a legacy-alias grep sweep before calling the migration
   complete.

## Implementation Units

### Unit 1: Add Claude Plugin Packaging And Installed Usage Surface

- Create `.claude-plugin/plugin.json` with the Claude-supported metadata for
  the existing Flywheel plugin identity.
- Create `.claude-plugin/marketplace.json` so this repo can act as its own
  install source for Claude plugin installation.
- Keep the plugin source rooted in the existing repo so `skills/` remains the
  shared authoring surface rather than being copied into a second packaging
  tree.
- Preserve the existing Codex "install this repo" posture and mirror it with a
  Claude "install from this repo" posture.
- Decide and document the marketplace name used by this repo. Prefer
  `flywheel` unless validation forces a different name.

Execution note: no-new-tests — packaging and metadata work validated through
Claude CLI validation and install smoke, not new repo tests.

Validation surfaces:

- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `claude plugin validate .`

Test scenarios:

- Claude validates the plugin and marketplace files from the repo root.
- A user can add this repo as a Claude marketplace and install the `flywheel`
  plugin without using `--plugin-dir`.
- The installed plugin exposes namespaced skills under `/flywheel:*`.

### Unit 2: Normalize The Shared Runtime Command Surface

- Update `skills/start/SKILL.md` so it no longer hard-codes Codex-only output.
  Replace that rule with host-aware guidance:
  - Codex outputs `$flywheel:<stage>`
  - Claude outputs `/flywheel:<stage>`
- Update `skills/start/agents/openai.yaml` so the default prompt teaches
  `$flywheel:start`, not bare `$flywheel`.
- Sweep current user-facing docs and active runtime guidance so the canonical
  examples are:
  - Codex: `$flywheel:<stage>`
  - Claude: `/flywheel:<stage>`
- Remove current-surface references to `/fw:*` and `$fw:*` from README and setup
  docs.

Execution note: characterization — the repo already has eval suites and routing
surfaces that characterize whether Flywheel teaches the right stage names.

Files:

- `README.md`
- `docs/setup/compatibility.md`
- `docs/setup/troubleshooting.md`
- `skills/start/SKILL.md`
- `skills/start/agents/openai.yaml`
- `tools/evals/README.md`

Test files:

- `evals/flywheel/cases.jsonl`
- `evals/fw-plan/cases.jsonl`
- `evals/fw-run/cases.jsonl`

Test scenarios:

- Router guidance emits the correct host-specific Flywheel invocation syntax.
- No current docs imply that `/fw:*` is the installed Claude contract.
- No current docs imply that `--plugin-dir` is the only Claude support mode.

### Unit 3: Canonicalize Eval Prompt Rendering And Scoring

- Update `tools/evals/src/lib/prompt-rendering.cjs` so Claude Flywheel prompts
  render as `/flywheel:<stage>`.
- Remove automatic legacy alias generation that exists only to support `/fw:*`
  or `fw-*` forms where that behavior is no longer part of the supported
  runtime contract.
- Update `tools/evals/src/scoring/*.cjs` so deterministic stage detection
  accepts the canonical Codex and Claude forms and drops legacy `/fw:*` and
  `$fw:*` expectations from current-suite scoring.
- Sweep eval case prompts and manifest `skill` values where they still teach
  legacy aliases instead of the canonical runtime names.

Execution note: characterization — existing eval suites are the repo's current
behavior contract for stage routing and host-specific prompt forms.

Files:

- `tools/evals/src/lib/prompt-rendering.cjs`
- `tools/evals/src/lib/run-direct-cli.cjs`
- `tools/evals/src/scoring/flywheel.cjs`
- `tools/evals/src/scoring/fw-run.cjs`
- `tools/evals/src/scoring/fw-*.cjs`
- `evals/flywheel/cases.jsonl`
- `evals/fw-*/cases.jsonl`
- `evals/*/manifest.json`

Test files:

- `evals/flywheel/cases.jsonl`
- `evals/fw-brainstorm/cases.jsonl`
- `evals/fw-plan/cases.jsonl`
- `evals/fw-work/cases.jsonl`
- `evals/fw-review/cases.jsonl`

Test scenarios:

- Claude subject prompts passed through the harness use `/flywheel:*`.
- Deterministic scorers still recognize the intended stage when the output uses
  the new canonical Claude form.
- Suite manifests and literal case prompts no longer teach legacy aliases.

### Unit 4: Add Cross-Host Local Dev And Doctor Support

- Keep `scripts/codex-refresh-local.sh` and `make dev` working for Codex.
- Add a Claude-oriented local helper, likely `scripts/claude-refresh-local.sh`,
  that installs or refreshes Flywheel for Claude from this repo through the
  marketplace/install flow instead of only advising `--plugin-dir`.
- Extend `Makefile` with explicit Claude and possibly combined targets such as
  `claude-dev` or `dev-all` while preserving the current Codex muscle memory.
- Extend `scripts/flywheel-doctor.js` and `tools/evals/src/doctor.cjs` so they
  can prove:
  - Codex sees `flywheel:start`
  - Claude can validate the plugin packaging
  - Claude can see installed `/flywheel:*` commands through the supported dev or
    installed flow for this repo

Execution note: no-new-tests — shell and CLI integration should be validated by
real command execution, not a new test harness.

Files:

- `Makefile`
- `scripts/flywheel-doctor.js`
- `scripts/claude-refresh-local.sh`
- `tools/evals/src/doctor.cjs`

Validation surfaces:

- `node scripts/flywheel-doctor.js`
- `npm --prefix tools/evals run doctor -- --smoke`

Test scenarios:

- A contributor can refresh Codex without losing the existing workflow.
- A contributor can install or refresh Flywheel for Claude from this repo
  without relying on an ad hoc command sequence.
- Doctor output names the real supported Claude install posture.

### Unit 5: Sweep Install, Compatibility, And Troubleshooting Docs

- Rewrite README install guidance so Flywheel is described as a plugin that
  supports Codex and Claude Code, not as a Codex-only plugin plus Claude eval
  compatibility.
- Make the install steps explicit that both hosts start from this same repo as
  the install source, with host-specific commands layered on top.
- Clarify three separate Claude modes:
  - local plugin development via `--plugin-dir`
  - repeatable local install
  - repeatable project install
- Update troubleshooting so users recover from missing or stale Flywheel state
  using the canonical host-specific commands and install flows.
- State plainly that legacy `/fw:*` and `$fw:*` forms are not part of the
  supported current surface.

Execution note: no-new-tests — this is a docs and operator-guidance sweep.

Files:

- `README.md`
- `docs/setup/compatibility.md`
- `docs/setup/troubleshooting.md`
- `tools/evals/README.md`

Validation surfaces:

- repo grep for `/fw:` and `$fw:`
- README and setup doc review after the install helpers exist

Test scenarios:

- A new user can follow the docs to install Flywheel in Codex.
- A new user can follow the docs to install Flywheel in Claude Code.
- A contributor can tell the difference between dev-only `--plugin-dir` usage
  and real installed usage.

## Open Questions

### Resolved During Planning

- **What Claude support tier should this pass implement?** Support repeatable
  installed usage at local and project scope now; defer public marketplace
  submission.
- **Should `/fw:*` remain supported?** No. Treat it as migration cleanup, not a
  compatibility obligation.
- **Should Codex and Claude keep different stage names?** No. Keep one
  namespace and one set of stage slugs; only the host invocation prefix differs.

### Deferred To Implementation

- Whether the repo should commit a `.claude/settings.json` example, a real
  project-level default, or only helper scripts and docs for Claude install.
- Whether marketplace validation accepts `./` as the plugin source cleanly, or
  whether the repo needs a small packaging subdirectory to satisfy Claude's
  validator.

## Validation

- Run `claude plugin validate .` from the repo root.
- Add the repo as a Claude marketplace and install Flywheel through the
  supported scope(s), then verify the installed command surface uses
  `/flywheel:*`.
- Run `node scripts/flywheel-eval.js validate`.
- Run `node scripts/flywheel-doctor.js`.
- Run `npm --prefix tools/evals run doctor -- --smoke` when the eval workspace
  dependencies are installed.
- Grep the current-surface docs, skills, and eval harness for `/fw:` and `$fw:`
  and confirm remaining hits are limited to historical records or explicit
  migration notes, not active guidance.

## Files

- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `.codex-plugin/plugin.json`
- `Makefile`
- `README.md`
- `docs/setup/compatibility.md`
- `docs/setup/troubleshooting.md`
- `skills/start/SKILL.md`
- `skills/start/agents/openai.yaml`
- `scripts/claude-refresh-local.sh`
- `scripts/flywheel-doctor.js`
- `tools/evals/README.md`
- `tools/evals/src/doctor.cjs`
- `tools/evals/src/lib/prompt-rendering.cjs`
- `tools/evals/src/lib/run-direct-cli.cjs`
- `tools/evals/src/scoring/*.cjs`
- `evals/*/manifest.json`
- `evals/flywheel/cases.jsonl`
- `evals/fw-*/cases.jsonl`

## Handoff

After this plan, move into `$flywheel:work` to implement the packaging, command
surface sweep, and cross-host validation flow in the order above.
