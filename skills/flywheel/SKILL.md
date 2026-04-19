---
name: flywheel
description: "Route software-development work through the Flywheel flow: setup, ideate, brainstorm, plan, work, review, ship, spin, and repeat. Use when a task should follow a standard development loop that makes each next task easier instead of being handled ad hoc."
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
first time the problem has appeared. Prefer docs with `doc_status: active`, and
if a strong hit has `superseded_by`, follow that path first.

## Flow Map

Route to the right stage as soon as the intent is clear:

1. `/fw:brainstorm` as the main entry point for refining ideas into a
   requirements plan.
2. `/fw:plan` for turning that requirements plan, or a detailed idea, into a
   technical implementation plan.
3. `/fw:work` for carrying out the plan with traceability.
4. `/fw:debug` for bug investigation that must prove the hypothesis before a
   fix or redesign.
5. `/fw:review` for pre-merge code review and risk finding.
6. `/fw:ship` for commit, push, PR, and finishing closure.
7. `/fw:spin` for capturing what should change so the next cycle is easier.
8. `repeat` by starting the next task with better stored context than before.
9. `/fw:ideate` as an optional force multiplier when the job is to surface the
   best next ideas before entering the main loop.

Support surfaces, used when needed rather than as mandatory stages:

- `/fw:setup` for repo and machine readiness, first-run bootstrap, and
  update-time recovery when a later stage discovers a missing requirement,
  including trusted MCP posture and sandbox or devcontainer readiness
- `/fw:run` for optional end-to-end orchestration across the remaining stages
- `/fw:deepen-plan` for strengthening an existing plan before implementation
- `/fw:worktree` for isolated parallel checkouts
- `/fw:optimize` for measurement-driven performance, throughput, or cost work
- `/fw-browser-test` for browser acceptance proof with playwright-cli
- `/fw-polish` for interactive browser-visible tightening before review or ship
- `/document-review` for requirements, plan, or design-doc review before execution
- `/observability` for runtime signal, blast radius, and rollout validation design
- `/logging` for structured event and log-shape design
- `/verification-before-completion` for fresh proof before claiming a task is done
- `/conventional-commit` for commit-message drafting and breaking-change checks

Do not force every request through every stage. Route to the earliest missing
stage, then carry forward the artifacts from there.

If a later stage is blocked because a required CLI, local config, browser
surface, review surface, or telemetry surface is missing, route to
`../fw-setup/SKILL.md` with the nearest focus instead of improvising setup
inside that blocked stage.

## Routing Rules

- If the user has an idea, request, or vague direction and needs to refine it,
  start with `../fw-brainstorm/SKILL.md`.
- If the direction is mostly decided and the user wants concrete execution
  steps, use `../fw-plan/SKILL.md`.
- If the user wants a better next bet, backlog shaping, or project leverage
  before entering the main loop, use `../fw-ideate/SKILL.md`.
- If the user wants a coordinated pass through the remaining stages rather than
  invoking them one by one, use `../fw-run/SKILL.md`.
- If the user wants to strengthen an existing plan before implementation, use
  `../fw-deepen-plan/SKILL.md`.
- If a plan exists or the user wants implementation now, use
  `../fw-work/SKILL.md`.
- If the user is dealing with a failing test, regression, stack trace, or
  broken behavior and the immediate job is root-cause analysis, use
  `../fw-debug/SKILL.md`.
- If code already changed and the job is to find bugs, regressions, or missing
  tests, use `../fw-review/SKILL.md`.
- If the immediate job is latency, throughput, memory, query, build, or cost
  tuning that must be proven with measurement, use `../fw-optimize/SKILL.md`.
- If the immediate job is proving a browser-visible change, smoke-testing a web
  flow, or gathering browser acceptance evidence, use
  `../fw-browser-test/SKILL.md`.
- If the immediate job is tightening browser-visible behavior interactively
  before review or ship, use `../fw-polish/SKILL.md`.
- If the immediate job is reviewing a requirements doc, plan, spec, ADR, or
  similar design artifact before implementation, use
  `../document-review/SKILL.md`.
- If the immediate job is commit, push, PR creation, PR refresh, or branch
  finishing, use `../fw-ship/SKILL.md`.
- If the work is done and the value should be preserved in docs, scripts,
  skills, or checklists, use `../fw-spin/SKILL.md`.
- If the user wants help choosing or validating a commit message, or a workflow
  is about to commit, use `../conventional-commit/SKILL.md`.
- If the user is onboarding a repo, checking machine readiness, or proving
  which tools and commands are actually available, use
  `../fw-setup/SKILL.md`.
- If the user wants isolated branch work, parallel checkouts, or worktree
  cleanup, use `../fw-worktree/SKILL.md`.
- If the work is primarily about measured optimization and not just generic
  instrumentation, use `../fw-optimize/SKILL.md`.
- If the work is about telemetry, dashboards, traces, metrics, or operational
  validation, use `../observability/SKILL.md`.
- If the work is specifically about structured application logs and event
  design, use `../logging/SKILL.md`.
- If the user is about to claim completion and the main need is evidence for
  that claim, use `../verification-before-completion/SKILL.md`.

Apply these routing heuristics before doing repo exploration:

- if the input is a vague feature, problem, or request, route to
  `../fw-brainstorm/SKILL.md`
- if the input explicitly points at `docs/brainstorms/` or an existing
  requirements doc, route to `../fw-plan/SKILL.md`
- if the input explicitly asks to deepen, strengthen, or harden an existing
  plan, route to `../fw-deepen-plan/SKILL.md`
- if the input asks to review a requirements doc, plan, spec, ADR, or other
  design artifact, route to `../document-review/SKILL.md`
- if the input explicitly points at `docs/plans/` or asks to implement a plan,
  route to `../fw-work/SKILL.md`
- if the input is a bug, regression, test failure, or stack trace, route to
  `../fw-debug/SKILL.md`
- if the input says the code already changed or asks for pre-merge bug finding,
  route to `../fw-review/SKILL.md`
- if the input is performance tuning, latency reduction, throughput work, query
  optimization, or measured efficiency work, route to `../fw-optimize/SKILL.md`
- if the input asks for smoke testing, browser proof, UI acceptance, or local
  web-flow verification, route to `../fw-browser-test/SKILL.md`
- if the input asks to polish, tighten, or iterate on a browser-visible surface
  with live feedback, route to `../fw-polish/SKILL.md`
- if the input says commit, push, PR, refresh the PR description, or finish the
  branch, route to `../fw-ship/SKILL.md`
- if the input says the work is done and the goal is preserving lessons or
  solved problems, route to `../fw-spin/SKILL.md`
- if the input asks for the best next bets before choosing one problem, route
  to `../fw-ideate/SKILL.md`
- if the input is environment bootstrap, onboarding, or repo readiness, route
  to `../fw-setup/SKILL.md`
- if the input asks for isolated branch work, parallel checkouts, or worktree
  cleanup, route to `../fw-worktree/SKILL.md`

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
- do not commit, push, create, or refresh a PR inside the router
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
- `fw:run` -> produce the remaining stage artifacts through a bounded end-to-end
  pass -> then stop at shipping, spin, or an approval gate
- `fw:deepen-plan` -> produce a stronger technical plan -> then move into
  `/fw:work`
- `fw-plan` -> produce a technical implementation plan -> then move into
  `/fw:work`
- `document-review` -> produce prioritized document findings and fix direction
  -> then revise the doc or continue into `/fw:plan` or `/fw:work` if clean
- `fw-browser-test` -> produce fresh browser-proof artifacts -> then continue
  into `/fw:review` or `/fw:ship`
- `fw-polish` -> produce tightened browser-visible behavior plus fresh browser
  proof -> then continue into `/fw:review` and `/fw:ship`
- `fw-work` -> produce implemented, validated changes -> then move through
  `/fw:review` and `/fw:ship`, then offer `/fw:spin`
- `fw-debug` -> produce a proved causal chain and either a red-to-green fix or
  a handoff back to `/fw:brainstorm` or `/fw:plan`
- `fw-review` -> produce findings and fix decisions -> then update the branch,
  push, or create/update the PR through `/fw:ship`
- `fw-optimize` -> produce a measured optimization brief and winning change set
  -> then route through `/fw:review` and `/fw:ship` when code changed
- `observability` -> produce a concrete signal and validation plan -> then feed
  `/fw:plan`, `/fw:work`, or `/fw:ship` depending on stage
- `logging` -> produce a concrete logging design or gap report -> then feed
  `/fw:plan`, `/fw:work`, or `/fw:review`
- `verification-before-completion` -> produce fresh proof and honest status ->
  then either continue through `/fw:ship`, `/fw:spin`, or back to `/fw:work`
- `conventional-commit` -> produce a conventional commit message -> then
  continue through `/fw:ship` or the user's chosen git step
- `fw-ship` -> produce a committed branch or PR with testing and operational
  validation notes -> then offer `/fw:spin`
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
- **Run route:** "This belongs in `fw:run` because the task is bounded enough
  for one coordinated pass through the remaining Flywheel stages. The output
  should be the current artifact set plus a clear stop point."
- **Deepen-plan route:** "This belongs in `fw:deepen-plan` because a plan
  already exists and the immediate job is to make it more execution-ready. The
  output should be a stronger plan, then `/fw:work`."
- **Document-review route:** "This belongs in `document-review` because the
  immediate job is to harden a requirements or plan artifact before execution.
  The output should be a prioritized fix queue or a clean pass. From there,
  revise the document or continue into planning or work."
- **Browser-test route:** "This belongs in `fw-browser-test` because the
  immediate job is to prove browser-visible behavior with fresh evidence. The
  output should be a browser-proof brief plus artifacts that review and
  shipping can reuse."
- **Polish route:** "This belongs in `fw-polish` because the feature is already
  runnable and the immediate job is short browser-visible tightening loops. The
  output should be tightened behavior plus a final browser-proof pass."
- **Work route:** "This is ready for `fw-work` because the scope is already
  concrete enough to execute. The output should be implemented, validated
  changes. After that, run `/fw:review`, `/fw:ship`, and offer `/fw:spin`."
- **Debug route:** "This belongs in `fw-debug` because the immediate job is to
  prove why the bug happens before changing code. The output should be a causal
  chain plus either a red-to-green fix or a routing decision back into
  brainstorming or planning."
- **Review route:** "This belongs in `fw-review` because code already changed
  and the immediate job is risk finding before merge. The output should be a
  review verdict and concrete findings. After that, hand off to `/fw:ship` if
  the branch should be published."
- **Optimize route:** "This belongs in `fw-optimize` because the immediate job
  is measured tuning, not general feature implementation. The output should be
  a baseline, guardrails, chosen measurement path, and a proven improvement or
  next experiment."
- **Observability route:** "This belongs in `observability` because the
  immediate job is to make runtime behavior supportable, measurable, and safe
  to validate. The output should be a concrete logs, metrics, traces, and
  validation plan."
- **Logging route:** "This belongs in `logging` because the immediate job is to
  improve event shape and log usefulness rather than implement product
  behavior. The output should be a concrete logging design or gap report."
- **Verification route:** "This belongs in `verification-before-completion`
  because the immediate job is to prove a completion claim with fresh evidence.
  The output should be an honest status against the claim."
- **Ship route:** "This belongs in `fw-ship` because the code is ready to leave
  the workstation. The output should be a committed branch or PR with testing
  notes and post-deploy validation."
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
- `run`: the remaining Flywheel artifacts plus a clear stop point or ship state.
- `deepen-plan`: a stronger, more execution-ready plan.
- `plan`: a technical execution plan with validation and risk notes.
- `document-review`: ranked findings on a requirements, plan, or design doc.
- `browser-test`: fresh browser-proof evidence for a browser-visible change.
- `polish`: tightened browser-visible behavior plus a closing proof pass.
- `work`: implemented changes, task progress, and checks run.
- `debug`: a proved causal chain and a red signal for the bug, then either a
  minimal fix or a redesign handoff.
- `review`: findings first, with severity and file references.
- `optimize`: a measured baseline, experiment loop, and proven best change.
- `observability`: a concrete signal, failure-mode, and rollout-validation plan.
- `logging`: a structured logging design, migration sketch, or audit gap report.
- `verification-before-completion`: a claim, a fresh proof run, and honest status.
- `ship`: a commit, push, PR, or PR refresh with operational validation notes.
- `spin`: a new or updated `docs/solutions/` entry that reduces repeated
  future effort.
- `conventional-commit`: a commit header, optional body or footers, and an
  explicit user check before marking breaking changes.
- `setup`: a repo-grounded readiness report with required vs optional tooling.
- `worktree`: an isolated checkout path and the next exact command to use it.

## Example Prompts

- "Use $flywheel to route this feature request through the right Flywheel stage."
- "Use $flywheel to decide whether this repo needs ideation, planning, or direct work."
- "Use $flywheel to finish this task and capture the reusable learnings."
