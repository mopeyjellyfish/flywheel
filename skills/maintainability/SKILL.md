---
name: maintainability
description: "Assess future edit cost. Use when wrappers, helpers, naming, cohesion, or ownership may make changes harder."
metadata:
  argument-hint: "[feature, path, diff, or maintainability concern]"
---

# Maintainability

Use this helper when the main question is future edit cost.

`$fw:maintainability` is for structure, locality, naming, and coupling.
It is not a generic style checker.

**When directly invoked, always do maintainability work.** Ground the current
repo shape, identify concrete friction, and recommend the minimum structure
that keeps later changes understandable.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Call the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

## Input

<maintainability_input> #$ARGUMENTS </maintainability_input>

If blank, inspect the repo for the most obvious maintainability pressure points
near the target area first.

## Reference Loading Map

- Read `../references/architecture-code-quality/activation-heuristics.md` when
  deciding whether this helper is a better fit than `simplify` or
  `architecture-strategy`.
- Read `../references/architecture-code-quality/output-contract.md` when
  preparing the final brief.

## Core Principles

1. **Future edit cost is the metric** - recommend changes only when they make
   later modification safer or clearer.
2. **Locality beats needless reuse** - keep logic near its owner until a real
   second use or shared boundary appears.
3. **Names and file placement carry architecture** - unclear ownership is a
   maintainability issue, not mere taste.
4. **Cohesion matters more than abstraction count** - helpers should exist to
   reduce friction, not to hide it.
5. **Do not widen scope casually** - stay near the changed surface unless a
   broader structural change is truly required.

## Workflow

### Phase 1: Ground Current Structure

Inspect:

- ownership and file placement
- naming and module boundaries
- helper or wrapper layers
- duplicate or parallel control flow
- tests that reveal likely future edit paths

### Phase 2: Identify Real Friction

Call out concrete maintainability risks such as:

- unclear ownership
- duplicated behavior that must stay in sync
- coupling across unrelated modules
- helper extraction that made the main path harder to follow
- naming that hides intent or domain meaning

### Phase 3: Recommend The Smallest Useful Cleanup

Prefer:

- keeping logic local
- collapsing unnecessary wrappers
- clarifying names or ownership
- extracting only the helper that clearly reduces repetition or boundary noise

## Output Contract

Return a concise maintainability brief:

1. **Current truth** — how the repo currently structures this area
2. **Main maintainability risks** — concrete future-edit costs
3. **Recommendation** — the smallest structural change that helps
4. **What not to add** — abstractions or moves that would increase carrying cost
5. **Verification hooks** — tests, review angles, or follow-up checks
6. **Next move** — which Flywheel stage should act on the guidance
