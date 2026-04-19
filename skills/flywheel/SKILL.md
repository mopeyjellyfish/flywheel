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

Apply these routing heuristics before doing repo exploration:

- if the input is a vague feature, problem, or request, route to
  `../fw-brainstorm/SKILL.md`
- if the input explicitly points at `docs/brainstorms/` or an existing
  requirements doc, route to `../fw-plan/SKILL.md`
- if the input explicitly points at `docs/plans/` or asks to implement a plan,
  route to `../fw-work/SKILL.md`
- if the input says the code already changed or asks for pre-merge bug finding,
  route to `../fw-review/SKILL.md`
- if the input says the work is done and the goal is preserving lessons or
  solved problems, route to `../fw-spin/SKILL.md`
- if the input asks for the best next bets before choosing one problem, route
  to `../fw-ideate/SKILL.md`

Do not do a broad repo scan just to choose between these routes. Read files or
search the repo only when:

- the route depends on confirming a referenced document exists
- the user explicitly asks for repo-grounded routing
- the request is ambiguous enough that a quick check materially changes the
  stage choice

## Router Response Contract

When this skill routes a task, the response should make the immediate stage and
handoff explicit. Keep it short, but do not omit the artifact or next step.

This skill is a router. It should select the next Flywheel stage, explain the
handoff, and then stop. Do not silently perform the downstream stage inside the
same response.

In particular:

- do not start writing a brainstorm requirements doc inside the router
- do not start drafting a technical plan inside the router
- do not start implementing inside the router
- do not emit review findings inside the router
- do not write or draft a spin entry inside the router

If the user clearly wants the downstream stage executed immediately, route to
that stage explicitly and hand off. The router may ask one focused question,
but it should not collapse the stage boundary by doing the stage's full work.

Always include, in plain language:

1. the selected stage
2. why that stage is the earliest missing stage
3. what artifact or outcome that stage should produce
4. the next stage after that artifact exists

When the route depends on unresolved product or scope questions, ask one
focused question after stating the stage and handoff.

Preferred stage-to-handoff wording:

- `fw-ideate` -> produce a ranked shortlist -> then move the selected idea into
  `/fw:brainstorm`
- `fw-brainstorm` -> produce a requirements doc or requirements plan -> then
  move into `/fw:plan`
- `fw-plan` -> produce a technical implementation plan -> then move into
  `/fw:work`
- `fw-work` -> produce implemented, validated changes -> then move through
  `/fw:review` and shipping, then offer `/fw:spin`
- `fw-review` -> produce findings and fix decisions -> then update the branch,
  push, or create/update the PR
- `fw-spin` -> produce or update a `docs/solutions/` entry -> then start the
  next task with that stored context

If the user asks for routing help only, do not dump every stage. Name the
current stage, its artifact, and the immediate next handoff.

## Response Patterns

Use these patterns to keep routing answers stable across frontier models:

- **Brainstorm route:** "This should go through `fw-brainstorm` first because
  behavior or scope is still unclear. The output should be a short requirements
  doc or requirements plan. Once that exists, move into `/fw:plan`."
- **Plan route:** "This is ready for `fw-plan` because the intended behavior is
  already clear enough to design execution. The output should be a technical
  plan. From there, move into `/fw:work`."
- **Work route:** "This is ready for `fw-work` because the scope is already
  concrete enough to execute. The output should be implemented, validated
  changes. After that, run `/fw:review`, ship, and offer `/fw:spin`."
- **Review route:** "This belongs in `fw-review` because code already changed
  and the immediate job is risk finding before merge. The output should be a
  review verdict and concrete findings. After that, update the branch or PR."
- **Spin route:** "This belongs in `fw-spin` because the work is complete and
  the value now is preserving what was learned. The output should be a durable
  `docs/solutions/` entry."

## Operating Principles

- Prefer compounding improvements over novelty.
- Treat `/fw:brainstorm` as the default first step and `/fw:ideate` as the
  optional leverage step.
- Route fast. This skill is primarily a stage selector and handoff generator,
  not a deep analysis workflow.
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
