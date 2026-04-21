---
date: 2026-04-20
topic: flywheel-compact-core-loop
---

# Flywheel Compact Core Loop

## Problem Frame

Flywheel already covers the full development lifecycle for project work, but
its visible stage map currently reads like a broad workflow catalog instead of
one compact project-development loop. That raises two risks:

1. users infer that good Flywheel usage requires too many explicit handoffs
2. the workflow reads like generic agent orchestration instead of repository
   work that should iterate quickly

The goal is not to remove capability. The goal is to compact the visible loop
to the fewest stages that still fit real project work:

```text
shape -> work -> review -> commit
```

Here, `shape` means the repo enters through `ideate`, `brainstorm`, or `plan`
as needed. For known-scoped changes, that usually collapses to `plan`, but the
shape stage still ends with `document-review` on the plan and a user choice
between `deepen` and `work`.

`spin` should remain important, but it should be offered after commit when
there is durable project-specific value to preserve instead of feeling like a
mandatory extra step before the branch can close.

## Requirements

**Core Loop**
- R1. Flywheel must present `shape -> work -> review -> commit` as the core
  development loop for repository work.
- R1a. `plan` must remain a read-only stage that ends with user review and
  explicit approval before `work` begins, unless the user explicitly asks to
  start implementation immediately.
- R1a1. The final plan must run through `document-review` before shape exits,
  and the user must be offered a clear choice between `deepen` and `work`.
- R1b. `review` must be the default post-work stage for software-project
  changes before `commit`, with depth scaled to risk but the stage itself not
  skipped.
- R2. The workflow must stay explicitly framed as project development in a
  repo, not as a generic autonomous-agent loop.
- R3. `spin` must remain a first-class Flywheel capability, but it should be
  framed as a post-commit capture opportunity rather than a required visible
  stage in the main loop.

**Interactive Shaping**
- R3a. `ideate`, `brainstorm`, and `plan` must be collaborative, question-driven
  stages rather than silent one-shot artifact generators.
- R3b. Those stages should make it clear what has been learned, what remains
  open, and what the next step would do.
- R3c. User answers, preferences, and corrections gathered during those stages
  should be treated as durable workflow inputs and candidate signals for later
  `spin`.
- R3d. When a shaping-stage question has a likely answer set, Flywheel should
  prefer a short multiple-choice surface with 2-4 options, the recommended
  option first, and a `Custom` path when needed.
- R3e. `start` should ask one material challenge question for fuzzy or
  workflow-shaping requests when the answer could change the selected stage or
  artifact.
- R3f. `ideate`, `brainstorm`, and `plan` should end with a compact stage
  summary that states what Flywheel heard, what changed, what remains open,
  what the next stage would do, and what input is needed now.
- R3g. Code review should dispatch diff-selected reviewer personas in parallel
  when the host supports it, then hand off to `commit`.

**Smart Internal Helpers**
- R4. `work` should be described as the stage that can pull in helper
  workflows such as docs, browser proof, verify, rollout, observability, or
  logging when the work actually needs them before review and commit.
- R5. Helper stages must remain callable directly when the user explicitly
  wants them, but the main project path should not require spelling out every
  helper hop.
- R6. User-visible workflow guidance should minimize iteration overhead and
  avoid making routine project work feel ceremony-heavy.

**Spin Contract**
- R7. `commit` should determine whether a spin handoff is worth offering based on
  durable project-specific value such as execution learnings, repo contract
  changes, review outcomes, or user corrections gathered during the session.
- R8. When a spin handoff is worth offering, `commit` should present a small,
  lightweight choice surface instead of silently forcing capture.
- R9. `spin` should treat user corrections as a valid candidate source for
  durable project guidance when those corrections change how Flywheel should
  operate in repos.

**Validation**
- R10. README and skill text should teach the compact loop clearly and
  consistently.
- R11. The eval surface should reflect the compact-loop contract, especially
  the smarter `work` stage and conditional post-commit `spin` offer.

## Success Criteria

- A user reading Flywheel docs can tell that normal project work centers on
  `shape -> work -> review -> commit`.
- `work` reads like the smart execution stage that can pull in helper
  workflows without turning them into mandatory visible stops.
- `review` reads like the default quality gate between implementation and
  commit, not an optional extra helper.
- `plan` reads like a reviewed shaping artifact that ends with a clear
  `deepen` vs `work` choice, not a silent bridge into execution.
- `commit` reads like the stage that closes the branch and then decides whether a
  spin offer is warranted.
- `spin` reads like project-knowledge capture rooted in actual repo work and
  user-corrected behavior, not abstract reflection.
- A user in `ideate`, `brainstorm`, or `plan` can quickly see what Flywheel
  now believes, what changed during the discussion, and what correction or
  choice would move the work forward.
- Updated evals can detect regressions in the compact-loop contract.

## Scope Boundaries

- Do not remove helper skills such as `review`, `docs`, `browser-test`,
  `rollout`, or `verify`.
- Do not rewrite Flywheel into a single monolithic skill.
- Do not force `spin` to run after every commit.
- Do not redesign the broader runtime-risky workflow architecture in this pass.

## Key Decisions

- **Compact the visible loop, not the capability set.** The repo should keep
  helper skills while teaching a smaller visible backbone.
- **Make `work` the smart middle stage.** It is the right place to absorb
  helper-stage selection for most project work.
- **Keep `plan` approval-gated.** A user should understand and approve what
  execution will do before Flywheel begins `work`.
- **Prefer constrained choice surfaces over vague interrogation.** When
  Flywheel can predict the main answer set, it should ask with a short
  recommended-first option list rather than forcing the user to reconstruct the
  decision tree from scratch.
- **Make each shaping stage easy to digest and correct.** The user should see
  a compact summary of what changed and what comes next before the next stage
  begins.
- **Offer `spin` after commit when there is something worth keeping.** This keeps
  knowledge capture strong without adding default iteration cost.
- **Treat user corrections as product signals.** When users correct Flywheel's
  framing or ergonomics, those corrections can become durable project
  learnings.

## Dependencies / Assumptions

- Flywheel's README, router, work, commit, and spin skill docs remain the main
  product contract surfaces.
- Prompt-eval suites remain the main regression surface for skill behavior.

## Outstanding Questions

### Resolve Before Planning

- None.

### Deferred To Planning

- How much of the compact-loop contract belongs in `start` versus `run`?
- Which eval suites need wording-only updates versus new cases or scoring
  dimensions?
- Whether hosts with a native planning mode should eventually be wired into
  `ideate`, `brainstorm`, and `plan`; this pass can enforce the behavior
  contract even without host-level mode control.

## Recommended Direction

Treat this as a compact-contract pass across the main product surfaces:

1. teach `shape -> work -> review -> commit` as the core loop
2. make shape end with `document-review` plus a `deepen` vs `work` choice
3. make `work` responsible for helper-stage selection when appropriate before
   review
4. make `review` the default quality gate after work and use diff-selected
   parallel personas when available
5. make `commit` responsible for the conditional post-commit `spin` offer
6. keep `spin` grounded in durable project-specific lessons, including user
   corrections
7. make routing and shaping questions more explicit with recommended-first
   choice surfaces and compact stage summaries
