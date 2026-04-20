---
date: 2026-04-19
topic: flywheel-command-surface-consistency
---

# Flywheel Command Surface Consistency

## Problem Frame

Flywheel currently exposes a clear Codex command surface, but the repo does not
say enough about how that surface relates to Claude's shorthand forms. That
creates recurring confusion about whether Codex should support a shorter `$fw`
namespace or a slash-command variant for symmetry.

The immediate question is not how to support every possible alias. The question
is which command surface Flywheel should teach as canonical across hosts right
now.

External comparison matters here because the most obvious precedent,
Compound Engineering, is easy to misremember. Its current official README uses
Claude-facing slash commands like `/ce-plan` and `/ce-work`, while Codex is
handled through a conversion pipeline that writes prompts and skills into
Codex's native directories. That is not evidence of a shared `ce:*` surface in
Codex.

## Requirements

- R1. Flywheel must keep one explicit canonical Codex surface unless Codex
  gains real alias support for a shorter namespace.
- R2. Flywheel must document the current host-specific mapping clearly enough
  that users stop inferring unsupported Codex slash commands or `$fw` aliases.
- R3. Flywheel must preserve the current Codex namespace, `flywheel`, unless
  there is a deliberate plugin rename.
- R4. Flywheel docs should explain that Claude shorthand and Codex plugin
  invocation do not have to use the same sigil or namespace length to be
  consistent in practice.
- R5. Troubleshooting and recovery docs must not teach stale command forms when
  the current recommendation is host-specific.

## Success Criteria

- README states the current command surface as:
  - Codex: `$flywheel:start` and `$flywheel:<stage>`
  - Claude local runs: `/fw:start` and `/fw:<stage>`
- README explicitly says that `$fw:*` is not a supported Codex alias today.
- Troubleshooting guidance no longer implies that `/fw:*` is the only way to
  invoke Flywheel setup or browser flows.
- No behavioral plugin changes are required for this pass.

## Scope Boundaries

- Do not rename the Flywheel plugin from `flywheel` to `fw`.
- Do not add a fake `$fw:*` alias surface in docs without real runtime support.
- Do not redesign the eval adapter; the current host-specific rendering is
  acceptable.
- Do not broaden this into multi-host packaging work.

## Key Decisions

- **Keep `flywheel` as the Codex namespace**: Codex currently binds plugin
  skills through the plugin namespace, and the repo already keys local checks
  and prompts on `flywheel`.
- **Treat Claude shorthand as a host-specific adapter**: `/fw:*` is acceptable
  in Claude because slash commands are native there.
- **Clarify, do not rename**: the right immediate work is documentation and
  consistency cleanup, not a command-surface rewrite.

## Dependencies / Assumptions

- `.codex-plugin/plugin.json` remains the current source of truth for the Codex
  plugin namespace.
- `tools/evals/src/lib/prompt-rendering.cjs` remains the current host adapter
  for Codex vs Claude prompt forms.
- Official Compound Engineering repo docs are relevant only as comparison, not
  as a contract Flywheel must copy.

## Outstanding Questions

### Resolve Before Planning

- None.

### Deferred to Planning

- Where should the README explain host-specific invocation without making the
  quick-start flow noisy?
- Which troubleshooting lines should switch from a single hard-coded form to a
  host-aware recommendation?

## Next Steps

-> `$flywheel:plan` for a small docs-and-guidance cleanup.
