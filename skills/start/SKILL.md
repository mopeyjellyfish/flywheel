---
name: start
description: "Route project-development work through Flywheel's compact loop: shape, work, review, commit, and post-commit spin when it is worth keeping. Pressure-test fuzzy requests before handoff, and use helper stages only when the task clearly starts there or the main loop needs them."
---

# Flywheel

## Overview

Use this skill as the umbrella entrypoint for the Flywheel development flow.
Invoke it as `flywheel:start` using the current host's native syntax:

- Codex: `$flywheel:start`
- Claude Code: `/flywheel:start`

The goal is not just to finish the current repo task. The goal is to leave
behind better context, sharper decisions, and reusable artifacts so future work
in that repo gets cheaper and faster.

If the active repo has `docs/solutions/`, treat that local directory as the
knowledge store for solved problems and durable practices. When a stage touches
an area that may already be documented, search that local store by frontmatter
before assuming the current session is the first time the problem has
appeared. Prefer docs with `doc_status: active`, and if a strong hit has
`superseded_by`, follow that path first.

## Flow Map

For software-project work, Flywheel's visible backbone is:

1. shaping via `flywheel:ideate`, `flywheel:brainstorm`, or `flywheel:plan`,
   ending in plan review and the user's `flywheel:deepen` vs `flywheel:work`
   choice
2. `flywheel:work`
3. `flywheel:review`
4. `flywheel:commit`

`flywheel:plan` is read-only. It should produce a plan, run `document-review`
on that plan, and then pause for the user to choose whether to
`flywheel:deepen` the plan or begin `flywheel:work`.

If the task is still fuzzy, route through `flywheel:ideate` or
`flywheel:brainstorm` before `flywheel:plan`.

For known-scoped repo changes, shaping usually collapses to `flywheel:plan`
plus that reviewed-plan handoff.

When multiple materially different routes or artifacts are plausible, ask one
material challenge question before final handoff so the user can correct the
framing early.

After `flywheel:commit`, offer `flywheel:spin` only when the completed work
revealed durable project-specific guidance worth preserving.

Helper and alternate-entry surfaces, used when needed rather than as mandatory
visible stages:

- `flywheel:setup` for repo and machine readiness, first-run bootstrap, and
  update-time recovery when a later stage discovers a missing requirement,
  including trusted MCP posture and sandbox or devcontainer readiness
- `flywheel:run` for optional end-to-end orchestration across the remaining stages
- `flywheel:research` for topic investigation, current best-practice
  discovery, and reusable evidence gathering that should sharpen ideation,
  brainstorming, review, or planning
- `flywheel:incident` for production or runtime incidents that begin with live
  evidence and need mitigation vs rollback vs patch framing
- `flywheel:deepen` for strengthening a reviewed plan before implementation
- `flywheel:docs` for post-work or direct documentation passes that should write
  or refresh Diataxis-shaped project docs before review and commit
- `flywheel:worktree` for isolated parallel checkouts
- `flywheel:optimize` for measurement-driven performance, throughput, or cost work
- `flywheel:rollout` for runtime-risky change-management, validation windows, and
  rollback posture after review and before commit
- `flywheel:browser-test` for browser acceptance proof with playwright-cli
- `flywheel:polish` for interactive browser-visible tightening before review or commit
- `flywheel:document-review` for requirements, plan, or design-doc review before execution,
  including the default plan-review pass at the end of shaping
- `flywheel:observability` for runtime signal, blast radius, and rollout validation design
- `flywheel:logging` for structured event and log-shape design
- `flywheel:architecture-strategy` for boundary, service-shape, hexagonal, or
  distributed-system decisions that need a focused architecture brief
- `flywheel:pattern-recognition` for repo-grounded pattern fit decisions such
  as DTO, repository, ports/adapters, builder, DDD, or distributed reliability
  posture
- `flywheel:maintainability` for future-edit-cost checks around naming,
  cohesion, ownership, and helper sprawl
- `flywheel:simplify` for bounded removal of accidental complexity in recent or
  changed work
- `flywheel:verify` for fresh proof before claiming a task is done
- `flywheel:commit` for finish-stage commit, push, PR creation or refresh, and conditional spin offers
- `flywheel:commit-message` for conventional commit-message drafting and breaking-change checks

Do not force every request through every stage. Route to the earliest missing
stage, then carry forward the artifacts from there. For normal project work,
prefer the fewest visible stages that still fit the task.

If a later stage is blocked because a required CLI, local config, browser
surface, review surface, or telemetry surface is missing, route to
`../setup/SKILL.md` with the nearest focus instead of improvising setup
inside that blocked stage.

## Routing Rules

- If the user has one idea, request, or vague direction and needs to refine
  that chosen direction, start with `../brainstorm/SKILL.md`.
- If the direction is mostly decided and the user wants concrete execution
  steps, use `../plan/SKILL.md`.
- If the user wants a better next bet, backlog shaping, or project leverage
  before entering the main loop, use `../ideate/SKILL.md`.
- If the immediate job is researching a topic, gathering current published
  guidance, or collecting evidence that should sharpen ideation, requirements,
  review judgment, or a plan, use `../research/SKILL.md`.
- If the user is shaping the current repo's development workflow, stage
  boundaries, or operating contract and the solution direction is not yet
  fixed, use
  `../ideate/SKILL.md`.
- If the user wants a coordinated pass through the remaining stages rather than
  invoking them one by one, use `../run/SKILL.md`.
- If the user wants to strengthen an existing plan before implementation, use
  `../deepen/SKILL.md`.
- If a plan exists or the user wants implementation now, use
  `../work/SKILL.md`.
- If the immediate job is updating project docs, running a Diataxis docs pass,
  or refreshing docs after a code change, use `../docs/SKILL.md`.
- If the user is dealing with a failing test, regression, stack trace, or
  broken behavior and the immediate job is root-cause analysis, use
  `../debug/SKILL.md`.
- If code already changed and the job is to find bugs, regressions, or missing
  tests, use `../review/SKILL.md`.
- If the immediate job is latency, throughput, memory, query, build, or cost
  tuning that must be proven with measurement, use `../optimize/SKILL.md`.
- If the immediate job is incident handling from alerts, logs, traces, metrics,
  or live degradation, use `../incident/SKILL.md`.
- If the immediate job is staged release planning, canary posture, activation
  sequencing, rollback criteria, or safe release of a runtime-risky change, use
  `../rollout/SKILL.md`.
- If the immediate job is proving a browser-visible change, smoke-testing a web
  flow, or gathering browser acceptance evidence, use
  `../browser-test/SKILL.md`.
- If the immediate job is tightening browser-visible behavior interactively
  before review or commit, use `../polish/SKILL.md`.
- If the immediate job is reviewing a requirements doc, plan, spec, ADR, or
  similar design artifact before implementation, use
  `../document-review/SKILL.md`.
- If the immediate job is commit, push, PR creation, PR refresh, or branch
  finishing, use `../commit/SKILL.md`.
- If the work is done and the value should be preserved in docs, scripts,
  skills, or checklists, use `../spin/SKILL.md`.
- If the user wants help choosing or validating a commit message, or a workflow
  is about to commit, use `../commit-message/SKILL.md`.
- If the user is onboarding a repo, checking machine readiness, or proving
  which tools and commands are actually available, use
  `../setup/SKILL.md`.
- If the user wants isolated branch work, parallel checkouts, or worktree
  cleanup, use `../worktree/SKILL.md`.
- If the work is primarily about measured optimization and not just generic
  instrumentation, use `../optimize/SKILL.md`.
- If the work is about telemetry, dashboards, traces, metrics, or operational
  validation, use `../observability/SKILL.md`.
- If the work is specifically about structured application logs and event
  design, use `../logging/SKILL.md`.
- If the user explicitly asks how to size a boundary, bounded context, service,
  or hexagonal or distributed-system posture, use
  `../architecture-strategy/SKILL.md`.
- If the user explicitly asks whether a named pattern fits, or which existing
  repo pattern to follow, use `../pattern-recognition/SKILL.md`.
- If the user explicitly asks for maintainability guidance around structure,
  naming, cohesion, or future edit cost, use `../maintainability/SKILL.md`.
- If the user explicitly asks to simplify or remove accidental complexity from
  recent work, use `../simplify/SKILL.md`.
- If the user is about to claim completion and the main need is evidence for
  that claim, use `../verify/SKILL.md`.

Apply these routing heuristics before doing repo exploration:

- if the input is about how the current repo's development workflow should
  route, question, or present stage boundaries and the exact solution is not
  yet chosen, route to
  `../ideate/SKILL.md`
- if the input is a vague feature, problem, or request and the immediate job is
  clarifying one chosen direction, route to `../brainstorm/SKILL.md`
- if the input explicitly points at `docs/brainstorms/` or an existing
  requirements doc, route to `../plan/SKILL.md`
- if the input explicitly asks to deepen, strengthen, or harden an existing
  plan, route to `../deepen/SKILL.md`
- if the input asks to review a requirements doc, plan, spec, ADR, or other
  design artifact, route to `../document-review/SKILL.md`
- if the input explicitly points at `docs/plans/` or asks to implement a plan,
  route to `../work/SKILL.md`
- if the input asks to update docs, README guidance, tutorials, how-to guides,
  reference pages, explanation docs, or a post-work documentation handoff,
  route to `../docs/SKILL.md`
- if the input is a bug, regression, test failure, or stack trace, route to
  `../debug/SKILL.md`
- if the input says the code already changed or asks for pre-merge bug finding,
  route to `../review/SKILL.md`
- if the input is performance tuning, latency reduction, throughput work, query
  optimization, or measured efficiency work, route to `../optimize/SKILL.md`
- if the input starts from a live incident, alert, production degradation, or
  runtime evidence and the immediate job is choosing mitigation vs rollback vs
  patch, route to `../incident/SKILL.md`
- if the input is rollout planning, canary strategy, staged enablement,
  rollback planning, or safe release of a risky runtime change, route to
  `../rollout/SKILL.md`
- if the input asks for smoke testing, browser proof, UI acceptance, or local
  web-flow verification, route to `../browser-test/SKILL.md`
- if the input asks to polish, tighten, or iterate on a browser-visible surface
  with live feedback, route to `../polish/SKILL.md`
- if the input says commit, push, PR, refresh the PR description, or finish the
  branch, route to `../commit/SKILL.md`
- if the input says the work is done and the goal is preserving lessons or
  solved problems, route to `../spin/SKILL.md`
- if the input asks for the best next bets before choosing one problem, route
  to `../ideate/SKILL.md`
- if the input explicitly asks to research a topic, gather current best
  practices, or compare published approaches that should feed shaping or
  review, route to `../research/SKILL.md`
- if the input is environment bootstrap, onboarding, or repo readiness, route
  to `../setup/SKILL.md`
- if the input asks for isolated branch work, parallel checkouts, or worktree
  cleanup, route to `../worktree/SKILL.md`
- if the input explicitly asks for boundary sizing, service shape, hexagonal
  architecture, bounded contexts, or distributed-system posture, route to
  `../architecture-strategy/SKILL.md`
- if the input explicitly asks whether DTOs, repositories, ports/adapters,
  builders, DDD, or other named patterns are justified, route to
  `../pattern-recognition/SKILL.md`
- if the input explicitly asks for maintainability or clean-code structure
  guidance, route to `../maintainability/SKILL.md`
- if the input explicitly asks to simplify recent or changed work, route to
  `../simplify/SKILL.md`

Do not do a broad repo scan just to choose between these routes. Read files or
search the repo only when:

- the route depends on confirming a referenced document exists
- the user explicitly asks for repo-grounded routing
- the request is ambiguous enough that a quick check materially changes the
  stage choice

## Routing Dialogue

For fuzzy, product-shaping, or workflow-shaping requests:

- use the exact host question tool named in
  `../references/host-interaction-contract.md` when that tool is available
- ask one material challenge question when the answer could change the chosen
  stage or artifact
- prefer 2-4 explicit answer options, with the recommended option first and a
  host-native freeform final path when it exists, when the likely answer space
  is predictable
- when routing expands into a multi-step pass because repo checks materially
  affect the answer, use the host task-tracking tool named in
  `../references/host-interaction-contract.md`; otherwise keep the router
  lightweight and skip task tracking
- ask an open question only when the answer space cannot be predicted
  responsibly
- do not ask a question just to add ceremony when the route is already obvious

## Router Response Contract

When this skill routes a task, the response should make the immediate stage and
handoff explicit. Keep it short, but do not omit the artifact or next step.

This skill is a router. It should select the next Flywheel stage, explain the
handoff, and then stop. Do not silently perform the downstream stage inside the
same response.

In user-facing output, use the current host's native Flywheel invocation
syntax:

- Codex: `$flywheel:<stage-or-skill>`
- Claude Code: `/flywheel:<stage-or-skill>`

Do not emit legacy `/fw:*` or `$fw:*` forms.

When this document refers to a stage as `flywheel:<stage-or-skill>`, treat that
as the shared stage id and adapt the prefix to the current host.
Do not leave a bare `flywheel:<stage-or-skill>` id in the final user-facing
route; render the host-native full invocation instead.

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
5. what input or correction is needed from the user now, when any

When the route depends on unresolved product, scope, or workflow-framing
questions, ask one focused challenge question after stating the stage and
handoff. Prefer 2-4 explicit options with the recommended option first and a
host-native freeform final path when the likely answer space is predictable.

Preferred stage-to-handoff wording:

- `flywheel:ideate` -> produce a ranked shortlist -> then move the selected idea into
  `flywheel:brainstorm`
- `flywheel:brainstorm` -> produce a requirements doc or requirements plan -> then
  move into `flywheel:plan`
- `flywheel:run` -> produce the remaining stage artifacts through a bounded end-to-end
  pass -> then stop at commit, a post-commit spin offer, or an approval gate
- `flywheel:deepen` -> produce a stronger reviewed technical plan -> then let
  the user choose between another deepen pass and `flywheel:work`
- `flywheel:plan` -> produce a technical implementation plan, run
  `document-review`, pause for user review, and then let the user choose
  between `flywheel:deepen` and `flywheel:work`
- `flywheel:docs` -> produce updated project docs mapped to the right Diataxis
  quadrants -> then continue into `flywheel:review` and `flywheel:commit`
- `document-review` -> produce prioritized document findings and fix direction
  -> then revise the doc, continue into `flywheel:plan`, continue into
  `flywheel:deepen` if the reviewed document is a plan that needs
  strengthening, or continue into `flywheel:work` if the reviewed plan is
  accepted
- `flywheel:browser-test` -> produce fresh browser-proof artifacts -> then continue
  into `flywheel:review` and `flywheel:commit`
- `flywheel:polish` -> produce tightened browser-visible behavior plus fresh browser
  proof -> then continue into `flywheel:review` and `flywheel:commit`
- `flywheel:work` -> produce implemented, validated repo changes, pulling in
  `flywheel:docs`, `flywheel:browser-test`, `flywheel:rollout`, or
  `flywheel:verify` only when the work needs them -> then continue into
  `flywheel:review` and `flywheel:commit`
- `flywheel:debug` -> produce a proved causal chain and either a red-to-green fix or
  a handoff back to `flywheel:brainstorm` or `flywheel:plan`
- `flywheel:review` -> produce findings and fix decisions from the
  diff-selected reviewer set, dispatching personas in parallel when the host
  supports it -> then update the branch, route through `flywheel:rollout`
  when the change is runtime-risky, then push or create/update the PR through
  `flywheel:commit`
- `flywheel:rollout` -> produce a rollout brief with activation, validation, and
  rollback posture -> then continue into `flywheel:commit`
- `flywheel:incident` -> produce an incident brief with blast radius, evidence, and
  mitigation or rollback posture -> then continue into `flywheel:debug`,
  `flywheel:rollout`, `flywheel:plan`, or `flywheel:commit`
- `flywheel:optimize` -> produce a measured optimization brief and winning change set
  -> then route through `flywheel:review` and `flywheel:commit` when code changed
- `observability` -> produce a concrete signal and validation plan -> then feed
  `flywheel:plan`, `flywheel:work`, or `flywheel:commit` depending on stage
- `logging` -> produce a concrete logging design or gap report -> then feed
  `flywheel:plan`, `flywheel:work`, or `flywheel:review`
- `verify` -> produce fresh proof and honest status ->
  then either continue through `flywheel:review`, `flywheel:commit`,
  `flywheel:spin`, or back to `flywheel:work`
- `commit-message` -> produce a conventional commit message -> then
  continue through `flywheel:commit` or the user's chosen git step
- `flywheel:commit` -> produce a committed branch or PR with testing and operational
  validation notes -> then offer `flywheel:spin` only when the finished work
  surfaced a durable project lesson
- `flywheel:spin` -> produce or update an active-repo `docs/solutions/` entry
  -> then start the next task with that stored context

If the user asks for routing help only, do not dump every stage. Name the
current stage, its artifact, and the immediate next handoff.

## Response Patterns

Use these patterns to keep routing answers stable across frontier models:

- **Research route:** "This belongs in `flywheel:research` because the
  immediate job is topic investigation and evidence gathering that should
  sharpen the next stage's real output. The output should be a compact
  recommendation-bearing research brief by default, with durable storage only
  when reuse is warranted, then the relevant handoff into `flywheel:ideate`,
  `flywheel:brainstorm`, `flywheel:review`, or `flywheel:plan`."
- **Brainstorm route:** "This should go through `flywheel:brainstorm` first because
  behavior or scope is still unclear. The output should be a short requirements
  doc or requirements plan. Once that exists, move into `flywheel:plan`."
- **Plan route:** "This is ready for `flywheel:plan` because the intended behavior is
  already clear enough to design execution. The output should be a technical
  plan the user can review before any implementation starts. After
  `document-review` runs on that plan, let the user choose whether to
  `flywheel:deepen` it or move into `flywheel:work`."
- **Run route:** "This belongs in `flywheel:run` because the task is bounded enough
  for one coordinated pass through the remaining Flywheel stages. The output
  should be the current artifact set plus a clear stop point."
- **Deepen route:** "This belongs in `flywheel:deepen` because a plan
  already exists and the immediate job is to make it more execution-ready. The
  output should be a stronger reviewed plan, then a user choice between
  another deepen pass and `flywheel:work`."
- **Docs route:** "This belongs in `flywheel:docs` because the immediate job is
  refreshing project docs from repo truth, not changing code. The output
  should be Diataxis-shaped docs updates, then `flywheel:review` and
  `flywheel:commit` if the branch is otherwise ready."
- **Document-review route:** "This belongs in `document-review` because the
  immediate job is to harden a requirements or plan artifact before execution.
  The output should be a prioritized fix queue or a clean pass. From there,
  revise the document, continue into `flywheel:plan`, continue into
  `flywheel:deepen`, or continue into work."
- **Browser-test route:** "This belongs in `flywheel:browser-test` because the
  immediate job is to prove browser-visible behavior with fresh evidence. The
  output should be a browser-proof brief plus artifacts that review and
  commit can reuse."
- **Polish route:** "This belongs in `flywheel:polish` because the feature is already
  runnable and the immediate job is short browser-visible tightening loops. The
  output should be tightened behavior plus a final browser-proof pass."
- **Work route:** "This is ready for `flywheel:work` because the scope is already
  concrete enough to execute. The output should be implemented, validated repo
  changes. During work, pull in helper stages only when the change needs them,
  then continue into `flywheel:review` and `flywheel:commit`."
- **Debug route:** "This belongs in `flywheel:debug` because the immediate job is to
  prove why the bug happens before changing code. The output should be a causal
  chain plus either a red-to-green fix or a routing decision back into
  brainstorming or planning."
- **Incident route:** "This belongs in `flywheel:incident` because the work starts
  from live evidence and the immediate job is deciding mitigate vs rollback vs
  patch. The output should be an incident brief, then the right downstream
  handoff into debug, rollout, planning, work, or commit."
- **Review route:** "This belongs in `flywheel:review` because code already changed
  and the immediate job is risk finding before merge. The output should be a
  review verdict and concrete findings from the selected diff-based reviewer
  personas. After that, fix the branch if needed, hand off to
  `flywheel:rollout` for runtime-risky changes, and then continue into
  `flywheel:commit` when the branch should be published."
- **Rollout route:** "This belongs in `flywheel:rollout` because the code is already
  changed and the immediate job is safe release planning for a runtime-risky
  change. The output should be a rollout brief with activation, validation, and
  rollback posture, then `flywheel:commit`."
- **Optimize route:** "This belongs in `flywheel:optimize` because the immediate job
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
- **Verification route:** "This belongs in `flywheel:verify`
  because the immediate job is to prove a completion claim with fresh evidence.
  The output should be an honest status against the claim."
- **Commit route:** "This belongs in `flywheel:commit` because the code is ready to leave
  the workstation. The output should be a committed branch or PR with testing
  notes and post-deploy validation, then a spin offer if the finished work
  surfaced a durable project lesson."
- **Spin route:** "This belongs in `flywheel:spin` because the work is complete and
  the value now is preserving what was learned. The output should be a durable
  active-repo `docs/solutions/` entry."

## Operating Principles

- Prefer stored-repo improvements over novelty.
- Treat `shape -> flywheel:work -> flywheel:review -> flywheel:commit` as the
  compact backbone for software-project work, where `shape` means
  `flywheel:ideate`, `flywheel:brainstorm`, or `flywheel:plan`.
- Use `flywheel:brainstorm` before `flywheel:plan` only when behavior or scope is
  still unclear, and `flywheel:ideate` only when the immediate job is choosing
  the right problem first.
- Route decisively. This skill is primarily a stage selector and handoff
  generator, but it should use one material question when that prevents the
  wrong stage or artifact.
- Carry assumptions, open questions, and decisions forward explicitly.
- Reuse durable learnings from the active repo's `docs/solutions/` when the
  current area has already been documented.
- Keep artifacts lean. Document only what will matter again.
- Let evidence beat optimism. Plans, implementation, and review should all be
  grounded in the codebase and actual checks.
- End each stage with a clear handoff to the next one, and treat `flywheel:spin`
  as a conditional post-commit capture step rather than default extra ceremony.

## Expected Outputs

- `ideate`: a ranked shortlist with why each option matters now.
- `brainstorm`: a requirements plan with only as much Q&A as the task needs.
- `run`: the remaining Flywheel artifacts plus a clear stop point or finish-stage state.
- `deepen`: a stronger, more execution-ready plan.
- `plan`: a technical execution plan with validation and risk notes.
- `docs`: updated tutorial, how-to, reference, or explanation docs grounded in
  the repo's actual behavior.
- `document-review`: ranked findings on a requirements, plan, or design doc.
- `browser-test`: fresh browser-proof evidence for a browser-visible change.
- `polish`: tightened browser-visible behavior plus a closing proof pass.
- `work`: implemented repo changes, task progress, and the helper checks the task needed before review.
- `debug`: a proved causal chain and a red signal for the bug, then either a
  minimal fix or a redesign handoff.
- `incident`: an incident brief with runtime evidence, blast radius, and the
  chosen mitigation, rollback, or patch path.
- `review`: findings first, with severity and file references.
- `rollout`: a rollout brief with activation, validation window, and rollback
  posture.
- `optimize`: a measured baseline, experiment loop, and proven best change.
- `observability`: a concrete signal, failure-mode, and rollout-validation plan.
- `logging`: a structured logging design, migration sketch, or audit gap report.
- `verify`: a claim, a fresh proof run, and honest status.
- `commit`: a commit, push, PR, or PR refresh with operational validation notes and a conditional spin offer when warranted.
- `spin`: a new or updated active-repo `docs/solutions/` entry that reduces
  repeated future effort.
- `commit-message`: a commit header, optional body or footers, and an
  explicit user check before marking breaking changes.
- `setup`: a repo-grounded readiness report with required vs optional tooling.
- `worktree`: an isolated checkout path and the next exact command to use it.

## Example Prompts

- "Use the `flywheel:start` router to route this feature request through the right Flywheel stage."
- "Use the `flywheel:start` router to decide whether this repo needs ideation, planning, or direct work."
- "Use the `flywheel:start` router to finish this task and capture the reusable learnings."
- "Use the `flywheel:start` router to decide whether this branch needs a docs pass before review."
