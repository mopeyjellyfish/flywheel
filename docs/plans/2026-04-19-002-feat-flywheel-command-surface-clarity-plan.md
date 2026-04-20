---
title: Flywheel Command Surface Clarity Plan
type: feat
status: completed
date: 2026-04-19
origin: docs/brainstorms/2026-04-19-flywheel-command-surface-consistency-requirements.md
---

# Flywheel Command Surface Clarity Plan

## Overview

This plan turns the command-surface decision into a small documentation pass.
The goal is not to invent new aliases. The goal is to make Flywheel's current
host-specific invocation model obvious:

- Codex uses `$flywheel:*`
- Claude local plugin runs use `/fw:*`

## Problem Frame

Recent discussion showed that users can easily infer a nonexistent `$fw:*`
Codex surface when they see Claude's `/fw:*` shorthand. Official Compound
Engineering docs do not provide a strong reason to copy that idea into Codex:
their current public surface is Claude slash commands, and their Codex support
is delivered through a conversion/install pipeline rather than a shared literal
command format.

Flywheel should therefore keep the existing Codex namespace and explain the
host mapping more directly.

## Requirements Trace

- R1. Keep one explicit canonical Codex surface.
- R2. Document the host-specific mapping clearly.
- R3. Preserve `flywheel` as the Codex namespace.
- R4. Explain why host-specific shorthand is acceptable.
- R5. Remove stale troubleshooting wording.

## Scope Boundaries

- No plugin rename.
- No `$fw:*` alias.
- No eval adapter redesign.
- No broader packaging work.

## Context & Research

### Relevant Repo Surfaces

- `.codex-plugin/plugin.json` teaches the Codex surface and still uses the
  `flywheel` plugin name.
- `README.md` already documents `$flywheel:*`, but it does not clearly explain
  the Claude shorthand alongside it.
- `docs/setup/troubleshooting.md` still contains hard-coded `/fw:*` examples
  that can be read as universal guidance.
- `tools/evals/src/lib/prompt-rendering.cjs` already renders Flywheel skills as
  `/fw:*` for Claude and `$flywheel:*` for Codex.

### External Comparison

- Official Compound Engineering README currently shows Claude commands such as
  `/ce-plan` and `/ce-work`.
- The same README describes Codex support as a conversion/install target that
  writes prompts and skills into Codex directories.

## Implementation Units

### Unit 1: Clarify README host mapping

- Add a short host-specific command-surface section near the existing naming
  guidance.
- State explicitly that `$fw:*` is not a supported Codex alias today.
- Keep the quick-start flow intact.

Execution note: no-new-tests

### Unit 2: Fix stale troubleshooting wording

- Update `docs/setup/troubleshooting.md` so setup and browser-proof recovery
  guidance use host-aware wording instead of only `/fw:*`.

Execution note: no-new-tests

## Validation

- Read the updated README naming section and confirm it answers:
  - what to type in Codex
  - what to type in Claude
  - whether `$fw:*` exists
- Grep the touched docs for the stale hard-coded `/fw:*` forms that should no
  longer be universal guidance.

## Files

- `README.md`
- `docs/setup/troubleshooting.md`
- `docs/brainstorms/2026-04-19-flywheel-command-surface-consistency-requirements.md`
- `docs/plans/2026-04-19-002-feat-flywheel-command-surface-clarity-plan.md`
