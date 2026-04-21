---
title: Flywheel Commit Replaces Ship Plan
type: feat
status: active
date: 2026-04-21
origin: docs/brainstorms/2026-04-21-flywheel-commit-replaces-ship-requirements.md
---

# Flywheel Commit Replaces Ship Plan

## Overview

This plan replaces Flywheel's visible finish stage `ship` with `commit`,
promotes `commit` from a message helper into the full branch-finishing stage,
renames the current message helper to `commit-message`, and rewrites the live
workflow surfaces so Flywheel teaches `shape -> work -> review -> commit ->
spin`.

This is a deep command-contract migration rather than a wording-only rename.
It changes user-facing invocation, internal skill ownership, evidence-bundle
consumers, downstream handoffs, active solution docs, and eval coverage.

## Problem Frame

Flywheel's current finish-stage command is `ship`, but the command a developer
is most likely to reach for is `commit`. At the same time, Flywheel already
uses `commit` for a narrower internal helper that only drafts commit messages.
That split creates friction:

- the memorable command name does not run the memorable action
- the actual branch-finishing workflow is hidden behind a less intuitive stage
- direct `commit` invocation does not map to the user's likely intent
- downstream skills and active docs keep teaching a finish-stage name the user
  no longer wants

The requested product shape is:

- `shape -> work -> review -> commit -> spin`
- `commit` owns commit planning, commit(s), push, PR create or refresh, and the
  post-finish `spin` offer
- `commit-message` becomes the internal helper for Conventional Commit drafting
- `ship` is removed immediately rather than kept as a compatibility alias

See origin:
`docs/brainstorms/2026-04-21-flywheel-commit-replaces-ship-requirements.md`.

## Requirements Trace

- R1-R4. Replace `ship` with `commit` as the visible finish stage, teach the
  new loop everywhere, and remove `ship` immediately.
- R5-R8. Make `$flywheel:commit` the full finishing workflow, default to push
  and PR refresh, keep direct invocation moving, and stop only on real
  blockers.
- R9-R12. Add logical multi-commit detection, preview the commit plan before
  execution, and avoid fake precision when the diff is too entangled to split
  honestly.
- R13-R14. Rename the current helper to `commit-message` and reuse it from the
  full `commit` stage.
- R15. Sweep routing, helper-stage handoffs, evidence-bundle references,
  rollout and review handoffs, active durable docs, and eval surfaces so they
  no longer teach or depend on `ship`.
- R16. Rename ship-based live wording and policy labels across the repo,
  including `fw-ship`, `shipping`, and `review-before-ship` wording when those
  phrases refer to the finish stage or its policy gate.

## Scope Boundaries

- Do not keep `ship` as a compatibility alias.
- Do not keep ship-based finish-stage wording in current config templates,
  plugin metadata, setup guidance, or eval labels when those surfaces are part
  of the live product contract.
- Do not weaken review-before-finish, default-branch, browser-proof, or
  runtime-validation protections.
- Do not force every branch into multiple commits.
- Do not rewrite historical brainstorms or plan artifacts just to erase the old
  term; treat them as historical records.
- Do rewrite active `docs/solutions/` entries that currently teach the live
  workflow contract.

## System-Wide Impact

- **Developers using Flywheel:** the remembered finish-stage command changes
  from `$flywheel:ship` to `$flywheel:commit`.
- **Core workflow skills:** router, run, work, review, rollout, and spin all
  change their downstream contract.
- **Proof and PR preparation:** evidence-bundle and PR-template references move
  from the old `ship` surface to the new `commit` surface.
- **Config and policy language:** shipping sections and review-before-ship
  wording in current config or setup surfaces must be renamed to commit-based
  wording without weakening the underlying gates.
- **Eval harness:** one suite continues to cover commit-message drafting, while
  the old finish-stage suite migrates to the new finish-stage command.
- **Active repo knowledge:** solutions that currently teach `ship` must be
  rewritten so future Flywheel runs retrieve the new contract instead of stale
  guidance.

## Context & Research

### Relevant Repo Truth

- `skills/ship/SKILL.md` already owns the real finish flow: readiness checks,
  commit, push, PR create or refresh, and conditional spin offer.
- `skills/commit/SKILL.md` is currently only a Conventional Commit helper and
  already describes itself as a shared helper for commit-message drafting.
- `skills/ship/references/evidence-bundle.md` and
  `skills/ship/references/pr-body-template.md` are the shared finishing-stage
  references that later stages already point to.
- `skills/start/SKILL.md`, `skills/run/SKILL.md`, `skills/work/SKILL.md`,
  `skills/review/SKILL.md`, `skills/rollout/SKILL.md`, `skills/browser-test/SKILL.md`,
  `skills/verify/SKILL.md`, `skills/optimize/SKILL.md`, `skills/incident/SKILL.md`,
  `skills/docs/SKILL.md`, `skills/polish/SKILL.md`, `skills/setup/SKILL.md`,
  `skills/worktree/SKILL.md`, `skills/observability/SKILL.md`, and related
  references all still hand off to `ship` or read `../ship/...`.
- `README.md` currently teaches `shape -> work -> review -> ship -> spin ->
  repeat`.
- `.flywheel/config.local.example.yaml` and
  `skills/setup/references/config-template.yaml` still use a `shipping` section
  and `review.require_review_before_ship`.
- `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, and
  `.claude-plugin/marketplace.json` still describe the product using shipping
  language.
- `evals/commit/manifest.json` already uses the generic suite id
  `conventional-commit`, which is a stable harness label and can remain
  separate from runtime skill names.
- `evals/fw-ship/` and `tools/evals/src/scoring/fw-ship.cjs` still encode the
  old finish-stage name directly, so leaving them unchanged would continue to
  teach the removed command.
- `skills/ship/agents/openai.yaml` and `skills/commit/agents/openai.yaml`
  contain the direct host-facing default prompts for the two current surfaces.

### Relevant Durable Learnings

- `docs/solutions/workflow-issues/treat-user-facing-skill-renames-as-contract-sweeps-2026-04-19.md`
  says user-facing skill renames must be treated as repo-wide contract sweeps,
  not isolated file renames.
- `docs/solutions/developer-experience/keep-eval-suite-ids-separate-from-runtime-skill-names-2026-04-19.md`
  supports keeping generic harness ids stable when they do not directly teach
  the runtime command surface.
- `docs/solutions/operational-guidance/shared-evidence-bundle-for-stage-handoffs-2026-04-19.md`
  shows the finishing stage is the primary consumer of the shared evidence
  bundle, so reference ownership must move with the finish-stage rename.
- `docs/solutions/operational-guidance/dedicated-rollout-and-incident-stages-for-runtime-risk-2026-04-19.md`
  shows rollout and incident docs currently teach `ship` as the downstream
  finisher and need live-contract rewrites.

### External Findings

- No external research is needed for this plan. The migration is governed by
  repo-local command contracts, prompt surfaces, and harness behavior rather
  than third-party APIs or external standards.

## Key Technical Decisions

- **Make `commit` the full finish-stage command.** The user-facing command
  should match the action developers are most likely to remember.
- **Rename the message helper to `commit-message`.** This keeps the user mental
  model clean while preserving reusable Conventional Commit logic.
- **Migrate by renaming directories, not duplicating skills.** `skills/commit/`
  should become `skills/commit/`, and the current `skills/commit/` should move
  to `skills/commit-message/`, so the repo does not carry two conflicting
  surfaces.
- **Keep direct `commit` invocation permissive.** `commit` should auto-run the
  checks it can, including review when needed, and only stop on real blockers.
- **Preview multi-commit execution before staging.** Show a short commit plan
  when the diff should split, then execute it; if the diff is too entangled,
  prefer one honest commit.
- **Move finishing references with the finish stage.** Evidence-bundle and PR
  template references should live under `skills/commit/references/`.
- **Rename ship-based policy language in the same pass.** Current live wording
  such as `fw-ship`, `shipping`, and `review-before-ship` should move to
  commit-based wording everywhere the repo teaches or configures the finish
  stage.
- **Rewrite active solution docs, not historical planning artifacts.** The
  durable operational guidance should teach the live command contract, while
  old brainstorms and plans can remain historical records.
- **Keep `conventional-commit` as a stable eval suite id.** It is already a
  generic harness label, so only its `skill` target and prompts need to move to
  `flywheel:commit-message`.
- **Rename `fw-ship` to `fw-commit`.** Unlike `conventional-commit`, the
  existing suite id directly teaches the removed runtime command and appears in
  the harness docs, so full cleanup should rename it.

## Testing Strategy

- **Project testing idiom:** use the prompt-eval harness plus repo-local doctor
  and smoke checks as the main proof surface for command-contract changes.
- **Plan posture:** `tdd` for the behavior-bearing command-surface and eval
  changes because the new contract is externally visible and already modeled by
  suite manifests, literal prompts, and deterministic scoring rules.
- **Red signal:** the repo still teaches `ship`, `commit` still behaves like a
  message-only helper, or downstream stages still hand off to the removed
  command.
- **Green signal:** Flywheel consistently teaches `commit` as the finisher,
  `commit-message` as the helper, active solutions reflect the new contract,
  and eval surfaces validate the new workflow.
- **Public contracts to protect:** `$flywheel:commit`, `$flywheel:commit-message`,
  `shape -> work -> review -> commit -> spin`, default-branch safety,
  review/browser/runtime gates, and active `docs/solutions/` retrieval quality.

## Dependencies And Sequence

1. Move the current helper and finish-stage directories into their new names.
2. Rewrite the new `commit` stage contract and internal call-out to
   `commit-message`.
3. Sweep all downstream skill, config, policy, manifest, and reference wording
   from `ship` to `commit`.
4. Rewrite README and active `docs/solutions/` entries that teach the old
   finish-stage contract.
5. Update eval suites, scorer wiring, and harness docs to reflect the new
   command surface and renamed finish-stage terminology.
6. Run repo validation and command-surface smoke checks, then capture any
   follow-up gaps.

## Implementation Units

- [ ] **Unit 1: Rename the finishing and helper skill surfaces**

**Goal:** Replace the conflicting current skill layout with one where
`commit` is the finish stage and `commit-message` is the helper.

**Requirements:** [R1, R3, R4, R13, R14]

**Dependencies:** None

**Files:**
- Rename: `skills/commit/` -> `skills/commit-message/`
- Rename: `skills/ship/` -> `skills/commit/`
- Modify: `skills/commit/SKILL.md`
- Modify: `skills/commit/agents/openai.yaml`
- Modify: `skills/commit-message/SKILL.md`
- Modify: `skills/commit-message/agents/openai.yaml`

**Test posture:** `tdd` -- The runtime surface changes are user-facing and
should be proven through command-surface evals and host smoke checks.

**Approach:**
- Move the message-only helper into `commit-message` without changing its core
  Conventional Commit behavior.
- Promote the old `ship` surface into `commit`, preserving the full
  finish-stage role.
- Update agent prompt metadata so host-facing prompts teach the new commands.

**Patterns to follow:**
- `docs/solutions/workflow-issues/treat-user-facing-skill-renames-as-contract-sweeps-2026-04-19.md`

**Test scenarios:**
- The repo exposes `commit` as the finish stage and `commit-message` as the
  helper.
- No direct user-facing `ship` skill surface remains.
- The helper still supports breaking-change approval gates and conventional
  message drafting.

**Red signal:** both `commit` and `ship` still exist as finish-stage surfaces
or the helper rename leaves the user-facing contract ambiguous.

**Green signal:** the skill tree has one clear finish stage and one clear
message helper.

**Verification:**
- `node scripts/flywheel-eval.js validate`

- [ ] **Unit 2: Redefine `commit` as the full finishing workflow**

**Goal:** Make `$flywheel:commit` own logical commit planning, auto-run missing
finish-stage checks, execute commit(s), push by default, refresh or create the
PR, and then offer `spin`.

**Requirements:** [R5, R6, R7, R8, R9, R10, R11, R12, R14]

**Dependencies:** Unit 1

**Files:**
- Modify: `skills/commit/SKILL.md`
- Modify: `skills/commit/references/evidence-bundle.md`
- Modify: `skills/commit/references/pr-body-template.md`
- Modify: `skills/run/SKILL.md`
- Modify: `skills/start/SKILL.md`
- Modify: `skills/work/SKILL.md`
- Modify: `skills/work/references/commit-workflow.md`
- Modify: `skills/review/SKILL.md`
- Modify: `skills/spin/SKILL.md`

**Test posture:** `tdd` -- The finish-stage behavior is contract-driven and
already expressible through prompt cases and deterministic scorer logic.

**Approach:**
- Rewrite the new `commit` stage to treat direct invocation as permission to
  finish the branch rather than as a reason to reject the request.
- Add a short multi-commit planning surface before staging when multiple
  logical commit units are detected.
- Reuse `commit-message` internally for header, body, and footer drafting.
- Keep default-branch, review, browser-proof, and runtime-validation gates
  intact, but let `commit` run missing finish-stage checks itself before
  deciding whether a real blocker remains.
- Preserve the conditional post-finish spin offer.

**Patterns to follow:**
- `docs/solutions/operational-guidance/shared-evidence-bundle-for-stage-handoffs-2026-04-19.md`

**Test scenarios:**
- Direct `commit` invocation does not refuse to run just because review or
  other finish-stage work was skipped earlier.
- `commit` previews multiple commits before execution when the diff warrants a
  split.
- `commit` falls back to one honest commit when the diff is too entangled to
  partition cleanly.
- `commit` still enforces hard blockers such as default-branch risk and
  unresolved high-severity review findings.
- `spin` remains a conditional post-finish offer rather than mandatory
  ceremony.

**Red signal:** `commit` either behaves like the old message helper or becomes
an unguarded “always push” path with weakened safety gates.

**Green signal:** `commit` is the full finisher and still preserves the real
quality gates.

**Verification:**
- `node scripts/flywheel-eval.js validate`

- [ ] **Unit 3: Sweep downstream handoffs, config wording, and live workflow docs**

**Goal:** Rewrite every live stage handoff and product-facing explanation so
the normal downstream path is `review -> commit -> spin`.

**Requirements:** [R1, R2, R3, R5, R8, R15]

**Dependencies:** Unit 2

**Files:**
- Modify: `README.md`
- Modify: `.codex-plugin/plugin.json`
- Modify: `.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`
- Modify: `.flywheel/config.local.example.yaml`
- Modify: `skills/docs/SKILL.md`
- Modify: `skills/browser-test/SKILL.md`
- Modify: `skills/verify/SKILL.md`
- Modify: `skills/optimize/SKILL.md`
- Modify: `skills/incident/SKILL.md`
- Modify: `skills/rollout/SKILL.md`
- Modify: `skills/polish/SKILL.md`
- Modify: `skills/setup/SKILL.md`
- Modify: `skills/setup/references/config-template.yaml`
- Modify: `skills/worktree/SKILL.md`
- Modify: `skills/observability/SKILL.md`
- Modify: `skills/work/agents/openai.yaml`
- Modify: `skills/run/agents/openai.yaml`
- Modify: `skills/rollout/agents/openai.yaml`
- Modify: `skills/browser-test/agents/openai.yaml`
- Modify: `skills/incident/references/incident-template.md`
- Modify: `skills/rollout/references/rollout-template.md`
- Modify: `skills/browser-test/references/evidence-contract.md`
- Modify: `skills/optimize/references/optimization-loop.md`

**Test posture:** `tdd` -- These are live workflow-contract surfaces and should
be proven through prompt-eval continuity and targeted text sweeps.

**Approach:**
- Replace finish-stage language in README and live skill guidance with the new
  `commit` contract.
- Rename ship-based config and policy wording, including `shipping` sections,
  `fw-ship`, and `review-before-ship`, wherever those refer to the live finish
  stage or its gate.
- Update any `../ship/...` reference paths to `../commit/...`.
- Preserve helper-stage purpose while updating their downstream handoff target.
- Keep rollout and incident guidance explicit so `commit` does not flatten
  runtime-risky decision-making.

**Patterns to follow:**
- `docs/solutions/operational-guidance/dedicated-rollout-and-incident-stages-for-runtime-risk-2026-04-19.md`

**Test scenarios:**
- README teaches `shape -> work -> review -> commit -> spin`.
- Config templates, plugin manifests, and setup guidance use commit-based
  wording for the finish stage and its policy gate.
- Helper stages hand off to `review`, `commit`, or `rollout` as appropriate,
  not to the removed `ship` stage.
- Shared evidence-bundle references still point at the canonical finisher.

**Red signal:** product docs or helper stages still teach `ship` as the live
finish stage.

**Green signal:** the visible product contract is internally consistent.

**Verification:**
- `node scripts/flywheel-eval.js validate`

- [ ] **Unit 4: Rewrite active solution docs and preserve retrieval quality**

**Goal:** Update active `docs/solutions/` entries that currently teach `ship`
so future Flywheel runs retrieve the new live contract instead of stale
guidance.

**Requirements:** [R3, R15]

**Dependencies:** Unit 3

**Files:**
- Modify: `docs/solutions/operational-guidance/dedicated-rollout-and-incident-stages-for-runtime-risk-2026-04-19.md`
- Modify: `docs/solutions/operational-guidance/shared-evidence-bundle-for-stage-handoffs-2026-04-19.md`

**Test posture:** `characterization` -- These docs are durable repo knowledge;
the main risk is corrupting the guidance while rewriting the command terms.

**Approach:**
- Rewrite command examples and explanatory text from `ship` to `commit`.
- Update `files_touched` frontmatter paths so solution retrieval points to the
  new owning files.
- Keep the underlying operational guidance intact; only the live command
  contract and consumer paths should change.

**Patterns to follow:**
- `docs/solutions/developer-experience/keep-eval-suite-ids-separate-from-runtime-skill-names-2026-04-19.md`

**Test scenarios:**
- Active solution docs no longer teach `ship`.
- Solution frontmatter still points to the canonical live files.
- The retrieved guidance still makes sense with the new finish-stage name.

**Red signal:** active solution docs become historically accurate but no longer
useful as current guidance.

**Green signal:** active solutions preserve their reasoning while teaching the
new command contract.

**Verification:**
- `rg -n "\\$flywheel:commit|/flywheel:commit|flywheel:commit" docs/solutions`

- [ ] **Unit 5: Update eval packs and harness wiring for the new command surface**

**Goal:** Keep regression coverage aligned with the new runtime contract while
preserving stable generic harness identities where they still add value.

**Requirements:** [R3, R5, R8, R9, R10, R13, R15]

**Dependencies:** Units 1-4

**Files:**
- Modify: `evals/commit/manifest.json`
- Modify: `evals/commit/cases.jsonl`
- Modify: `evals/commit/rubric.md`
- Rename: `evals/fw-ship/` -> `evals/fw-commit/`
- Modify: `evals/fw-commit/manifest.json`
- Modify: `evals/fw-commit/cases.jsonl`
- Modify: `evals/fw-commit/rubric.md`
- Modify: `evals/fw-commit/README.md`
- Modify: `evals/README.md`
- Modify: `evals/flywheel/cases.jsonl`
- Modify: `evals/flywheel/rubric.md`
- Modify: `evals/fw-run/cases.jsonl`
- Modify: `evals/fw-run/rubric.md`
- Modify: `evals/fw-review/cases.jsonl`
- Modify: `evals/fw-review/rubric.md`
- Modify: `evals/fw-work/cases.jsonl`
- Modify: `evals/fw-work/rubric.md`
- Modify: `evals/fw-docs/cases.jsonl`
- Modify: `evals/fw-docs/rubric.md`
- Modify: `evals/fw-browser-test/cases.jsonl`
- Modify: `evals/fw-browser-test/rubric.md`
- Modify: `evals/fw-incident/rubric.md`
- Modify: `evals/fw-optimize/cases.jsonl`
- Modify: `evals/fw-optimize/rubric.md`
- Modify: `evals/fw-polish/cases.jsonl`
- Modify: `evals/fw-polish/rubric.md`
- Modify: `evals/fw-rollout/cases.jsonl`
- Modify: `evals/flywheel-runtime-change/cases.jsonl`
- Modify: `evals/flywheel-runtime-change/manifest.json`
- Modify: `evals/flywheel-runtime-change/rubric.md`
- Modify: `evals/flywheel-incident-response/cases.jsonl`
- Modify: `evals/flywheel-incident-response/manifest.json`
- Modify: `evals/flywheel-incident-response/rubric.md`
- Modify: `evals/fw-spin/cases.jsonl`
- Rename: `tools/evals/src/scoring/fw-ship.cjs` -> `tools/evals/src/scoring/fw-commit.cjs`
- Modify: `tools/evals/src/scoring/index.cjs`
- Modify: `tools/evals/src/scoring/flywheel.cjs`
- Modify: `tools/evals/src/scoring/fw-run.cjs`
- Modify: `tools/evals/src/scoring/fw-review.cjs`
- Modify: `tools/evals/src/scoring/fw-work.cjs`
- Modify: `tools/evals/src/scoring/fw-browser-test.cjs`
- Modify: `tools/evals/src/scoring/fw-optimize.cjs`
- Modify: `tools/evals/src/scoring/fw-polish.cjs`
- Modify: `tools/evals/src/scoring/flywheel-runtime-change.cjs`
- Modify: `tools/evals/src/scoring/flywheel-incident-response.cjs`

**Test posture:** `tdd` -- The new command surface should be captured first in
cases, rubric language, and deterministic scoring expectations.

**Approach:**
- Keep the generic suite id `conventional-commit`, but retarget it to
  `flywheel:commit-message`.
- Rename the finish-stage eval pack from `fw-ship` to `fw-commit` because the
  old suite id itself teaches the removed runtime term.
- Update journey and stage-pack prompts, rubrics, and scoring logic so they
  no longer expect `ship` or other ship-based finish-stage wording as the
  downstream path.
- Keep harness documentation explicit about the distinction between suite ids
  and runtime command names.

**Patterns to follow:**
- `docs/solutions/workflow-issues/treat-user-facing-skill-renames-as-contract-sweeps-2026-04-19.md`
- `docs/solutions/developer-experience/keep-eval-suite-ids-separate-from-runtime-skill-names-2026-04-19.md`
- `docs/solutions/developer-experience/journey-evals-without-a-harness-redesign-2026-04-19.md`

**Test scenarios:**
- The message-helper suite still evaluates conventional commit drafting under
  the new `commit-message` runtime skill.
- The finish-stage suite evaluates `commit`, not `ship`.
- Downstream journey suites expect `commit` where the old finish stage used to
  appear.
- No current eval pack or harness doc still teaches `fw-ship` as the live
  finish-stage label.
- Harness docs stay readable and do not blur suite ids with runtime commands.

**Red signal:** eval coverage still exercises or rewards the removed `ship`
surface.

**Green signal:** harness coverage matches the new runtime contract without
unnecessary suite-id churn.

**Verification:**
- `node scripts/flywheel-eval.js validate`

- [ ] **Unit 6: Run validation and command-surface smoke checks**

**Goal:** Prove the rename sweep is internally consistent and the local plugin
surface still works after the command migration.

**Requirements:** [R1-R15]

**Dependencies:** Units 1-5

**Files:**
- No planned source edits; validation-only unit

**Test posture:** `no-new-tests` -- This unit exists to run repo validation and
smoke checks against the already-updated command surface.

**Approach:**
- Run diff hygiene and eval validation.
- Run local doctor or smoke checks that exercise the installed command surface.
- Sweep for stale `ship` references in live product surfaces.

**Execution note:** If host-specific smoke checks require a refreshed local
plugin install, use the repo's existing local-dev refresh path rather than ad
hoc command probing.

**Test scenarios:**
- Repo validation passes after the rename sweep.
- The local command surface recognizes `commit` and `commit-message`.
- No stale ship-based finish-stage wording remains in README, active skills,
  config templates, plugin metadata, evals, or active solution docs.

**Red signal:** validation passes but the installed plugin surface still
advertises removed commands or missing new ones.

**Green signal:** repo text, evals, and local plugin surfaces all agree on the
new finish-stage contract.

**Verification:**
- `git diff --check`
- `node scripts/flywheel-eval.js validate`
- `node scripts/flywheel-doctor.js --host codex`
- `node scripts/flywheel-doctor.js --host claude --smoke`

## Open Questions

- Whether the finish-stage eval directory rename from `fw-ship` to `fw-commit`
  should also rename any cached run-directory conventions or whether the suite
  directory and manifest id changes are sufficient.

## Confidence Check

- The plan is grounded in the current repo structure: the old `ship` stage owns
  the finish flow, the current `commit` stage is only the helper, and the repo
  has extensive live ship-based references across skills, config templates,
  plugin metadata, active solutions, and eval packs.
- The migration is partitioned so directory renames happen before the
  downstream reference sweep, which reduces cross-reference confusion during
  implementation.
- The plan preserves Flywheel's existing review, rollout, browser-proof, and
  runtime-validation safeguards while changing the user-facing finish command.
- The main residual risk is breadth: this is a real contract sweep, so the work
  should not start without treating evals, active solution docs, and doctor
  surfaces as first-class migration targets.
