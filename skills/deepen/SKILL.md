---
name: deepen
description: "Strengthen an existing plan. Use to add repo research, test posture, rollout shape, or detail before implementation."
metadata:
  argument-hint: "[plan path, or blank to use the latest plan]"
---

# Deepen

`$fw:deepen` is the plan-strengthening path.

Use it when a plan already exists but needs a more rigorous pass before
implementation starts.

This skill improves the plan. It does not implement the work. The result should
return the plan to a reviewed state so the user can deliberately choose whether
to deepen again or start implementation.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Call the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When the deepen pass spans multiple material steps, use the host task-tracking
tool named in `../references/host-interaction-contract.md` to create and
maintain a short task list.

## Workflow

### Phase 0: Resolve The Target Plan

- If a plan path is provided, use it.
- If blank, find the most recent plausible plan in `docs/plans/`.
- If multiple candidates are equally plausible, ask which one to deepen.

### Phase 1: Read The Plan And Source Artifacts

- read the full plan
- read any linked requirements or brainstorm document
- preserve completed checkboxes and existing decisions unless repo truth proves
  they should change

### Phase 2: Run A Structured Review Pass

Use `document-review` on the plan, preferably in headless mode when the host
supports it.

Use the findings to build a strengthen queue around:

- coherence
- feasibility
- scope discipline
- document simplicity
- observability and supportability
- security, when applicable

### Phase 3: Touch Grass

Before rewriting the plan:

- inspect the relevant repo areas
- inspect `AGENTS.md`, `CLAUDE.md`, and nearby manifests
- inspect the active repo's `docs/solutions/` for prior learnings
- confirm likely file paths, tests, patterns, and validation surfaces

When the plan changes runtime behavior or blast radius, load `$fw:observability`
concepts and tighten the readiness, rollout, and validation shape.

### Phase 4: Strengthen The Plan In Place

Update the plan so it is materially easier to execute:

- sharpen file paths and pattern references
- tighten implementation units
- improve test posture and scenario completeness
- add or clarify verification signals
- simplify over-engineered plan structure where the work does not need it
- make deferred questions explicit instead of leaving them implicit

### Phase 5: Re-Review The Updated Plan

After the plan is strengthened, rerun `document-review` on the updated plan,
preferably in headless mode when the host supports it.

Use that pass to confirm whether the plan is now clean enough for execution or
whether another deepen pass is still warranted.

### Phase 6: Report

Return:

1. **Plan deepened**
2. **Main gaps fixed**
3. **Residual review findings or open questions**
4. **Next move choice** — call the exact host question tool named in the host
   interaction contract when it is available and ask whether the user is happy
   with the strengthened plan as the basis for implementation. Use a compact
   choice surface such as:
   - **Start `$fw:work` now** — confirms the strengthened plan is accepted for
     implementation
   - **Deepen again** — run another strengthening pass before execution
   - **Done for now** — pause with the plan saved

Do not begin `$fw:work` from a deepened plan until the user selects the
work-start option or gives an explicit same-turn implementation instruction.
