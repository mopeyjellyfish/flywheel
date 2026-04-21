---
title: Flywheel Compact Core Loop Plan
type: feat
status: active
date: 2026-04-20
origin: docs/brainstorms/2026-04-20-flywheel-compact-core-loop-requirements.md
---

# Flywheel Compact Core Loop Plan

## Overview

This plan compacts Flywheel's visible project-development workflow to
`shape -> work -> review -> commit`, while keeping the existing helper skills
available for explicit use and for smart internal handoffs. The implementation
goal is not to remove capability. It is to reduce visible ceremony and teach
one tighter project-development contract.

## Problem Frame

Flywheel's current docs and stage descriptions still emphasize a broad catalog
of stages more than a compact project loop. That makes the product easier to
misread as a generic agent framework with many required steps, especially when
the real workflow should feel fast for repository work.

The requested shape is:

- `shape` to define the repo change through `ideate`, `brainstorm`, or `plan`
- `document-review` to review the final plan inside shape
- `deepen` or `work` as the user's post-review choice
- `work` to execute the repo change and pull in helpers only when needed
- `review` to inspect the completed change before merge
- `commit` to finish the branch and decide whether a spin handoff is worth
  offering
- `spin` as a post-commit capture opportunity, not default pre-commit ceremony

See origin:
`docs/brainstorms/2026-04-20-flywheel-compact-core-loop-requirements.md`.

## Requirements Trace

- R1-R1b. Present `shape -> work -> review -> commit` as the core loop for
  project development, with `plan` remaining read-only and approval-gated,
  the final plan running through `document-review`, the user choosing between
  `deepen` and `work`, and `review` remaining the default post-work stage.
- R2-R3. Keep the workflow explicitly framed as repo project work and `spin` as
  a conditional post-commit capture path.
- R3a-R3f. Make `ideate`, `brainstorm`, and `plan` collaborative,
  question-driven, recommended-first when choices are predictable, and durable
  enough that user answers and corrections can inform later `spin`.
- R4-R6. Make `work` the smart middle stage that can select helper workflows
  without increasing visible stage count.
- R7-R9. Teach `commit` and `spin` to use durable project learnings, shaping-stage
  answers, and user corrections to decide whether and what to capture.
- R10-R11. Keep README, skill text, handoff references, and eval surfaces
  aligned on the new contract.

## Scope Boundaries

- Do not remove or rename existing helper skills.
- Do not collapse all behavior into one stage.
- Do not force post-commit spin on every branch.
- Do not redesign rollout, incident, or other runtime-risky flows beyond how
  they are described as helper surfaces.

## Context & Research

### Relevant Repo Truth

- `README.md` currently lists a broad main-stage set that still reads as
  `brainstorm`, `plan`, `work`, `review`, `commit`, `spin`.
- `skills/start/SKILL.md` is the routing contract and the strongest place to
  teach the visible backbone.
- `skills/brainstorm/SKILL.md`, `skills/ideate/SKILL.md`, and
  `skills/plan/SKILL.md` are the main shaping-stage contracts and need a
  stronger question-driven, read-only posture.
- `skills/ideate/references/post-ideation-workflow.md`,
  `skills/brainstorm/references/handoff.md`, and
  `skills/plan/references/plan-handoff.md` own most of the stage-ending
  summaries and next-step choice surfaces.
- `skills/work/SKILL.md` already contains the logic that can absorb docs,
  browser proof, review, verify, and runtime helper calls without inventing a
  new stage.
- `skills/commit/SKILL.md` already ends by stating whether `$flywheel:spin`
  should capture a durable lesson; it needs a sharper conditional offer
  contract.
- `skills/spin/SKILL.md` already supports selected upstream candidates and
  bounded candidate discovery, which makes it the right home for
  project-specific post-commit capture.
- Existing eval suites for `flywheel`, `fw-work`, `fw-commit`, and `fw-spin`
  provide the main regression surface for this wording change.

### Relevant Durable Learnings

- `docs/solutions/developer-experience/use-flywheel-start-as-the-router-entrypoint-2026-04-19.md`
  reinforces that the public workflow contract should stay simple and explicit.
- `docs/solutions/operational-guidance/shared-evidence-bundle-for-stage-handoffs-2026-04-19.md`
  shows Flywheel already prefers stage boundaries that share artifacts rather
  than forcing users to restate context.

### External Findings

- Recent maintainer-acceptance and agent-guidance research suggests the biggest
  wins come from tighter task fit, stronger merge-quality judgment, and less
  context bloat rather than more visible orchestration steps.

## Key Technical Decisions

- **Teach one visible backbone.** Use README and `skills/start/SKILL.md` to
  make `shape -> work -> review -> commit` the main project path.
- **Make shape end on a reviewed plan.** `plan` should hand off through
  `document-review`, then offer a clear user choice between `deepen` and
  `work`.
- **Keep helper skills as explicit but secondary surfaces.** They remain
  directly callable, but `work` becomes the normal place where helper-stage
  selection is surfaced before review.
- **Make review first-class after work.** `review` should be taught as the
  default quality gate before branch publication, not as a nice-to-have helper,
  and it should select reviewers from the diff and dispatch them in parallel
  when the host allows it.
- **Move the spin decision into `commit`.** `commit` should synthesize possible
  spin candidates from execution evidence, repo changes, and user corrections,
  then offer a small choice surface only when a durable lesson exists.
- **Strengthen shaping-stage interaction.** `ideate`, `brainstorm`, and `plan`
  should ask targeted questions, summarize what changed, and pause cleanly at
  the plan boundary until the user explicitly approves work.
- **Use bounded question surfaces when the answer space is predictable.**
  Recommended-first multiple-choice questions reduce ambiguity without adding
  stage count.
- **Make the next correction obvious.** Every shaping stage should end with a
  compact summary of what Flywheel heard, what changed, what remains open, what
  the next stage would do, and what it needs from the user now.
- **Treat this as a wording-plus-evals change.** The main product here is the
  skill contract, so regression coverage should come from the existing prompt
  eval harness.

## Testing Strategy

- **Project testing idiom:** use the eval harness and suite validation as the
  main proof surface for skill-contract behavior.
- **Plan posture:** `tdd` for the behavior-bearing skill and eval changes in
  this pass because the compact-loop contract is externally visible and easy to
  express through eval cases and scoring updates.
- **Red signal:** existing wording and eval expectations still imply too many
  visible stages or fail to capture the conditional post-commit spin offer.
- **Green signal:** updated skill text and eval surfaces consistently teach the
  compact loop, the smart `work` middle stage, and the post-commit spin offer.
- **Public contracts to protect:** the Flywheel stage names, direct invocation
  of helper skills, repo-relative documentation references, and prompt-eval
  suite naming.

## Dependencies And Sequence

1. Write the compact-loop requirements and plan artifacts.
2. Update the main product contract surfaces: `README.md`,
   `skills/start/SKILL.md`, `skills/ideate/SKILL.md`,
   `skills/brainstorm/SKILL.md`, `skills/plan/SKILL.md`,
   `skills/run/SKILL.md`, `skills/work/SKILL.md`,
   `skills/commit/SKILL.md`, and `skills/spin/SKILL.md`.
3. Refresh the affected handoff references so shaping stages close with compact
   summaries and clear user-input choices.
4. Refresh the affected eval cases, rubrics, manifests, and deterministic
   scoring rules.
5. Run repo validation and capture any residual follow-up.

## Implementation Units

- [x] **Unit 1: Teach the compact, approval-gated project-development loop**

**Goal:** Make Flywheel's public workflow read as
`shape -> work -> review -> commit`, with project-specific framing, explicit plan
approval before work, a reviewed-plan `deepen` vs `work` choice, review as the
default post-work stage, and helper stages treated as secondary surfaces.

**Requirements:** [R1, R1a, R1a1, R1b, R2, R3e, R3g, R10, R11]

**Dependencies:** None

**Files:**
- Modify: `README.md`
- Modify: `skills/start/SKILL.md`
- Modify: `evals/flywheel/manifest.json`
- Modify: `evals/flywheel/cases.jsonl`
- Modify: `evals/flywheel/rubric.md`
- Modify: `tools/evals/src/scoring/flywheel.cjs`

**Test posture:** `tdd` -- The workflow contract is user-facing and already has
router-oriented eval coverage that can prove the wording shift.

**Approach:**
- Rewrite the main workflow framing so the visible backbone is explicit.
- Preserve direct routing to helper stages when the user explicitly asks for
  them or when the task clearly starts there.
- Teach the router and docs that `plan` pauses for `document-review` and a
  user `deepen` vs `work` choice before execution.
- Teach the router and docs that `review` is the default stage after `work`.
- Teach the router to ask one material challenge question for fuzzy or
  workflow-shaping requests when that changes the route or artifact.

**Execution note:** none

**Patterns to follow:**
- `docs/solutions/developer-experience/use-flywheel-start-as-the-router-entrypoint-2026-04-19.md`

**Test scenarios:**
- README makes the core project-development loop easy to identify.
- Router wording still supports direct helper-stage routing without teaching
  helper stages as mandatory visible stops.
- Router wording makes it clear that `plan` pauses for user review before
  execution begins.
- Router wording makes it clear that shape ends with plan review and a user
  choice between `deepen` and `work`.
- Router wording makes it clear that `review` is the normal post-work path
  before `commit`.
- Router wording makes the next required user input explicit for fuzzy routing
  cases.
- End-state language still points toward commit and post-commit capture.

**Red signal:** Flywheel routing or docs still imply a larger visible stage set
as the normal development loop.

**Green signal:** README and router text describe
`shape -> work -> review -> commit` as the default project path and keep helper
stages explicit but secondary.

**Verification:**
- `node scripts/flywheel-eval.js validate`

- [x] **Unit 2: Strengthen shaping stages and execution handoffs**

**Goal:** Clarify that `ideate`, `brainstorm`, and `plan` are collaborative,
question-driven, read-only shaping stages; preserve an explicit reviewed-plan
choice point before execution; and keep `work` as the smart execution stage
that can pull in helper workflows only when the work needs them.

**Requirements:** [R1a, R3a, R3b, R3c, R3d, R3f, R4, R5, R6, R10, R11]

**Dependencies:** Unit 1

**Files:**
- Modify: `skills/ideate/SKILL.md`
- Modify: `skills/ideate/references/post-ideation-workflow.md`
- Modify: `skills/brainstorm/SKILL.md`
- Modify: `skills/brainstorm/references/handoff.md`
- Modify: `skills/plan/SKILL.md`
- Modify: `skills/plan/references/plan-handoff.md`
- Modify: `skills/run/SKILL.md`
- Modify: `skills/work/SKILL.md`
- Modify: `evals/fw-brainstorm/cases.jsonl`
- Modify: `evals/fw-brainstorm/rubric.md`
- Modify: `tools/evals/src/scoring/fw-brainstorm.cjs`
- Modify: `evals/fw-ideate/cases.jsonl`
- Modify: `evals/fw-ideate/rubric.md`
- Modify: `tools/evals/src/scoring/fw-ideate.cjs`
- Modify: `evals/fw-plan/cases.jsonl`
- Modify: `evals/fw-plan/rubric.md`
- Modify: `tools/evals/src/scoring/fw-plan.cjs`
- Modify: `evals/fw-run/cases.jsonl`
- Modify: `evals/fw-run/rubric.md`
- Modify: `evals/fw-work/cases.jsonl`
- Modify: `evals/fw-work/rubric.md`
- Modify: `tools/evals/src/scoring/fw-work.cjs`

**Test posture:** `tdd` -- This is behavior-bearing wording with direct eval
coverage.

**Approach:**
- Update shaping-stage contracts so they ask targeted questions, summarize what
  changed, and stop cleanly at the planning boundary.
- Make those questions recommended-first multiple-choice surfaces when the
  likely answers can be predicted responsibly.
- Update run and plan handoff text so approval is explicit before `work`.
- Update the work-stage contract to describe helper selection as part of
  execution rather than as mandatory extra visible stops.

**Execution note:** none

**Patterns to follow:**
- `skills/work/SKILL.md`
- `evals/fw-work/cases.jsonl`

**Test scenarios:**
- `ideate` and `brainstorm` ask targeted questions when that changes the shape
  of the solution.
- When the main answer space is predictable, shaping stages present 2-4 explicit
  choices with the recommended option first and a `Custom` path when needed.
- `ideate`, `brainstorm`, and `plan` end with a compact summary of what was
  learned, what remains open, and what input or correction is needed next.
- `plan` remains read-only and hands off through `document-review`, then the
  user explicitly chooses `deepen` or `work`.
- `run` pauses at the plan boundary when execution permission has not been
  given.
- `work` still reads as execution, not replanning.
- `review` reads as diff-selected parallel persona review when the host
  supports it.
- Browser-visible, runtime-risky, and docs-sensitive work still surface the
  right helper workflows.
- Workflow closure still points to commit and preserves helper-stage realism.

**Red signal:** shaping or execution eval expectations still imply silent
one-shot planning, automatic plan-to-work execution, or a larger visible loop
than the new contract intends.

**Green signal:** shaping and execution wording plus evals describe
question-driven planning, explicit approval gates, and smart helper selection
inside work while preserving downstream closure.

**Verification:**
- `node scripts/flywheel-eval.js validate`

- [x] **Unit 3: Make post-commit spin conditional and project-specific**

**Goal:** Teach `commit` to offer `spin` only when durable project learnings
exist, and teach `spin` to treat user corrections and shaping-stage answers as
valid capture candidates.

**Requirements:** [R7, R8, R9, R11]

**Dependencies:** Unit 1

**Files:**
- Modify: `skills/commit/SKILL.md`
- Modify: `skills/spin/SKILL.md`
- Modify: `evals/fw-commit/cases.jsonl`
- Modify: `evals/fw-commit/manifest.json`
- Modify: `evals/fw-commit/rubric.md`
- Modify: `tools/evals/src/scoring/fw-commit.cjs`
- Modify: `evals/fw-spin/cases.jsonl`

**Test posture:** `tdd` -- The conditional spin offer is a visible contract
change and should be pinned in evals.

**Approach:**
- Add explicit spin-candidate sources in `commit`: execution evidence, repo
  changes, and user corrections.
- Add a small offer surface in `commit` only when worthwhile.
- Update `spin` wording so project-specific learnings and user corrections are
  first-class candidate inputs.

**Execution note:** none

**Patterns to follow:**
- `skills/commit/SKILL.md`
- `skills/spin/SKILL.md`

**Test scenarios:**
- `commit` still behaves like commit, not knowledge capture.
- `commit` can mention a bounded spin offer after successful commit.
- `spin` remains duplicate-aware and retrieval-friendly while accepting
  user-correction- and shaping-answer-based candidates.

**Red signal:** commit wording either forces spin or ignores it entirely.

**Green signal:** `commit` offers spin conditionally and `spin` supports the new
candidate source cleanly.

**Verification:**
- `node scripts/flywheel-eval.js validate`

## Open Questions

### Resolved During Planning

- Should helper stages stay directly callable? Yes. The compact loop is about
  visible defaults, not removing explicit expert surfaces.
- Should spin remain mandatory? No. It should be an explicit offer only when a
  durable project lesson exists.
- Should Flywheel force a host-native plan mode in this pass? No. This pass
  enforces the planning posture through skill contracts and approval gates;
  host-level mode integration can be considered separately later.
- Should every shaping stage become a hard approval gate? No. `ideate` and
  `brainstorm` should actively seek corrections and decisions, but the hard
  execution gate remains `plan -> work`.

### Deferred To Implementation

- Whether `fw-commit` needs only a rubric/scoring extension or also a new case
  for post-commit spin offers.
