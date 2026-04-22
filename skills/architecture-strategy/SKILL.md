---
name: architecture-strategy
description: "Assess architecture-bearing changes such as bounded contexts, service splits, dependency direction, hexagonal boundaries, and distributed-system posture. Use when the work needs a repo-grounded system-shape recommendation rather than generic clean-architecture advice."
metadata:
  argument-hint: "[feature, boundary question, path, or architecture decision]"
---

# Architecture Strategy

Use this helper when the main question is system shape.

`$flywheel:architecture-strategy` is a support skill. It can be invoked
directly, or pulled into `brainstorm`, `plan`, `work`, or `review` when the
task introduces real boundary or ownership decisions.

**When directly invoked, always do architecture work.** Do not stop at naming
patterns. Ground the repo, compare lighter and heavier options, and recommend
the minimum durable shape that fits the actual problem.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Use the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When multiple viable architecture postures exist:

- present 2-4 predicted options at most
- put the recommended option first
- keep the tradeoffs concrete
- rely on the host's native freeform final path when it exists

## Input

<architecture_input> #$ARGUMENTS </architecture_input>

If blank, inspect the repo for the strongest current architecture seams first.

## Reference Loading Map

Do not load every shared reference by default. Load only what the current phase
needs:

- Read `../references/architecture-code-quality/activation-heuristics.md` when
  deciding whether the task truly warrants this helper.
- Read `../references/architecture-code-quality/pattern-families.md` when
  comparing boundary, style, or distributed-system choices.
- Read `../references/architecture-code-quality/output-contract.md` when
  preparing the final brief.
- Read `../references/architecture-code-quality/frontier-model-prompting.md`
  only when tuning prompt shape or host/model behavior is itself in question.

## Core Principles

1. **Boundaries must earn themselves** - new layers, services, or ports need a
   concrete ownership, deployability, or failure-mode payoff.
2. **Prefer right-sized bounded contexts over tiny services** - split by
   language, invariants, or ownership, not by fashion.
3. **Modular monolith before service sprawl** - independent deployment is not a
   default win.
4. **Dependency direction matters more than pattern labels** - hexagonal
   boundaries should isolate real seams, not wrap internal code ceremonially.
5. **Distributed-system patterns are for real failure boundaries** - idempotency,
   outbox, saga, retry, timeout, or circuit breaker choices should map to
   concrete cross-process risk.
6. **Carry the simpler and heavier options forward explicitly** - architecture
   guidance is incomplete if it only justifies the chosen option.

## Workflow

### Phase 1: Ground Current Truth

Inspect the relevant repo surfaces:

- current module or package boundaries
- ownership and dependency direction
- external integrations and transport seams
- service or deployable shape
- existing docs or solution entries for the same area

### Phase 2: Define The Decision Surface

Clarify what is actually changing:

- system boundary
- bounded context
- external integration seam
- distributed workflow or failure boundary
- dependency direction or layering

If the decision is really local code cleanup, say so and route toward
`$flywheel:maintainability` or `$flywheel:simplify` instead.

### Phase 3: Compare Viable Shapes

Compare the smallest useful options first, for example:

- local change inside the current module
- clearer module boundary inside a modular monolith
- bounded-context split without separate deployment
- service boundary with explicit data and failure ownership
- hexagonal or ports/adapters boundary around a real external seam

When distributed behavior matters, call out the concrete posture for retries,
idempotency, timeouts, outbox, or saga behavior.

### Phase 4: Recommend The Shape

Choose one recommendation and state:

- why it fits this repo and this problem
- why the simpler option is insufficient
- why the heavier option is not justified
- which clean-code constraints later stages must preserve

## Output Contract

Return a concise architecture brief in this order:

1. **Current truth** — the repo's existing boundary or ownership shape
2. **Decision surface** — what architectural question is actually on the table
3. **Candidate options** — the viable lighter and heavier choices
4. **Recommendation** — chosen shape and why
5. **Rejected options** — what not to do and why
6. **Clean-code constraints** — dependency direction, adapter limits, service
   boundary rules, or bounded-context guardrails
7. **Verification hooks** — tests, review angles, or runtime proof points
8. **Next move** — which Flywheel stage should consume this guidance next

If no architecture change is justified, say that explicitly and explain the
local shape that should stay in place.
