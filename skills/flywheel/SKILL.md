---
name: flywheel
description: "Route software-development work through the Flywheel flow: brainstorm, plan, work, review, spin, and repeat, with ideate as an optional pre-step. Use when a task should follow a standard development loop that makes each next task easier instead of being handled ad hoc."
---

# Flywheel

## Overview

Use this skill as the umbrella entrypoint for the Flywheel development flow.

The goal is not just to finish the current task. The goal is to leave behind
better context, sharper decisions, and reusable artifacts so future work gets
cheaper and faster.

`docs/solutions/` is the Flywheel knowledge store for solved problems and
durable practices. When a stage touches an area that may already be documented,
search that store by frontmatter before assuming the current session is the
first time the problem has appeared.

## Flow Map

Route to the right stage as soon as the intent is clear:

1. `/fw:brainstorm` as the main entry point for refining ideas into a
   requirements plan.
2. `/fw:plan` for turning that requirements plan, or a detailed idea, into a
   technical implementation plan.
3. `/fw:work` for carrying out the plan with traceability.
4. `/fw:review` for pre-merge code review and risk finding.
5. `/fw:spin` for capturing what should change so the next cycle is easier.
6. `repeat` by starting the next task with better stored context than before.
7. `/fw:ideate` as an optional force multiplier when the job is to surface the
   best next ideas before entering the main loop.

Do not force every request through every stage. Route to the earliest missing
stage, then carry forward the artifacts from there.

## Routing Rules

- If the user has an idea, request, or vague direction and needs to refine it,
  start with `../fw-brainstorm/SKILL.md`.
- If the direction is mostly decided and the user wants concrete execution
  steps, use `../fw-plan/SKILL.md`.
- If the user wants a better next bet, backlog shaping, or project leverage
  before entering the main loop, use `../fw-ideate/SKILL.md`.
- If a plan exists or the user wants implementation now, use
  `../fw-work/SKILL.md`.
- If code already changed and the job is to find bugs, regressions, or missing
  tests, use `../fw-review/SKILL.md`.
- If the work is done and the value should be preserved in docs, scripts,
  skills, or checklists, use `../fw-spin/SKILL.md`.
- If the user wants help choosing or validating a commit message, or a workflow
  is about to commit, use `../conventional-commit/SKILL.md`.

## Operating Principles

- Prefer compounding improvements over novelty.
- Treat `/fw:brainstorm` as the default first step and `/fw:ideate` as the
  optional leverage step.
- Carry assumptions, open questions, and decisions forward explicitly.
- Reuse durable learnings from `docs/solutions/` when the current area has
  already been documented.
- Keep artifacts lean. Document only what will matter again.
- Let evidence beat optimism. Plans, implementation, and review should all be
  grounded in the codebase and actual checks.
- End each stage with a clear handoff to the next one.

## Expected Outputs

- `ideate`: a ranked shortlist with why each option matters now.
- `brainstorm`: a requirements plan with only as much Q&A as the task needs.
- `plan`: a technical execution plan with validation and risk notes.
- `work`: implemented changes, task progress, and checks run.
- `review`: findings first, with severity and file references.
- `spin`: a new or updated `docs/solutions/` entry that reduces repeated
  future effort.
- `conventional-commit`: a commit header, optional body or footers, and an
  explicit user check before marking breaking changes.

## Example Prompts

- "Use $flywheel to route this feature request through the right Flywheel stage."
- "Use $flywheel to decide whether this repo needs ideation, planning, or direct work."
- "Use $flywheel to finish this task and capture the reusable learnings."
