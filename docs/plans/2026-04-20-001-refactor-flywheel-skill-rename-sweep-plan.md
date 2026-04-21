---
title: Flywheel Skill Rename Sweep Plan
type: refactor
status: active
date: 2026-04-20
origin: docs/brainstorms/2026-04-20-flywheel-skill-naming-requirements.md
---

# Flywheel Skill Rename Sweep Plan

## Overview

This plan standardizes the next slice of Flywheel's command vocabulary around
the single-word naming policy decided in the origin requirements doc. The work
is a user-facing contract sweep for three skills only:

- `$flywheel:deepen-plan` -> `$flywheel:deepen`
- `$flywheel:verification-before-completion` -> `$flywheel:verify`
- `$flywheel:conventional-commit` -> `$flywheel:commit`

The implementation should update the runtime skill packages, routed workflow
references, and eval wiring while explicitly deferring `browser-test` and
`document-review`.

## Problem Frame

Flywheel's command surface now has one clear namespace, but the vocabulary is
still uneven: most stages are short single words while a few helpers remain
multi-word compounds. The origin requirements doc settled the desired near-term
surface and called for a contract sweep rather than a piecemeal rename (see
origin: `docs/brainstorms/2026-04-20-flywheel-skill-naming-requirements.md`).

Because Flywheel teaches its own invocation strings in skill docs, README copy,
plugin prompts, and eval prompts, renaming these skills is not a local
directory move. The repo's own workflow guidance says user-facing renames must
update the skill path, docs, manifests, and eval prompts together.

## Requirements Trace

- R1. Prefer single-word skill names where clarity remains strong.
- R2. Preserve the `flywheel` plugin namespace in Codex.
- R3. Keep the core loop vocabulary unchanged.
- R4. Align names to the user's mental model of the job.
- R5. Avoid broadening this sweep into weaker single-word replacements for
  `browser-test` or `document-review`.
- R6. Treat the renamed commands as a repo-wide contract sweep across runtime
  prompts, docs, and evals.

## Scope Boundaries

- Do not rename the `flywheel` plugin namespace.
- Do not rename `browser-test` or `document-review` in this pass.
- Do not broaden this into a full rewrite of every helper-skill eval manifest.
- Do not rewrite historical brainstorms or completed plans just to erase old
  names from the record.

### Deferred to Separate Tasks

- Evaluate future single-word replacements for `browser-test` and
  `document-review`.
- Normalize untouched helper-skill eval manifests such as `logging`,
  `observability`, or `document-review` if the repo later decides all helper
  evals must use fully qualified runtime skill names.

## Context & Research

### Relevant Code and Patterns

- `skills/deepen-plan/`, `skills/verification-before-completion/`, and
  `skills/conventional-commit/` currently map one-to-one with the old command
  names through directory names, frontmatter `name`, and agent display prompts.
- `skills/start/SKILL.md` is the central router surface and currently references
  all three old commands in user-facing bullets, route selection rules, and
  output contracts.
- `README.md` teaches the public Flywheel command surface and currently names
  all three old commands directly.
- `tools/evals/src/lib/prompt-rendering.cjs` uses each suite manifest's `skill`
  value as the runtime command string for Codex and the host-adapted command
  form for Claude. That makes `manifest.json` skill values part of the
  user-facing contract.
- `scripts/codex-refresh-local.sh`, `scripts/flywheel-doctor.js`, and
  `make dev` are now the repo's established local-plugin validation surfaces for
  confirming that Codex actually exposes the expected skills after a refresh.

### Institutional Learnings

- `docs/solutions/workflow-issues/treat-user-facing-skill-renames-as-contract-sweeps-2026-04-19.md`
  says a rename must update skill paths, runtime prompts, README guidance, eval
  manifests, eval prompts, and manual-run instructions together.
- `docs/solutions/developer-experience/keep-eval-suite-ids-separate-from-runtime-skill-names-2026-04-19.md`
  says suite IDs stay stable even when runtime command names change; only the
  manifest `skill` field and literal prompts should move with the runtime.
- `docs/solutions/operational-guidance/shared-evidence-bundle-for-stage-handoffs-2026-04-19.md`
  is an active guidance doc and currently names the old verification skill path
  in frontmatter, so active docs that teach current behavior should move with
  the rename even when historical records do not.

### External References

- None.

## Key Technical Decisions

- **Rename the runtime skill packages, not just the displayed labels**:
  directory names, `SKILL.md` frontmatter names, and agent metadata should all
  move to `deepen`, `verify`, and `commit` so repo structure matches runtime
  invocation.
- **Keep suite IDs stable while updating runtime skill fields**:
  `fw-deepen-plan`, `verification-before-completion`, and
  `conventional-commit` remain the harness IDs, but their manifest `skill`
  values and literal case prompts should use the new callable forms.
- **Update active guidance, not historical records**: README, runtime skill
  docs, active solution docs, and eval prompts should teach the new names;
  completed plans and brainstorms may remain historical unless they are used as
  active guidance.
- **Treat helper-skill eval prefixing as scoped work, not repo-wide cleanup**:
  for the renamed helpers, use the true runtime commands
  `flywheel:deepen`, `flywheel:verify`, and `flywheel:commit`; leave unrelated
  helper-suite normalization for a later task.

## Testing Strategy

- **Project testing idioms:** Flywheel validates command-surface changes through
  repo-local eval metadata, prompt rendering, and installed-plugin visibility.
  The existing validation surfaces are `node scripts/flywheel-eval.js validate`,
  `node scripts/flywheel-doctor.js`, and the refresh path behind `make dev`.
- **Posture selection rule:** Every implementation unit in this plan uses
  `no-new-tests` because the work is a naming-contract refactor over prompts,
  manifests, and file layout. Coverage should come from existing eval suites and
  plugin-visibility checks rather than from adding new suites.
- **Plan-level posture mix:** All units use `no-new-tests`; the meaningful proof
  is that existing suites, prompt rendering, and Codex skill visibility reflect
  the renamed commands.
- **Material hypotheses:** None. There are no TDD-appropriate behavior changes
  in this plan.
- **Red -> green proof points:** None. The repo already has validation surfaces
  for this kind of contract change.
- **Tooling assumption:** Assume the existing eval helper scripts, doctor, and
  local plugin refresh flow remain available. Concrete shell execution belongs
  to `$flywheel:work`.
- **Public contracts to protect:** `flywheel` plugin namespace; `$flywheel:start`
  as the router; stable suite IDs; unchanged callable names for
  `$flywheel:browser-test` and `$flywheel:document-review`; correct runtime names
  for `deepen`, `verify`, and `commit`.
- **Primary test surfaces:** renamed skill packages and agent metadata; routed
  references in runtime skills and README; eval manifests and case prompts;
  Codex prompt-input visibility after a local refresh.
- **Test patterns to mirror:** follow the previous router rename pattern:
  update the skill package, the public docs, the plugin-facing prompts, and the
  eval manifest/prompt surfaces together rather than changing only one layer.

## Implementation Units

### Unit 1: Rename The Three Skill Packages

- Move `skills/deepen-plan/` to `skills/deepen/`, update the frontmatter `name`
  to `deepen`, and update the self-description and agent metadata to teach
  `$flywheel:deepen`.
- Move `skills/verification-before-completion/` to `skills/verify/`, update the
  frontmatter `name` to `verify`, and update the self-description and agent
  metadata to teach `$flywheel:verify`.
- Move `skills/conventional-commit/` to `skills/commit/`, update the frontmatter
  `name` to `commit`, and update the self-description and agent metadata to
  teach `$flywheel:commit`.

Execution note: no-new-tests

### Unit 2: Update Routed Workflow References And Active Guidance

- Update `skills/start/SKILL.md` so support-surface bullets, routing rules,
  route explanations, and output-contract text use `deepen`, `verify`, and
  `commit`.
- Update downstream runtime references that currently teach the old names:
  `skills/debug/SKILL.md`, `skills/commit/SKILL.md`, `skills/work/SKILL.md`,
  `skills/work/references/commit-workflow.md`,
  `skills/commit/references/evidence-bundle.md`, and
  `skills/ideate/references/post-ideation-workflow.md`.
- Update user-facing docs that advertise the command surface, primarily
  `README.md`, and any active solution doc that still names an old skill path
  or current command surface.

Execution note: no-new-tests

### Unit 3: Sweep Eval Manifests And Literal Prompt Cases

- Update `evals/fw-deepen-plan/manifest.json` so the `skill` field becomes
  `flywheel:deepen`, and update the literal command prompts in
  `evals/fw-deepen-plan/cases.jsonl` to use `$flywheel:deepen`.
- Keep the suite IDs `conventional-commit` and
  `verification-before-completion`, but update their manifest `skill` fields to
  the runtime commands `flywheel:commit` and `flywheel:verify`.
- Update the literal case prompts in `evals/conventional-commit/cases.jsonl`
  and `evals/verification-before-completion/cases.jsonl` to use the new
  callable commands instead of the old bare helper names.
- Leave rubric titles and suite IDs alone unless they directly teach the old
  runtime invocation rather than the stable harness identity.

Execution note: no-new-tests

## Open Questions

### Resolved During Planning

- **Should the renamed helper eval manifests stay bare or use runtime-qualified
  names?** Use the true runtime commands in `manifest.json` for the renamed
  helpers, because the eval guidance says manifest `skill` values should track
  the callable surface even when suite IDs stay stable.
- **Should historical plans and brainstorms be rewritten?** No. Update active
  guidance and current product surfaces only; preserve historical records unless
  they are being used as live instruction.

### Deferred to Implementation

- After the grep sweep, confirm whether any remaining old-name hits outside the
  expected historical records should be treated as active guidance and updated
  opportunistically.

## Validation

- Grep the repo for `deepen-plan`, `verification-before-completion`, and
  `conventional-commit` and confirm the remaining hits are limited to expected
  historical artifacts, suite IDs, or explicit deferral notes.
- Run `node scripts/flywheel-eval.js validate` to prove the renamed manifest
  skill values and updated literal prompts still satisfy the existing eval
  suite registry.
- Refresh the local plugin install with the normal local-dev flow and confirm
  Codex exposes `flywheel:deepen`, `flywheel:verify`, and `flywheel:commit`
  while no longer exposing the old runtime names in prompt-input visibility.

## Files

- `skills/deepen-plan/SKILL.md` -> `skills/deepen/SKILL.md`
- `skills/deepen-plan/agents/openai.yaml` -> `skills/deepen/agents/openai.yaml`
- `skills/verification-before-completion/SKILL.md` -> `skills/verify/SKILL.md`
- `skills/verification-before-completion/agents/openai.yaml` -> `skills/verify/agents/openai.yaml`
- `skills/conventional-commit/SKILL.md` -> `skills/commit/SKILL.md`
- `skills/conventional-commit/agents/openai.yaml` -> `skills/commit/agents/openai.yaml`
- `skills/start/SKILL.md`
- `skills/debug/SKILL.md`
- `skills/commit/SKILL.md`
- `skills/work/SKILL.md`
- `skills/work/references/commit-workflow.md`
- `skills/commit/references/evidence-bundle.md`
- `skills/ideate/references/post-ideation-workflow.md`
- `README.md`
- `docs/solutions/operational-guidance/shared-evidence-bundle-for-stage-handoffs-2026-04-19.md`
- `evals/fw-deepen-plan/manifest.json`
- `evals/fw-deepen-plan/cases.jsonl`
- `evals/conventional-commit/manifest.json`
- `evals/conventional-commit/cases.jsonl`
- `evals/verification-before-completion/manifest.json`
- `evals/verification-before-completion/cases.jsonl`
