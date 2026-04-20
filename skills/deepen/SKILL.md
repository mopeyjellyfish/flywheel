---
name: deepen
description: "Strengthen an existing Flywheel plan with targeted repo research, document-review findings, sharper test posture, and better rollout or observability shape. Use when a plan exists and the goal is to make it more execution-ready without starting implementation."
metadata:
  argument-hint: "[plan path, or blank to use the latest plan]"
---

# Deepen

`$flywheel:deepen` is the plan-strengthening path.

Use it when a plan already exists but needs a more rigorous pass before
implementation starts.

This skill improves the plan. It does not implement the work.

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

When the plan changes runtime behavior or blast radius, load `$flywheel:observability`
concepts and tighten the readiness, rollout, and validation shape.

### Phase 4: Strengthen The Plan In Place

Update the plan so it is materially easier to execute:

- sharpen file paths and pattern references
- tighten implementation units
- improve test posture and scenario completeness
- add or clarify verification signals
- simplify over-engineered plan structure where the work does not need it
- make deferred questions explicit instead of leaving them implicit

### Phase 5: Report

Return:

1. **Plan deepened**
2. **Main gaps fixed**
3. **Remaining open questions**
4. **Recommended next move** — usually `$flywheel:work`
