---
name: deepen
description: "Grill and strengthen an existing plan. Use to align source docs, decisions, vertical slices, tests, and rollout before work."
metadata:
  argument-hint: "[plan path, or blank to use the latest plan]"
---

# Deepen

`$fw:deepen` is the docs-backed plan-grilling and strengthening path.

Use it when a plan already exists but needs a more rigorous pass before
implementation starts.

This skill improves shared understanding of the plan, not just the prose. It
does not implement the work. The result should return the plan to a reviewed
state where the source spec, terminology, decisions, vertical slices, testing
posture, and rollout or support shape are explicit enough for the user to
deliberately choose whether to deepen again or start implementation.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Call the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When the deepen pass spans multiple material steps, use the host task-tracking
tool named in `../references/host-interaction-contract.md` to create and
maintain a short task list.

Ask one material question at a time. Include the recommended answer when the
answer space is predictable. If repo truth, source docs, tests, context docs,
decision records, or `docs/solutions/` can answer the question, inspect those
first instead of asking the user.

Do not stop after one broad question when the plan still has material ambiguity.
Resolve the next dependency, update the relevant artifact, then continue until
the plan-grilling completion bar is met, the user explicitly pauses, or the
remaining blockers are recorded as open questions.

## Reference Loading Map

Do not preload every support file. Load only what the current pass needs:

- Read `references/plan-grilling.md` after the target plan and source artifacts
  are identified. It defines the interactive, docs-backed grilling loop.
- Read `../plan/references/deepening-workflow.md` when scoring confidence gaps,
  strengthening plan sections, or reusing the plan confidence-check mechanics.
- Read `../brainstorm/references/spec-grilling.md` when the source artifact is
  a requirements doc, spec packet, PRD synonym, or design doc whose terminology,
  scenarios, or acceptance criteria may conflict with the plan.
- Read `../decision/SKILL.md` when terminology, context, ADR, product-scope,
  architecture, or workflow-contract conflicts must be resolved before work.
- Read `../decision/references/context-format.md` only when updating or
  creating project context, glossary, or bounded-context docs.
- Read `../decision/references/decision-record-format.md` only when updating or
  creating a durable decision record.
- Read `../spin/SKILL.md` only after the plan is re-reviewed and a resolved,
  reusable repo lesson or user correction is worth capturing in
  `docs/solutions/`.

## Workflow

### Phase 0: Resolve The Target Plan

- If a plan path is provided, use it.
- If blank, find the most recent plausible plan in `docs/plans/`.
- If multiple candidates are equally plausible, ask which one to deepen.

### Phase 1: Read The Plan And Source Artifacts

- read the full plan
- read any linked origin, requirements, spec, brainstorm, design, issue, or
  review document
- identify whether the source artifact defines a spec-like "what should be
  true" contract: problem, outcome, users or actors, workflows, decisions,
  acceptance criteria, out-of-scope, and open questions
- search existing context and decision records when the plan is domain,
  terminology, architecture, workflow-contract, or product-scope bearing
- search `docs/solutions/` frontmatter and titles for active prior learnings
  that match the plan area, touched files, module, problem type, or workflow
  contract; follow `superseded_by` before reading full docs
- preserve completed checkboxes and existing decisions unless repo truth proves
  they should change

### Phase 2: Run A Structured Review And Grilling Pass

Use `document-review` on the plan, preferably in headless mode when the host
supports it.

Read `references/plan-grilling.md` and use the review findings plus the plan
confidence-check scoring from `../plan/references/deepening-workflow.md` to
build a strengthen-and-grill queue around:

- source spec or origin alignment
- terminology, actors, states, and relationships
- coherence
- feasibility
- scope discipline
- vertical implementation slices
- test posture, red/green proof points, and public-contract coverage
- document simplicity
- context, decision, and ADR needs
- observability and supportability
- security, when applicable

Resolve queue items in dependency order. For each item:

1. inspect repo truth and existing docs before asking
2. surface contradictions immediately
3. stress-test ambiguous boundaries with a concrete scenario
4. ask exactly one material user question only when the answer cannot be
   responsibly inferred
5. update the plan, context, or decision artifact as soon as the answer is
   resolved
6. continue to the next material gap

If the source spec and plan disagree, do not silently choose one. Record the
conflict in the plan, ask the next material question, or route to
`../decision/SKILL.md` when the conflict is a durable terminology, scope,
workflow-contract, architecture, or product decision.

### Phase 3: Touch Grass

Before rewriting the plan:

- inspect the relevant repo areas
- inspect `AGENTS.md`, `CLAUDE.md`, and nearby manifests
- inspect the active repo's `docs/solutions/` for prior learnings
- inspect the source spec or requirements document for acceptance criteria,
  explicit non-goals, and open questions that the plan must not invent around
- inspect matching context/glossary docs and decision records before changing
  terminology, boundaries, workflow contracts, or product-scope decisions
- confirm likely file paths, tests, patterns, and validation surfaces

When the plan changes runtime behavior or blast radius, load `$fw:observability`
concepts and tighten the readiness, rollout, and validation shape.

### Phase 4: Strengthen The Plan In Place

Update the plan so it is materially easier to execute:

- align every meaningful source spec or requirements item with plan scope,
  implementation units, test posture, and acceptance evidence
- remove unapproved scope or mark it as an explicit open decision
- convert horizontal implementation chunks into vertical behavior slices unless
  they are true prerequisites, mechanical sweeps, or final reconciliation work
  with a stated exception
- sharpen file paths and pattern references
- tighten implementation units
- improve test posture and scenario completeness
- add concrete red and green proof points for TDD-appropriate slices
- add or clarify verification signals
- simplify over-engineered plan structure where the work does not need it
- make deferred questions explicit instead of leaving them implicit
- surface contradictions with existing context or decision records as open
  decisions, or load `../decision/SKILL.md` when the conflict must be resolved
  before work

If resolved terminology belongs in durable project language, update the smallest
matching context artifact through the decision helper and keep implementation
mechanics out of that context doc.

If a decision record is warranted, apply the decision helper's three-part test:
hard to reverse, surprising without context, and the result of a real tradeoff.
Skip ADR ceremony for obvious, reversible, local, or stylistic choices.

### Phase 5: Re-Review The Updated Plan

After the plan is strengthened, rerun `document-review` on the updated plan,
preferably in headless mode when the host supports it.

Use that pass to confirm whether the plan is now clean enough for execution or
whether another deepen pass is still warranted.

If the deepening session revealed a resolved, reusable repo lesson or durable
user correction that future planning should inherit, offer `$fw:spin` after the
review result. Do not spin unresolved guesses, ordinary plan content, or
implementation notes.

### Phase 6: Report

Return:

1. **Plan deepened**
2. **What was grilled** — source/spec alignment, terminology, vertical slices,
   tests, rollout/support, or decision surfaces
3. **Main gaps fixed**
4. **Residual review findings or open questions**
5. **Docs checkpoint** — prior `docs/solutions/` used, no durable record
   needed, context/decision artifact updated, `fw:decision` still required, or
   optional `fw:spin` offered for a resolved reusable lesson
6. **Next move choice** — call the exact host question tool named in the host
   interaction contract when it is available and ask whether the user is happy
   with the strengthened plan as the basis for implementation. Use a compact
   choice surface such as:
   - **Start `$fw:work` now** — confirms the strengthened plan is accepted for
     implementation
   - **Deepen again** — run another strengthening pass before execution
   - **Done for now** — pause with the plan saved

Do not begin `$fw:work` from a deepened plan until the user selects the
work-start option or gives an explicit same-turn implementation instruction.
