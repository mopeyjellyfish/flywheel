---
name: pattern-recognition
description: "Map problem symptoms to existing repo patterns or justified named patterns such as DTO, repository, ports/adapters, builder, DDD, or distributed reliability patterns. Use when the work needs a grounded answer to 'should we use this pattern here?'"
metadata:
  argument-hint: "[feature, path, diff, or pattern question]"
---

# Pattern Recognition

Use this helper when the main question is pattern fit.

`$fw:pattern-recognition` should identify what the repo already does,
which named patterns fit the actual problem, and when a simpler local design is
better.

**When directly invoked, always do pattern-recognition work.** Do not answer
with a generic pattern encyclopedia. Ground the repo and the current change.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Use the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When more than one viable pattern posture exists:

- present 2-4 predicted options at most
- put the recommended option first
- keep differences concrete
- rely on the host's native freeform final path when it exists

## Input

<pattern_input> #$ARGUMENTS </pattern_input>

If blank, inspect the repo for the strongest existing pattern families first.

## Reference Loading Map

- Read `../references/architecture-code-quality/activation-heuristics.md` when
  deciding whether the question is really about patterns instead of boundaries
  or cleanup.
- Read `../references/architecture-code-quality/pattern-families.md` when
  matching the problem to named patterns or anti-patterns.
- Read `../references/architecture-code-quality/output-contract.md` when
  preparing the final brief.

## Core Principles

1. **Reuse before inventing** - existing repo patterns outrank imported pattern
   doctrine.
2. **Patterns solve symptoms, not vibes** - name the seam, invariant, or
   failure mode before naming the pattern.
3. **No pattern is a valid outcome** - if a direct local design is better, say
   so plainly.
4. **DTOs, repositories, and ports stop at real boundaries** - do not let them
   leak everywhere.
5. **DDD terms must reflect real invariants** - not renamed CRUD.
6. **Heavier patterns need rejected-alternative analysis** - explain why a
   simpler structure is insufficient.

## Workflow

### Phase 1: Ground Current Truth

Inspect nearby code, tests, docs, and solution entries for:

- current abstractions or helper patterns
- boundary objects or transport mapping
- persistence conventions
- variation patterns such as strategy or factory
- prior simplification or anti-pattern guidance

### Phase 2: Map The Problem To Pattern Families

Clarify the actual symptom:

- external transport seam
- persistence boundary
- construction complexity
- policy variation
- domain invariant
- distributed reliability risk

Then compare the smallest relevant named options only.

### Phase 3: Recommend Reuse, Extend, Or Net-New

Answer:

- which existing repo pattern to reuse
- whether to extend an existing pattern
- whether a net-new named pattern is justified
- why a simpler local design may be better

## Output Contract

Return a concise pattern brief:

1. **Current truth** — nearby repo pattern or absence of one
2. **Problem signal** — the symptom driving the pattern question
3. **Candidate patterns** — viable named patterns plus the no-pattern option
4. **Recommendation** — reuse, extend, net-new, or stay local
5. **Rejected patterns** — what not to add and why
6. **Clean-code constraints** — where DTOs, repositories, adapters, or builders
   should stop
7. **Verification hooks** — tests or review checks that prove the pattern is
   earning its keep
8. **Next move** — which Flywheel stage should carry this forward
