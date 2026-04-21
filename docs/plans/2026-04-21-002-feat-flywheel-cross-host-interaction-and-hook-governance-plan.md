---
title: Flywheel Cross-Host Interaction And Hook Governance Plan
type: feat
status: active
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-flywheel-cross-host-interaction-and-hook-governance-requirements.md
---

# Flywheel Cross-Host Interaction And Hook Governance Plan

## Overview

This plan hardens Flywheel's interaction contract and risky-edge governance
across Codex and Claude Code while keeping one shared workflow and one shared
skill corpus.

The target outcome is:

- one shared `skills/` tree
- host-native structured question UX instead of raw numbered reply prompts
- bounded parallel-agent guidance for speed where the work is independent
- thin hooks that enforce safety only at risky edges
- repo-local policy overlays that stay configurable instead of globally forcing
  heavy ceremony
- evals and doctor output that protect both correctness and restraint

## Problem Frame

Flywheel already has a good workflow shape, cross-host packaging, and unusually
strong eval coverage for a skill-driven product. The gaps are now in the
product shell and runtime contract around those skills.

Today:

- interactive skills still describe fallback numbered options in several places
- the repo has strict workflow policy toggles in
  `.flywheel/config.local.example.yaml`, but those toggles are not yet backed
  by a thin hook layer
- parallel-agent behavior exists in some skills, but not yet as one clear
  cross-host product rule
- the roadmap already says Flywheel must avoid always-loaded global
  instructions and mandatory ceremony for trivial work

The implementation goal is therefore not "add more workflow." The goal is to
make the existing workflow feel faster, safer, and more consistent without
duplicating skills or turning Flywheel into an always-on controller.

## Requirements Trace

- R1-R3. Keep one shared `skills/` tree and continue to support both Codex and
  Claude Code as first-class hosts.
- R4-R8. Standardize on host-native structured question UX, avoid raw numeric
  reply instructions, and use multi-select only where it actually fits.
- R9-R12. Preserve the explicit stage model and use parallel agents only when
  bounded, independent, and actually helpful.
- R13-R18. Add risky-edge governance through hooks, with hard-blocks only for
  clearly dangerous actions and confirm gates for procedural checkpoints like
  missing review/proof before commit or default-branch push.
- R19-R21. Respect real host boundaries: Claude may support richer bundled hook
  installation than Codex, while Codex's current hook story should be treated
  as guardrails rather than total enforcement.
- R22-R24. Extend eval, doctor, and contributor guidance so speed and safety
  stay provable.

## Scope Boundaries

- Do not fork Flywheel into Codex-only and Claude-only skill trees.
- Do not add an always-loaded plugin-wide instruction document.
- Do not make hooks a general workflow takeover surface.
- Do not hard-block routine workflow steps that are better handled as confirm
  gates.
- Do not force parallel agents for trivial or tightly coupled work.
- Do not preserve raw numbered user-reply UX as the preferred contract when the
  host already offers structured choices.
- Do not assume Codex hook packaging works the same way as Claude plugin hooks
  without verifying that from supported Codex surfaces during implementation.

## Context & Research

### Relevant Repo Truth

- `skills/` is already the shared Flywheel authoring surface.
- `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, and
  `.claude-plugin/marketplace.json` already support one-repo cross-host plugin
  packaging.
- `.flywheel/config.local.example.yaml` already has policy toggles for browser
  proof, review-before-commit, reproducer-before-fix, runtime validation, and
  trusted MCP posture.
- `skills/start/SKILL.md` already says not to force every request through every
  stage and to prefer the fewest visible stages that still fit the task.
- `skills/work/SKILL.md`, `skills/review/SKILL.md`, `skills/plan/SKILL.md`,
  `skills/ideate/SKILL.md`, and `skills/document-review/SKILL.md` already
  contain parallel-agent language, but the product contract is not yet unified.
- `scripts/flywheel-doctor.js` currently proves plugin visibility and command
  surface state, but not hook readiness or policy enforcement posture.
- Every current Flywheel skill already has an eval suite, but only a subset of
  suites explicitly score restraint.

### External Findings

- Claude Code officially supports structured `AskUserQuestion` prompts,
  `multiSelect`, settings-based hooks, plugin-bundled `hooks/hooks.json`, and
  hook outcomes such as `deny`, `ask`, `allow`, and `defer`.
- Claude hook precedence is explicit: `deny > defer > ask > allow`.
- Codex officially supports hooks, skills, and subagents, but current Codex
  docs describe `PreToolUse` as a useful guardrail rather than a complete
  enforcement boundary, and current `PreToolUse` support is Bash-only.
- Codex public docs are clearer about hooks, skills, and subagents than they
  are about a Claude-style user-question API, so implementation should prefer
  host-native structured input surfaces where available instead of assuming one
  identical cross-host question API.

Sources:

- Claude hooks: https://code.claude.com/docs/en/hooks
- Claude tools reference: https://code.claude.com/docs/en/tools-reference
- Claude plugins: https://code.claude.com/docs/en/plugins
- Codex hooks: https://developers.openai.com/codex/hooks
- Codex skills: https://developers.openai.com/codex/skills
- Codex subagents: https://developers.openai.com/codex/subagents

## Key Technical Decisions

- **Keep one authored workflow.** Shared stage instructions remain in the root
  `skills/` tree; host differences live in thin adapters.
- **Standardize on host-native structured choice UX.** Skills should talk in
  terms of structured choices, recommended-first options, multi-select only for
  compatible sets, and a host-native freeform final path when available.
- **Extract the interaction contract instead of repeating it ad hoc.** A shared
  reference should hold the rules for structured question UX so interactive
  skills do not drift independently.
- **Treat parallel agents as an explicit acceleration tool.** Relevant skills
  should consistently say when parallel agents are appropriate, when they are
  not, and how to fall back cleanly.
- **Use hooks only at risky edges.** Dangerous shell commands may be denied.
  Workflow checkpoints such as missing review/proof before commit and
  default-branch push should use confirm gates.
- **Policy comes from config, not permanent hidden instructions.** Reuse the
  existing `.flywheel/config.local.yaml` pattern and extend it only where the
  current keys are not expressive enough.
- **Prefer shared hook logic plus host-specific wrappers.** Keep one core hook
  policy implementation where practical, with thin host-specific config glue.
- **Validate restraint, not just correctness.** The eval harness should catch
  skills that become too forceful, too chatty, or too ceremony-heavy.

## Testing Strategy

- **Project testing idiom:** use the existing eval harness, doctor flows, and
  host-native plugin validation as the main regression surfaces.
- **Plan posture mix:** use `tdd` for behavior-bearing skill, hook, and eval
  changes; use `characterization` when first capturing current interaction
  behavior before tightening it; use `no-new-tests` only for docs-only
  follow-through once the same unit already added behavioral coverage.
- **Red signals:**
  - a skill still asks the user to respond with raw numbers in common
    interactive flows
  - hook policy blocks too much or too little at commit/push boundaries
  - parallel-agent guidance regresses into unconditional delegation or vague
    hand-waving
  - docs or doctor output imply more hook enforcement than the host actually
    guarantees
- **Green signals:**
  - interactive skills consistently route through structured choice UX
  - risky-edge hook behavior matches the intended `deny` vs `ask` split
  - relevant skills consistently describe bounded parallel-agent usage
  - setup, doctor, and evals all describe the same contract honestly
- **Public contracts to protect:** one shared `skills/` tree, explicit Flywheel
  stages, low-ceremony trivial flows, repo-local policy overlays, and accurate
  Codex/Claude support posture.

## Dependencies And Sequence

1. Define the shared interaction and governance contract first.
2. Sweep interactive skills and bounded parallel-agent guidance second.
3. Add shared hook logic and host-specific wrappers third.
4. Extend config, setup, doctor, and docs to match the new runtime behavior.
5. Expand eval coverage for interaction quality, restraint, and hook policy.

## Implementation Units

### Unit 1: Establish The Shared Interaction Contract

- Add a shared reference that defines:
  - structured question UX as the default
  - recommended-first options
  - when multi-select is appropriate
  - no raw numbered replies as the preferred contract
  - host-native freeform final option behavior
- Keep this reference contributor-facing and skill-consumable so interactive
  skills can point to one durable contract.
- Add a concise contributor note that shared workflow stays in `skills/`, while
  host-specific interaction glue stays outside the stage corpus.

Execution note: `characterization` first, then `tdd` if the contract forces
eval or rubric updates during the same unit.

Files:

- new shared interaction reference under `skills/` or another repo-local
  reference path chosen during implementation
- `README.md`
- `docs/setup/compatibility.md`
- optional active `docs/solutions/` update if current guidance would otherwise
  teach conflicting interaction posture

Test posture: `characterization`

Reason: first capture and centralize the contract before sweeping all
interactive stages.

Validation scenarios:

- Contributors can find one canonical explanation of Flywheel's question UX.
- The contract explicitly says not to rely on raw numbered user replies when a
  structured host surface exists.
- The contract explains when multi-select is valid and when it is not.

### Unit 2: Sweep Interactive Skills To The Shared Question UX

- Update interactive skills so they consistently describe:
  - structured question UI first
  - recommended-first options
  - multi-select only for compatible sets
  - host-native freeform final option behavior
- Remove or rewrite wording that teaches raw numeric reply flows as the primary
  interaction model.
- Keep per-skill nuance only where the skill truly needs it. Move generic
  interaction doctrine into the shared contract instead of repeating it.

Primary skill candidates:

- `skills/start/SKILL.md`
- `skills/brainstorm/SKILL.md`
- `skills/plan/SKILL.md`
- `skills/deepen/SKILL.md`
- `skills/work/SKILL.md`
- `skills/review/SKILL.md`
- `skills/setup/SKILL.md`
- `skills/docs/SKILL.md`
- `skills/ideate/SKILL.md`
- `skills/commit/SKILL.md`
- `skills/spin/SKILL.md`
- `skills/incident/SKILL.md`
- `skills/rollout/SKILL.md`
- `skills/browser-test/SKILL.md`
- `skills/polish/SKILL.md`
- `skills/observability/SKILL.md`
- `skills/logging/SKILL.md`
- `skills/verify/SKILL.md`
- `skills/document-review/SKILL.md`

Execution note: `tdd` via eval and rubric updates for the highest-traffic
skills first, then characterization-backed sweeps for lower-risk wording
alignment.

Test posture: `tdd`

Reason: the skill text is the product surface, and interaction guidance is
behavior-bearing.

Validation scenarios:

- Core interactive skills no longer teach raw `1/2/3` reply UX as the normal
  contract.
- Brainstorm, plan, setup, work, review, and commit all teach compatible
  structured-choice behavior.
- Trivial flows stay concise rather than being forced into over-questioning.

### Unit 3: Normalize Parallel-Agent Guidance In Shared Skills

- Identify the skills where parallel-agent guidance materially affects speed:
  `work`, `review`, `plan`, `ideate`, and `document-review` first.
- Tighten the rules so they consistently say:
  - use parallel agents when the user wants speed and the tasks are independent
  - keep shared-write or tightly coupled work serial
  - fall back cleanly when the host or policy does not support delegation
- Keep the shared authored workflow explicit rather than burying orchestration
  inside host-specific glue.

Execution note: `characterization` plus targeted `tdd` where current eval packs
 need new success definitions around bounded delegation.

Files:

- `skills/work/SKILL.md`
- `skills/review/SKILL.md`
- `skills/plan/SKILL.md`
- `skills/ideate/SKILL.md`
- `skills/document-review/SKILL.md`
- related reference files when they currently duplicate or conflict

Test posture: `characterization`

Reason: much of the delegation posture already exists, but it needs one cleaner
 product-level rule set.

Validation scenarios:

- Parallel-agent guidance is explicit, bounded, and consistent across the main
  skills that use it.
- Skills do not imply that delegation is mandatory for ordinary work.
- Shared-workspace and write-collision risk stays visible.

### Unit 4: Add Thin Cross-Host Hook Policy Adapters

- Add a small shared hook-policy implementation that can evaluate:
  - clearly dangerous destructive shell commands
  - missing review/proof before `git commit`
  - default-branch `git push`
  - other policy gates already expressed in local Flywheel config
- Use host-specific wrappers to bind that logic into each host's supported hook
  surface.
- For Claude, evaluate whether plugin-bundled `hooks/hooks.json` is the best
  packaging path.
- For Codex, use supported hook configuration without assuming plugin-packaged
  behavior unless repo truth and official docs prove that path.
- Keep the enforcement split:
  - `deny` for clearly dangerous destructive actions
  - `ask` for commit/push checkpoint gates
  - advisory only for non-risky workflow guidance

Execution note: `tdd`

Files:

- shared hook-policy helper under `scripts/` or `bin/`
- `hooks/hooks.json` if Claude plugin bundling is chosen
- host-specific config or install helpers for Codex and Claude
- `.flywheel/config.local.example.yaml`
- `skills/setup/references/config-template.yaml`
- `scripts/codex-refresh-local.sh`
- `scripts/claude-refresh-local.sh`

Test posture: `tdd`

Reason: this changes real runtime behavior and the developer experience at
 risky edges.

Validation scenarios:

- Dangerous destructive shell commands are denied.
- `git commit` without required review/proof triggers a confirm gate, not a
  deny.
- Default-branch `git push` triggers a confirm gate, not a deny.
- Hook behavior does not claim stronger enforcement than the host truly
  supports.

### Unit 5: Extend Setup, Doctor, And Docs For The New Runtime Contract

- Update setup and troubleshooting docs so they describe:
  - the shared question-UX contract
  - the supported hook posture in each host
  - the difference between advisory policy and enforced policy
- Extend doctor or helper scripts to verify enough hook readiness to make
  troubleshooting practical without overstating coverage.
- Add contributor-facing notes that shared skills remain the source of truth and
  host-specific wrappers are for packaging or guardrails only.

Execution note: `characterization` for doctor changes, `no-new-tests` for pure
 doc follow-through once behavior-bearing checks already exist.

Files:

- `README.md`
- `docs/setup/compatibility.md`
- `docs/setup/troubleshooting.md`
- `scripts/flywheel-doctor.js`

Test posture: `characterization`

Reason: doctor and docs should reflect validated runtime truth rather than
 inventing new behavior on their own.

Validation scenarios:

- Docs explain the hook posture honestly for both hosts.
- Doctor output can distinguish "hooks available," "hooks configured," and
  "policy likely enforced" at a useful level.
- Contributor guidance still makes clear that Flywheel is authored once in
  `skills/`.

### Unit 6: Add Eval Coverage For Restraint, Interaction Quality, And Hook Gates

- Add or expand eval dimensions for:
  - restraint
  - interaction quality
  - over-ceremony avoidance
  - hook-gate behavior where the runtime surface is represented in prompts or
    scoring
- Prioritize suites for the highest-traffic skills:
  `fw-brainstorm`, `fw-plan`, `fw-work`, `fw-review`, `fw-setup`, and
  `fw-commit`.
- Add cases that explicitly fail when a skill:
  - asks for raw numeric replies instead of structured choice behavior
  - overuses multi-select
  - turns trivial work into unnecessary process theater
  - treats commit/push gates as denials when the agreed contract is confirm
    gating

Execution note: `tdd`

Files:

- `evals/fw-brainstorm/*`
- `evals/fw-plan/*`
- `evals/fw-work/*`
- `evals/fw-review/*`
- `evals/fw-setup/*`
- `evals/fw-commit/*`
- relevant scoring files under `tools/evals/src/scoring/`

Test posture: `tdd`

Reason: without explicit evaluation, the repo will protect correctness better
 than developer experience.

Validation scenarios:

- High-traffic skills are scored for restraint and interaction quality, not
  only correctness and routing.
- Eval cases encode the agreed confirm-gate policy at commit/push boundaries.
- Future prompt edits that reintroduce numbered reply UX or heavy ceremony
  cause visible regression.
