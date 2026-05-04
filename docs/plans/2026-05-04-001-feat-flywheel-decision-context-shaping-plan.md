---
title: Flywheel Decision And Context Shaping Plan
type: feat
status: completed
date: 2026-05-04
origin: docs/brainstorms/2026-05-04-flywheel-simplification-requirements.md
---

# Flywheel Decision And Context Shaping Plan

## Overview

This plan integrates the missing Flywheel simplification features that were
specified but not implemented in the vertical TDD pass merged in PR #15.

The target outcome is:

- a first-class `fw:decision` helper for ADR-quality decision grilling,
  context/glossary capture, and direct review of existing decision artifacts
- a lightweight decision checkpoint that always runs when `fw:shape` closes a
  material shaping pass, but only loads deeper references when an ADR or
  context write is justified
- downstream project context and decision conventions that are useful for
  ordinary software projects, not only for Flywheel skill development
- spec-packet and issue-slice behavior folded into existing shaping stages
  without expanding the default visible loop
- smaller `fw:work` routing that consumes vertical plans, loads TDD at the
  implementation boundary, and stops duplicating specialist doctrine
- reduced default hooks that enforce risky edges rather than general workflow
  coaching
- commit, push, and PR finish behavior that remains automated by default and
  uses the same evidence bundle surfaced by work and review

The visible Flywheel loop remains:

```text
shape -> work -> review -> optional spin -> commit
```

## Problem Frame

The current repo has the vertical planning and TDD contracts from PR #15:
`skills/plan/SKILL.md`, `skills/work/SKILL.md`, and
`skills/test-driven-development/SKILL.md` now all bias toward vertical behavior
slices and red-green-refactor execution. The remaining gap is the shaping and
workflow simplification layer around that execution path.

`docs/brainstorms/2026-05-04-flywheel-simplification-requirements.md` calls
for ADR/decision shaping, lazy context/glossary artifacts, hook reduction, work
skill simplification, and publish-by-default commit behavior. The repo does not
yet contain `skills/decision/`, `skills/adr/`, `docs/decisions/` guidance,
shape decision-checkpoint evals, or a reduced hook install posture.

The implementation should borrow the useful behavior from Matt Pocock's
engineering skills while preserving Flywheel's compact workflow:

- `grill-with-docs`: challenge terms, inspect code/docs before asking, walk
  decision dependencies one at a time, update context and ADR docs inline
- `tdd`: one vertical tracer bullet at a time through public behavior
- `to-prd`: synthesize a product-flavored spec packet from known context and keep
  implementation/testing decisions visible
- `to-issues`: split accepted work into independently grabbable tracer-bullet
  slices, including dependencies and human-interaction markers
- `diagnose`, `triage`, `improve-codebase-architecture`, `setup`, and
  `zoom-out`: consistently read project context and decisions before analysis

Sources:

- https://github.com/mattpocock/skills/tree/main/skills/engineering
- https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs
- https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd
- https://github.com/mattpocock/skills/tree/main/skills/engineering/to-prd
- https://github.com/mattpocock/skills/tree/main/skills/engineering/to-issues

## Requirements Trace

- R1-R3. Reduce default hook behavior to risky-edge guardrails.
- R4-R12. Add first-class ADR/decision shaping and always run a lightweight
  shape decision checkpoint.
- R13-R17. Support lazy domain context/glossary capture and contradiction
  surfacing.
- R18-R25. Preserve vertical TDD planning and execution as the default for
  behavior-bearing work.
- R26-R29. Slim `fw:work` into an execution router plus completion gate.
- R30-R32. Keep commit -> push -> PR creation or refresh as the remembered
  finish path.
- R33-R37. Keep the default loaded instructions compact and move conditional
  detail into references.

## Scope Boundaries

- Do not add ADR capture as mandatory ceremony for every small task.
- Do not add a new mandatory `spec`, `decision`, `research`, or `issues` stage
  to the visible loop.
- Do not create context/glossary files just because they are absent.
- Do not weaken destructive-command, sensitive-write, installed-plugin-write,
  or explicitly configured commit/push safety.
- Do not dilute the current vertical TDD contract by allowing horizontal
  "all tests then all implementation" batches.
- Do not make downstream project guidance specific to Flywheel's own `skills/`,
  evals, or plugin manifests except where the instruction is explicitly about
  maintaining this repo.
- Do not build a full issue-tracker abstraction in this pass. Issue-slice
  output should be a portable plan/export shape first; issue publishing can
  remain a later helper if demand is proven.

## Key Product Decisions

- **Use `fw:decision`, not `fw:adr`, as the command name.** ADR is an output
  shape, but the user-facing job is broader: grill a plan, resolve terminology,
  compare tradeoffs, decide whether an ADR is warranted, and write a durable
  record only when useful. `fw:decision` also reads better for product,
  workflow, and architecture choices that are not strictly architectural.
- **Use `docs/decisions/` as Flywheel's default decision-record convention.**
  The external source uses `docs/adr/`; Flywheel should describe a generic
  downstream-project convention and let the active repo's existing convention
  win. The decision skill should search `docs/decisions/`, `docs/adr/`, root
  ADR/context files, and nearby project docs before choosing where to write.
- **Keep context and decision artifacts separate.** Context/glossary docs
  explain project language and relationships. Decision records explain why a
  material choice was made and what alternatives were rejected.
- **Standardize on spec as the canonical artifact term.** Treat PRD as an
  accepted user synonym for product-facing work, but write Flywheel guidance in
  terms of specs, spec packets, decisions, and plans. `fw:brainstorm` can
  synthesize a spec packet when the user asks for a spec, PRD, product
  requirements, or issue-ready requirements; `fw:plan` can export vertical
  issue slices when requested. Both should still hand off to `fw:work` through
  the reviewed-plan gate.
- **Reduce hooks before adding more hook prompts.** Skills should carry
  workflow guidance. Hooks should enforce risky edges and configured local
  policy only.

## Document Review Findings

Review mode: `fw:document-review` style serial pass using coherence,
feasibility, document-simplicity, scope-guardian, and adversarial-document
lenses.

- **Resolved P1:** Unit 7 originally said to remove `Stop` from default
  installs. That was too absolute because the current Stop hook can hard-block
  incomplete completion claims with dirty files. Unit 7 now requires an
  event-by-event enforcement audit: keep hard-blocking safety boundaries,
  remove lifecycle coaching, and split optional diagnostics from required
  guardrails.
- **Resolved P2:** Unit 3 originally made `AGENTS.md` convention updates
  optional. This plan introduces new decision/context conventions and must
  preserve the existing rule that Flywheel skills describe downstream software
  projects generally. Unit 3 now explicitly updates `AGENTS.md`.
- **Residual scope risk:** The plan is intentionally broad because it covers
  all missing simplification requirements. Execute it as vertical units and
  avoid batching unrelated units into one undifferentiated change. Unit 9 is the
  only justified final reconciliation sweep.

## Context & Repo Truth

- `skills/shape/SKILL.md` currently routes between `ideate`, `brainstorm`,
  `plan`, and `deepen`; it has no decision checkpoint and no decision helper.
- `skills/start/SKILL.md` lists many helper surfaces but no `decision`,
  `context`, spec, or issue-slice route.
- `skills/plan/SKILL.md` already requires vertical behavior slices, TDD
  posture, red/green signals, execution mode, document review, and an approval
  gate before `fw:work`.
- `skills/work/SKILL.md` already loads TDD for `Test posture: tdd` units and
  rejects horizontal plan batches, but it still carries a large amount of
  execution doctrine that can move to activation-time references.
- `skills/test-driven-development/SKILL.md` already matches the required TDD
  posture: public behavior, one executable test case at a time, red before
  implementation, green, refactor, repeat.
- At plan start, `hooks/hooks.json` and `scripts/codex-refresh-local.sh`
  installed SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, and
  Codex PermissionRequest hooks by default. Unit 7 changed the default
  guardrail set to PreToolUse plus Stop, with Codex also installing
  PermissionRequest.
- At plan start, `scripts/flywheel-doctor.js` expected all lifecycle hook
  events. Unit 7 updated doctor expectations to the reduced guardrail set.
- `evals/fw-shape/`, `evals/flywheel/`, `evals/fw-plan/`, `evals/fw-work/`,
  and `evals/fw-test-driven-development/` cover route and TDD behavior, but
  no suite covers direct decision behavior, context/glossary capture, shape
  decision checkpointing, or issue-slice export.

## Testing Strategy

This repo's primary regression surface is the eval harness under `evals/` plus
the hook policy tests in `scripts/flywheel-hook-policy.test.js`.

Use `tdd` for user-facing stage behavior and hook behavior:

- add or update the eval case first
- validate that the new case fails against the current instructions or scripts
- make the smallest skill/script/doc change that turns the case green
- refactor only while the targeted suite stays green

Use `no-new-tests` only for pure docs convention updates that do not change
runtime routing or command behavior, and still validate `node
scripts/flywheel-eval.js validate`.

Broad validation target:

- `node scripts/flywheel-hook-policy.test.js`
- `node scripts/flywheel-eval.js validate`
- `make verify`

## Implementation Units

- [x] **Unit 1: Add direct decision grilling and artifact formats**

**Vertical slice:** A user can directly invoke `fw:decision` for a material
software-project decision and receive repo-grounded grilling, one recommended
question at a time, plus a durable decision/context write only when warranted.

**Requirements:** R4, R8-R12, R13-R17, R33, R35-R36

**Dependencies:** None

**Execution mode:** `serial` -- This introduces the first-class helper and the
artifact contracts that later shape integrations will load.

**Files:**
- Add: `skills/decision/SKILL.md`
- Add: `skills/decision/agents/openai.yaml`
- Add: `skills/decision/references/decision-record-format.md`
- Add: `skills/decision/references/context-format.md`
- Add: `evals/fw-decision/manifest.json`
- Add: `evals/fw-decision/cases.jsonl`
- Add: `evals/fw-decision/rubric.md`
- Modify: `evals/README.md`
- Modify as needed: `scripts/flywheel-doctor.js`

**Test posture:** `tdd` -- This is new visible product behavior with a direct
skill surface and artifact contract.

**Approach:**
- Keep the main `SKILL.md` compact: purpose, activation, repo exploration,
  decision dependency order, one-question interaction, artifact write policy,
  and handoff.
- Put detailed decision-record format and context/glossary format in separate
  references loaded only when the skill is reading or writing those artifacts.
- Search the active repo for existing conventions before writing: root
  `CONTEXT.md`, `CONTEXT-MAP.md`, `docs/context/`, `docs/decisions/`,
  `docs/adr/`, relevant package docs, `AGENTS.md`, and current plans/specs.
- For downstream projects, describe artifacts generically: source, tests,
  docs, configs, migrations, APIs, workflows, context docs, and decision
  records. Avoid Flywheel-specific examples unless the active repo is Flywheel.
- Only offer an ADR/decision record when the choice is hard to reverse,
  surprising without context, and based on a real tradeoff.
- Prefer small records. Required fields should be status, context, decision,
  rejected alternatives when useful, consequences when useful, evidence, and
  review questions.
- Capture context/glossary terms lazily when terminology is resolved and
  future work would benefit.

**Patterns to follow:**
- `skills/research/SKILL.md` for a direct helper that stays out of the visible
  backbone.
- `skills/references/host-interaction-contract.md` for one-question behavior.
- `skills/document-review/SKILL.md` for direct design-artifact review posture.

**Test scenarios:**
- Direct `fw:decision` on a tradeoff-heavy plan inspects existing docs/code
  language before asking the user.
- Direct `fw:decision` asks one material question with a recommended answer
  instead of dumping a questionnaire.
- Direct `fw:decision` records no ADR for an easy, obvious, reversible choice.
- Direct `fw:decision` creates or updates a context/glossary artifact only when
  terminology is resolved and domain-specific.
- Direct `fw:decision` surfaces contradictions between user terms, existing
  docs, and code behavior.

**Red signal:** `evals/fw-decision` fails because no direct decision skill or
decision/context artifact contract exists.

**Green signal:** `evals/fw-decision` validates structurally and live grading
can pass direct decision cases without loading all reference detail by default.

**Verification:**
- `node scripts/flywheel-eval.js validate fw-decision`
- `node scripts/flywheel-eval.js validate`

- [x] **Unit 2: Add the shape decision checkpoint**

**Vertical slice:** A user can run `fw:shape` on a material feature or workflow
change and receive a lightweight decision checkpoint before handoff; when the
checkpoint finds a durable decision or terminology conflict, it routes into
`fw:decision`.

**Requirements:** R5-R7, R9-R12, R17, R34, R37

**Dependencies:** Unit 1

**Execution mode:** `serial` -- This changes the primary shape-stage closeout
and depends on the direct decision helper.

**Files:**
- Modify: `skills/shape/SKILL.md`
- Modify: `skills/brainstorm/references/handoff.md`
- Modify: `skills/plan/references/plan-handoff.md`
- Modify: `skills/deepen/SKILL.md`
- Modify: `evals/fw-shape/cases.jsonl`
- Modify: `evals/fw-shape/rubric.md`
- Modify: `evals/flywheel/cases.jsonl`
- Modify: `evals/flywheel/rubric.md`

**Test posture:** `tdd` -- Shape routing and handoff behavior are externally
visible contracts.

**Approach:**
- Add a short `Decision Checkpoint` section to `shape`: name decision surfaces,
  decide whether a record is needed, and keep the cheap path explicit.
- Do not load `decision` for every shaping pass. Load it only when the pass
  contains a hard-to-reverse, surprising, tradeoff-heavy, architecture,
  workflow-contract, or product-scope decision, or when terminology conflicts
  affect the spec or plan.
- Update brainstorm, plan, and deepen handoffs so they report whether the
  checkpoint found "no durable decision record needed", "decision skill
  required", or "decision/context artifact updated".
- Preserve the existing plan-review and plan-to-work approval gates.

**Patterns to follow:**
- `skills/references/workflow-gates.md` for handoff fields.
- Existing `fw-shape` cases for mode selection without broad repo scans.

**Test scenarios:**
- A simple typo/config shaping pass closes with no ADR needed and no extra
  decision route.
- A material workflow-contract change triggers `fw:decision` before shape
  claims `Shape-Ready`.
- A requirements doc with ambiguous domain terms surfaces the conflict before
  planning.
- Shape still selects the correct core mode: ideate, brainstorm, plan, or
  deepen.

**Red signal:** `evals/fw-shape` fails because shape has no decision
checkpoint and cannot route to a decision helper.

**Green signal:** `fw-shape` and root `flywheel` cases pass with the checkpoint
visible and the core routing behavior unchanged.

**Verification:**
- `node scripts/flywheel-eval.js validate fw-shape`
- `node scripts/flywheel-eval.js validate flywheel`

- [x] **Unit 3: Route and document decision/context conventions**

**Vertical slice:** A user can discover `fw:decision` through `fw:start`,
README/setup docs, and repo conventions; downstream projects get neutral
decision/context guidance that is not limited to authoring Flywheel skills.

**Requirements:** R4, R13-R16, R33-R36

**Dependencies:** Unit 1

**Execution mode:** `parallel-ready` -- After Unit 1 establishes the helper,
this route/docs slice can proceed independently from deeper stage integration.

**Files:**
- Modify: `skills/start/SKILL.md`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `docs/setup/compatibility.md`
- Modify: `docs/setup/troubleshooting.md`
- Modify: `.codex-plugin/plugin.json` if helper prompts are listed there
- Modify: `.claude-plugin/plugin.json` if helper prompts are listed there
- Modify: `.agents/plugins/marketplace.json` if command discovery metadata is
  duplicated there
- Modify: `evals/flywheel/cases.jsonl`
- Modify: `evals/flywheel/rubric.md`

**Test posture:** `tdd` -- Router discovery is user-facing behavior covered by
evals.

**Approach:**
- Add `fw:decision` as a helper/alternate-entry surface, not a new visible
  backbone stage.
- Teach `start` to route direct requests for ADRs, decision records,
  spec-grilling, terminology conflicts, and design-decision review to
  `decision`.
- Update docs to describe defaults and active-repo override order:
  use existing project conventions first, otherwise prefer project context docs
  and decision records under a clear docs surface.
- Add or update AGENTS repository guidance for `docs/context/` and
  `docs/decisions/` while preserving the rule that skill guidance should target
  downstream software projects generally, not only Flywheel skill authoring.
- Keep AGENTS guidance explicit that Flywheel-authored skills should focus on
  downstream software projects. Mention Flywheel-specific paths only in the
  repository-maintenance sections.

**Patterns to follow:**
- `skills/start/SKILL.md` helper-surface list.
- `docs/setup/compatibility.md` host-compatibility table.
- Existing AGENTS docs conventions for brainstorms, research, plans, setup,
  and solutions.

**Test scenarios:**
- `fw:start` routes "write an ADR for this API boundary decision" to
  `fw:decision`.
- `fw:start` routes "grill this plan against domain language" to
  `fw:decision` or `fw:shape` with a decision checkpoint, depending on whether
  the user asked direct decision review or full shaping.
- README documents decision/context support without presenting it as mandatory
  ceremony.

**Red signal:** Root-router evals fail because `fw:decision` is not a known
helper and direct ADR/spec-grill requests are routed to generic planning.

**Green signal:** Router and docs cases pass while the visible backbone remains
`shape -> work -> review -> optional spin -> commit`.

**Verification:**
- `node scripts/flywheel-eval.js validate flywheel`
- `node scripts/flywheel-eval.js validate`

- [x] **Unit 4: Make planning and architecture helpers context-aware**

**Vertical slice:** A downstream project with existing context and decision
records can run planning, document review, architecture strategy, or pattern
recognition and have those artifacts influence questions, decisions, and
implementation units without re-litigating settled choices.

**Requirements:** R8-R17, R19-R21, R33-R37

**Dependencies:** Units 1-3

**Execution mode:** `parallel-ready` -- The affected helper surfaces are
separate files and suites, but execution should split by non-overlapping eval
and skill files if parallelized.

**Files:**
- Modify: `skills/plan/SKILL.md`
- Modify: `skills/deepen/SKILL.md`
- Modify: `skills/document-review/SKILL.md`
- Modify: `skills/architecture-strategy/SKILL.md`
- Modify: `skills/pattern-recognition/SKILL.md`
- Modify: `skills/debug/SKILL.md`
- Modify: `skills/test-driven-development/SKILL.md` only if it needs a
  shorter reference to the new context/decision conventions
- Modify: `evals/fw-plan/cases.jsonl`
- Modify: `evals/document-review/cases.jsonl`
- Modify: `evals/architecture-strategy/cases.jsonl`
- Modify: `evals/pattern-recognition/cases.jsonl`
- Modify as needed: corresponding rubrics

**Test posture:** `tdd` -- These helpers produce externally visible advice and
plans.

**Approach:**
- Add a compact "decision/context lookup" rule to planning and architecture
  surfaces: search existing context and decisions when the work is domain,
  boundary, architecture, workflow-contract, or terminology bearing.
- Keep lookup conditional. Do not add broad context searches to trivial
  execution or docs-only tasks.
- When a planned approach contradicts a decision record, surface the conflict
  and either route to `fw:decision` or mark an explicit "reopen decision"
  planning question.
- When terms conflict between user language and context docs, surface the
  conflict before finalizing specs, plans, or architecture advice.
- Keep vertical implementation units as the planning unit boundary. Existing
  vertical TDD requirements remain the execution contract.

**Patterns to follow:**
- `skills/plan/SKILL.md` reference loading map.
- `skills/references/architecture-code-quality/activation-heuristics.md`.
- Existing TDD context language in `skills/test-driven-development/SKILL.md`.

**Test scenarios:**
- A plan for a bounded-context/API change reads existing decision records and
  carries their constraints into implementation units.
- A plan that contradicts an existing decision record marks the conflict as an
  open decision instead of silently overwriting it.
- Architecture strategy does not re-suggest an explicitly rejected boundary
  without explaining why the ADR should be reopened.
- Document review treats missing decision/context evidence as a finding when
  the document makes durable architecture or product-scope claims.

**Red signal:** Updated eval cases fail because current helpers either ignore
context/decision docs or bury conflicts in generic advice.

**Green signal:** The affected eval suites pass with context-aware behavior and
without loading decision reference detail for unrelated tasks.

**Verification:**
- `node scripts/flywheel-eval.js validate fw-plan`
- `node scripts/flywheel-eval.js validate document-review`
- `node scripts/flywheel-eval.js validate architecture-strategy`
- `node scripts/flywheel-eval.js validate pattern-recognition`

- [x] **Unit 5: Fold spec packets and issue-slice export into shaping**

**Vertical slice:** A user can ask Flywheel to turn current conversation or
requirements context into a spec packet, then break that accepted artifact into
independently grabbable vertical slices without creating a new mandatory
workflow stage.

**Requirements:** R19-R21, R26-R29, R33-R37

**Dependencies:** Units 1-4

**Execution mode:** `parallel-ready` -- Spec-packet behavior lives mainly in
brainstorm, while issue-slice export lives mainly in plan.

**Files:**
- Modify: `skills/brainstorm/SKILL.md`
- Add: `skills/brainstorm/references/spec-packet.md`
- Modify: `skills/plan/SKILL.md`
- Add: `skills/plan/references/issue-slice-export.md`
- Modify: `evals/fw-brainstorm/cases.jsonl`
- Modify: `evals/fw-plan/cases.jsonl`
- Modify as needed: `evals/fw-brainstorm/rubric.md`
- Modify as needed: `evals/fw-plan/rubric.md`

**Test posture:** `tdd` -- This changes visible shaping outputs and optional
planning exports.

**Approach:**
- Add optional spec-packet output to brainstorm when the user asks for a spec,
  PRD, product requirements, issue-ready requirements, or a synthesis from the
  current conversation. Use `spec` in Flywheel-authored output unless quoting or
  directly responding to the user's PRD wording.
- Do not interview when the user's instruction is explicitly "turn current
  context into a spec" or "turn current context into a PRD" and enough context
  exists. Ask only when a missing answer would change scope or correctness.
- Include problem, solution, user stories or workflows when useful,
  implementation decisions, testing decisions, out-of-scope, and further notes.
  Keep file paths out of spec-packet output unless it is explicitly a technical
  plan.
- Add an optional issue-slice export reference to plan. Each exported slice
  should be a tracer bullet with title, type (`AFK` or `HITL`), dependencies,
  user stories or requirements covered, acceptance criteria, and "what to
  build" described as end-to-end behavior.
- Keep actual issue publishing deferred. The first pass should produce
  issue-ready text and dependency order without depending on `gh`, Linear,
  Jira, or repo-specific label configuration.

**Patterns to follow:**
- `skills/brainstorm/references/requirements-capture.md`.
- `skills/plan/references/unit-examples.md`.
- Existing vertical-slice eval cases in `evals/fw-plan/cases.jsonl`.

**Test scenarios:**
- `fw:brainstorm` can synthesize a spec packet from existing conversation
  context without over-questioning, even when the user calls it a PRD.
- `fw:plan` can turn a reviewed requirements/plan artifact into issue-ready
  vertical slices.
- Exported issue slices are vertical, demoable/verifiable, dependency ordered,
  and mark human-interaction needs.
- Horizontal slices such as "all tests" or "all docs" fail rubric checks unless
  marked as justified prerequisites or reconciliation.

**Red signal:** Current brainstorm and plan evals fail spec-packet and
issue-export cases because those output contracts are absent.

**Green signal:** `fw-brainstorm` and `fw-plan` pass with optional spec-packet and
issue-slice behavior while the reviewed-plan gate remains intact.

**Verification:**
- `node scripts/flywheel-eval.js validate fw-brainstorm`
- `node scripts/flywheel-eval.js validate fw-plan`

- [x] **Unit 6: Slim work into a router plus completion gate**

**Vertical slice:** A user can run `fw:work` from a reviewed vertical plan and
see it execute one behavior slice at a time, load TDD at the boundary, route to
specialist helpers only when triggered, and avoid carrying duplicate doctrine
in the always-loaded work skill.

**Requirements:** R25-R29, R33

**Dependencies:** Units 1-5, but the actual text slimming can start after Unit
1 if the new context/decision references are stable.

**Execution mode:** `serial` -- `work` is a central skill and should be changed
carefully after the shaping contracts settle.

**Files:**
- Modify: `skills/work/SKILL.md`
- Modify: `skills/work/references/commit-workflow.md`
- Add as needed: `skills/work/references/execution-router.md`
- Modify: `evals/fw-work/cases.jsonl`
- Modify: `evals/fw-work/rubric.md`
- Modify: `evals/fw-test-driven-development/cases.jsonl` only if contract
  assertions need to be shared

**Test posture:** `tdd` -- Work routing behavior determines how agents execute
behavior changes.

**Approach:**
- Keep `work` responsible for input triage, repo truth, plan-unit mapping,
  task tracking, helper activation, per-slice verification, and handoff.
- Move detailed TDD, browser proof, docs, rollout, observability,
  simplification, and commit guidance into specialist references or skill load
  points.
- Preserve direct execution for trivial and clear small tasks.
- Require `work` to read context/decision artifacts only when the plan or task
  is affected by domain language, architecture, workflow-contract, or durable
  product decisions.
- Keep TDD non-negotiable for behavior-bearing units unless a written exception
  applies.

**Patterns to follow:**
- Current `skills/work/SKILL.md` Phase 1 plan checks.
- `skills/test-driven-development/SKILL.md` for the authoritative TDD loop.
- `skills/references/workflow-gates.md` for completion handoff.

**Test scenarios:**
- Work executes the first vertical slice through TDD before moving to the next.
- Work routes browser-visible proof to `browser-test` only when relevant.
- Work routes runtime-risky changes to observability/rollout surfaces when
  policy or blast radius requires it.
- Work handles a trivial non-behavior edit directly without forcing shaping.
- Work rejects unapproved horizontal plan batches unless justified.

**Red signal:** `fw-work` cases fail because current work guidance is too large
or duplicates specialist behavior instead of routing at activation points.

**Green signal:** `fw-work` and `fw-test-driven-development` cases pass with a
smaller default work skill and the same or stronger vertical TDD behavior.

**Verification:**
- `node scripts/flywheel-eval.js validate fw-work`
- `node scripts/flywheel-eval.js validate fw-test-driven-development`

- [x] **Unit 7: Reduce default hooks to risky-edge guardrails**

**Vertical slice:** A fresh Codex or Claude Flywheel install gets only the
required hook guardrails by default: destructive commands, sensitive writes,
installed-plugin writes, and explicit local commit/push/browser/review policy
gates.

**Requirements:** R1-R3, R33-R34

**Dependencies:** None

**Execution mode:** `serial` -- Hook install scripts, doctor expectations, and
tests must move together or installs will look broken.

**Files:**
- Modify: `hooks/hooks.json`
- Modify: `hooks/flywheel-hook-policy.js`
- Modify: `scripts/flywheel-hook-policy.test.js`
- Modify: `scripts/codex-refresh-local.sh`
- Modify: `scripts/flywheel-doctor.js`
- Modify: `docs/setup/compatibility.md`
- Modify: `docs/setup/troubleshooting.md`
- Modify: `README.md`
- Modify as needed: `evals/flywheel-handoff-gates/cases.jsonl`

**Test posture:** `tdd` -- Hook behavior is executable policy and install
contract.

**Approach:**
- Keep default PreToolUse/PermissionRequest style checks for destructive Bash,
  sensitive writes, installed plugin/cache writes, and configured policy gates.
- Classify each current default event as either required guardrail or optional
  diagnostic. Keep only events that can enforce a real safety boundary in the
  active host.
- Remove SessionStart, UserPromptSubmit, and PostToolUse from default installs
  unless implementation evidence proves they enforce rather than coach.
- Treat Stop separately: keep it only if its hard-blocking incomplete-
  completion behavior is still a required safety boundary after the audit;
  otherwise move it to optional diagnostics.
- Preserve behavior that blocks dangerous operations, sensitive writes,
  installed-plugin writes, incomplete completion claims if retained as a
  safety boundary, or configured local commit/push/browser/review gates.
- Move non-enforcing workflow reminders into opt-in diagnostics or skill
  guidance, not default lifecycle hooks.
- Update doctor checks to expect the reduced event set and to report optional
  diagnostics separately if retained.

**Patterns to follow:**
- Existing sensitive-path and destructive-command tests in
  `scripts/flywheel-hook-policy.test.js`.
- Current install/remove merge logic in `scripts/codex-refresh-local.sh` and
  `scripts/codex-remove-local.sh`.

**Test scenarios:**
- Destructive Bash such as `git reset --hard` is still denied.
- Sensitive writes such as `.env.local` are still denied.
- Writes into installed Flywheel plugin/cache paths are still denied or gated.
- Stop either remains installed with a hard-blocking incomplete-completion test
  or is explicitly moved to optional diagnostics with matching doctor/docs
  updates.
- Default install no longer expects SessionStart/UserPrompt/PostTool/Stop
  workflow reminders unless Stop is retained as an enforceable safety boundary.
- Doctor reports the reduced hook posture as healthy.

**Red signal:** Hook tests and doctor expectations fail because the current
default install still includes lifecycle prompt hooks and expects them.

**Green signal:** Hook policy tests pass and doctor recognizes the reduced
risky-edge hook set.

**Verification:**
- `node scripts/flywheel-hook-policy.test.js`
- `node scripts/flywheel-doctor.js --smoke`

- [x] **Unit 8: Tighten commit publish automation and PR evidence**

**Vertical slice:** A user can run `fw:commit` on a ready branch and Flywheel
commits, pushes, and creates or refreshes the PR by default, stopping only for
real blockers and generating concise PR text from evidence.

**Requirements:** R30-R32

**Dependencies:** Units 1-7 are not hard dependencies, but this should run
after hook reduction so commit/push policy-gate wording is aligned.

**Execution mode:** `parallel-ready` -- Commit skill/evals can be changed
independently after hook policy wording settles.

**Files:**
- Modify: `skills/commit/SKILL.md`
- Modify: `skills/work/references/commit-workflow.md`
- Modify: `skills/commit/references/evidence-bundle.md`
- Modify: `skills/commit/references/pr-body-template.md`
- Modify: `evals/fw-commit/cases.jsonl`
- Modify: `evals/fw-commit/rubric.md`
- Modify as needed: `README.md`

**Test posture:** `tdd` -- Finish-stage behavior is a user-facing workflow
contract.

**Approach:**
- Audit current `commit` behavior first; preserve any existing publish-by-
  default guidance that already matches R30-R32.
- Make local-only an explicit opt-out, not the default.
- Stop only for concrete blockers: unsafe default branch state, failed required
  readiness checks, missing required policy gates, unavailable publish tooling,
  unresolved blocking review findings, missing required browser/runtime proof,
  or user-requested local-only.
- Build PR text from available repo truth: summary, changed files, validation,
  review findings addressed or deferred, monitoring/rollout notes when
  relevant, and remaining risks.
- Keep the prompt count low. Ask only when the answer changes safety or PR
  ownership.

**Patterns to follow:**
- `skills/commit/references/pr-body-template.md`.
- Existing `evals/fw-commit/` cases around branch finishing.
- `skills/work/references/commit-workflow.md` handoff fields.

**Test scenarios:**
- Ready feature branch defaults to commit, push, and PR create/refresh.
- `local-only` suppresses push and PR creation.
- Missing required browser proof blocks browser-visible commit only when local
  policy requires it.
- PR body includes concise testing and monitoring/rollout sections from
  evidence without long raw logs.

**Red signal:** `fw-commit` cases fail where commit behavior over-prompts,
defaults to local-only, or lacks evidence-backed PR text.

**Green signal:** `fw-commit` passes publish-default and blocker-only cases.

**Verification:**
- `node scripts/flywheel-eval.js validate fw-commit`
- `node scripts/flywheel-eval.js validate`

- [x] **Unit 9: Contract sweep and install verification**

**Vertical slice:** A user installing Flywheel after the change gets a coherent
cross-host product: the new helper is discoverable, docs match runtime
behavior, eval suites validate, and hook/install checks agree.

**Requirements:** All

**Dependencies:** Units 1-8

**Execution mode:** `serial` -- This is a final reconciliation unit justified
because it checks cross-surface consistency after all behavior slices land.

**Files:**
- Modify as needed: `README.md`
- Modify as needed: `docs/setup/compatibility.md`
- Modify as needed: `docs/setup/troubleshooting.md`
- Modify as needed: `.codex-plugin/plugin.json`
- Modify as needed: `.claude-plugin/plugin.json`
- Modify as needed: `.agents/plugins/marketplace.json`
- Modify as needed: `scripts/flywheel-doctor.js`
- Modify as needed: `evals/README.md`

**Test posture:** `no-new-tests` -- This is a final contract sweep over
surfaces already covered by prior units. New behavior discovered here should
move back into the relevant unit with tests.

**Approach:**
- Sweep public command references and visible helper lists.
- Validate all skill descriptions stay within the doctor-enforced context
  budget.
- Confirm docs describe downstream software-project usage generally.
- Confirm cross-host syntax remains namespaced: `$fw:<stage>` for Codex and
  `/fw:<stage>` for Claude Code.
- Run broad validation and fix only issues caused by this plan's changes.

**Patterns to follow:**
- AGENTS "Skill File Conventions" and "Writing Style".
- Existing broad validation path in `Makefile`.

**Test scenarios:**
- No stale docs claim lifecycle hooks are installed by default after Unit 7.
- No public doc uses `fw:adr` if the implemented command is `fw:decision`.
- No new helper uses unnamespaced command examples.
- No skill guidance frames downstream project work as Flywheel skill authoring.

**Red signal:** `make verify` or docs/eval validation fails after all behavior
units are integrated.

**Green signal:** Broad verification passes and `git status --short` shows only
intended tracked changes.

**Verification:**
- `make verify`

## Dependency Order

```text
Unit 1 decision helper
  -> Unit 2 shape checkpoint
  -> Unit 4 context-aware planning/helpers
  -> Unit 5 spec packet and issue-slice export
  -> Unit 6 work slimming

Unit 1 decision helper
  -> Unit 3 router/docs conventions

Unit 7 hook reduction
  -> Unit 8 commit publish automation wording

Units 1-8
  -> Unit 9 contract sweep
```

Unit 7 can run before or alongside Units 1-6 because hook policy is mostly
independent. Unit 8 should wait until Unit 7 settles the reduced hook/policy
language.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Decision capture becomes new ceremony | Make the shape checkpoint cheap and require all ADR criteria before writing durable records. |
| `fw:decision` becomes too large to load | Keep the main skill compact and move decision/context formats into references. |
| Context docs drift into implementation mechanics | Encode the domain-facing rule in `context-format.md` and eval against implementation-detail glossary entries. |
| External issue-tracker behavior balloons scope | Produce issue-ready vertical slice text first; defer publishing/integration. |
| Hook reduction removes useful safety | Keep executable risky-edge and configured policy gates; remove only lifecycle coaching. |
| Work slimming weakens execution quality | Treat TDD, browser proof, observability, rollout, and docs as specialist activation points with eval coverage. |
| Docs become Flywheel-internal | Review public skill text against AGENTS guidance: downstream software projects first, Flywheel paths only for this repo. |

## Deferred Work

- A dedicated issue-tracker setup or publishing helper for GitHub, GitLab,
  Linear, Jira, or local markdown issue files.
- A direct `fw:spec` or `fw:prd` command. First pass should prove spec-packet
  behavior inside `fw:brainstorm`, with PRD treated as a product-facing synonym
  rather than Flywheel's canonical term.
- Automatic ADR numbering migration between `docs/adr/` and
  `docs/decisions/`. The decision skill should respect the active repo's
  existing convention.
- Live eval runs against both Codex and Claude after deterministic suite
  validation passes.

## Execution Handoff

Implementation completed on branch `feat/decision-context-shaping`.

Validation evidence:

- `node scripts/flywheel-eval.js validate`
- `node scripts/flywheel-hook-policy.test.js`
- `node scripts/flywheel-doctor.js --smoke`

Next stage: `fw:review`.
