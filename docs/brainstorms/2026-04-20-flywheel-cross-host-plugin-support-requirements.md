---
date: 2026-04-20
topic: flywheel-cross-host-plugin-support
---

# Flywheel Cross-Host Plugin Support

## Problem Frame

Flywheel already has a real Codex plugin shape:

- `.codex-plugin/plugin.json`
- local Codex refresh and doctor helpers
- Codex-facing naming and prompt guidance

Flywheel also already has host-compatible skill content and an eval harness that
can run the same skills through Claude Code. But Claude support is currently
closer to "compatible local execution" than "first-class plugin installation".

The repo documents Claude as a `--plugin-dir` workflow and translates prompts
into `/fw:<stage>` in evals. Official Claude Code plugin support is now richer:
plugins use `.claude-plugin/plugin.json`, installed plugins are namespaced, and
project or user installation is managed through plugin scopes and marketplaces.

The gap is not mainly the skill instructions. The gap is the install and runtime
contract around those skills in each host.

## Requirements

**Support Contract**
- R1. Flywheel should support first-class plugin usage in both Codex and Claude
  Code, not only Codex plugin install plus Claude `--plugin-dir` development
  loading.
- R2. Flywheel should keep one shared workflow and skill corpus wherever
  practical, rather than maintaining separate host-specific copies of the core
  stage instructions.
- R3. The repo must clearly distinguish:
  - local development loading
  - real installed plugin behavior
  - host-specific invocation syntax

**Codex**
- R4. Codex support must continue to use `.codex-plugin/plugin.json` as the
  Codex install surface.
- R5. Existing Codex local development flows such as `make dev/codex`,
  `make dev/codex/force-link`, and the local doctor should keep working.

**Claude Code**
- R6. Claude Code support must add an official Claude plugin surface using
  `.claude-plugin/plugin.json`.
- R7. Claude Code documentation and validation should reflect official plugin
  behavior, not only `--plugin-dir` development loading.
- R8. Claude support must define how Flywheel is installed for real use:
  marketplace install, project-scoped plugin enablement, local-scoped
  enablement, or a documented team-managed path.
- R8b. The Flywheel repository itself should remain a supported install source
  for both Codex and Claude Code. Do not require a separate Claude-only plugin
  repository just to make installed usage work.

**Invocation and Naming**
- R9. Host-facing command examples must reflect each host's actual invocation
  model.
- R10. If host invocation syntax differs, the stage names and mental model must
  remain aligned across hosts.
- R11. Flywheel should keep one shared namespace across hosts. The trigger names
  and stage names should stay consistent in Codex and Claude Code, even if the
  host-specific invocation prefix differs.
- R12. Historical Claude shorthand such as `/fw:<stage>` should be treated as a
  migration concern, not the long-term installed surface.
- R13. Backwards compatibility for historical command aliases is not required in
  this pass. Removing `/fw:*`, `$fw:*`, or other legacy naming should not be
  treated as a breaking-change requirement for Flywheel itself.

**Validation**
- R14. Repo-local validation must prove Flywheel is visible and callable in both
  hosts using the supported installation shapes for each host.
- R15. Validation should check the real surfaced names, not only internal eval
  prompt translation.

## Success Criteria

- A fresh checkout can follow repo docs to use Flywheel in Codex and Claude
  Code without guessing the install path.
- Codex continues to expose Flywheel through the Codex plugin system.
- Claude Code exposes Flywheel through the Claude plugin system, not only
  `--plugin-dir` development mode.
- The repo states one clear support posture for:
  - local development in Codex
  - local development in Claude Code
  - repeatable installed usage in Codex
  - repeatable installed usage in Claude Code
- The documented install steps for both hosts can start from this Flywheel repo
  as the source of truth.
- Stage naming and trigger naming remain consistent across hosts even if the
  host-specific invocation prefix differs.
- The docs describe the canonical current surface without carrying legacy alias
  promises forward.

## Scope Boundaries

- Do not fork the core workflow instructions into separate Codex-only and
  Claude-only skill trees unless a host-specific limitation truly requires it.
- Do not treat eval-harness prompt rewriting as sufficient proof of Claude
  plugin installation support.
- Do not claim true cross-host install support until the Claude plugin surface,
  docs, and validation are all explicit.
- Do not preserve historical `/fw:*` or other legacy aliases merely for
  compatibility if they make the installed cross-host contract messier.

## Key Decisions

- **Shared skills first**: keep one `skills/` tree as the primary authoring
  surface unless real host limits force divergence.
- **Dual manifests, not dual workflows**: prefer separate host manifests and
  install wrappers over duplicating the workflow content itself.
- **One repo as the install source**: prefer packaging that lets this same repo
  be used for Codex install and Claude install rather than introducing a second
  distribution repo just for Claude.
- **Installed Claude matters**: `claude --plugin-dir` should remain a dev and
  test loop, but it should not be the only documented Claude story if Flywheel
  claims plugin support in Claude Code.
- **One namespace across hosts**: prefer `flywheel` as the installed namespace
  in both hosts so the conceptual command surface stays aligned. If host syntax
  differs, keep only the prefix different, not the stage names.
- **No compatibility drag**: simplifying the command surface by removing legacy
  aliases is acceptable and should not be framed as a breaking-change blocker in
  this repo's own evolution.

## Dependencies / Assumptions

- The current Codex install surface remains `.codex-plugin/plugin.json`.
- The current skill tree is already structured in a way that Claude Code can
  consume as plugin skills once a Claude plugin manifest is present.
- The preferred installed namespace is `flywheel` in both hosts so examples
  converge on the same stage names.
- Official Claude Code plugin support now includes:
  - `.claude-plugin/plugin.json`
  - namespaced plugin skills
  - plugin scopes
  - marketplace-backed installation or project settings that enable plugins

## Outstanding Questions

### Resolve Before Planning

- What support tier do we want for Claude installation in this pass?
  - local plugin-dir development only
  - documented project or local install via Claude plugin settings
  - marketplace-ready install flow

### Deferred to Planning

- Which parts of the repo should become host-specific metadata surfaces for
  Claude, if any, beyond `.claude-plugin/plugin.json`?
- Should any Flywheel skills opt out of Claude automatic model invocation using
  Claude-specific frontmatter such as `disable-model-invocation: true`?
- Should the repo add a Claude-oriented doctor or dev helper similar to the
  Codex-specific refresh and doctor loop?

## Recommended Direction

Target a three-layer model:

1. **Shared workflow layer**
   - one `skills/` tree
   - one set of stage names and artifacts

2. **Host packaging layer**
   - `.codex-plugin/plugin.json` for Codex
   - `.claude-plugin/plugin.json` for Claude Code

3. **Host operations layer**
   - Codex refresh and doctor helpers
   - Claude install, reload, and visibility checks that reflect official Claude
     plugin behavior

This keeps the product coherent while acknowledging that install and command
surfaces are host-specific.

## Next Steps

- Then move to `$flywheel:plan` for an implementation plan covering:
  - dual-manifest support
  - Claude install and dev-loop docs
  - Claude visibility validation
  - command-surface guidance for both hosts
