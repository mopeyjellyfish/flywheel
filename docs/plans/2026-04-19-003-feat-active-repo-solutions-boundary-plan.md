---
title: Active-Repo Solutions Boundary Plan
type: feat
status: completed
date: 2026-04-19
origin: docs/brainstorms/2026-04-19-flywheel-active-repo-solutions-boundary-requirements.md
---

# Active-Repo Solutions Boundary Plan

## Overview

This plan scopes a small runtime-language fix: Flywheel skills should treat
`docs/solutions/` as the active repository's knowledge surface, not as a
global Flywheel knowledge store. The change should preserve Flywheel's own
dogfooding behavior when the active repository is Flywheel itself, while
preventing that internal context from bleeding into downstream project prompts.

## Problem Frame

Several runtime skills currently talk about `docs/solutions/` in a way that
can be read as global Flywheel guidance. That is inaccurate for installed use.
When Flywheel runs in another project, `docs/solutions/` should mean that
project's `docs/solutions/`, and missing docs should not be treated as a
failure.

## Requirements Trace

- R1. Runtime skills treat `docs/solutions/` as the active repository's store.
- R2. Flywheel's own `docs/solutions/` remains valid when Flywheel is the
  active repository.
- R3. Runtime wording does not imply internal Flywheel docs bleed into other
  repos.
- R4. Missing `docs/solutions/` remains non-fatal.
- R5. `$flywheel:spin` may still create or extend the active repo's
  `docs/solutions/`.
- R6. Solve this through runtime wording, not packaging.
- R7. Touch only the runtime prompts and references that shape downstream
  behavior.

## Implementation Units

### Unit 1: Core Runtime Skill Wording

- Update runtime skills that directly instruct agents to search, reuse, or
  create `docs/solutions/`.
- Prefer phrasing like "the active repo's `docs/solutions/`" or "if the active
  repo has `docs/solutions/`".

Execution note: no-new-tests

### Unit 2: Runtime Reference Wording

- Update supporting reference files that materially shape downstream prompts,
  summaries, or examples so they follow the same boundary.

Execution note: no-new-tests

## Validation

- Grep the touched runtime skill and reference files for `docs/solutions/` and
  confirm the wording now scopes it to the active repository where needed.
- Run `node scripts/flywheel-eval.js validate` to ensure the repo's eval suite
  metadata still validates after the prompt-text edits.

## Files

- `skills/start/SKILL.md`
- `skills/brainstorm/SKILL.md`
- `skills/ideate/SKILL.md`
- `skills/plan/SKILL.md`
- `skills/deepen-plan/SKILL.md`
- `skills/debug/SKILL.md`
- `skills/work/SKILL.md`
- `skills/review/SKILL.md`
- `skills/incident/SKILL.md`
- `skills/rollout/SKILL.md`
- `skills/optimize/SKILL.md`
- `skills/spin/SKILL.md`
- `skills/work/references/shipping-workflow.md`
- `skills/review/references/personas/learnings-researcher.md`
