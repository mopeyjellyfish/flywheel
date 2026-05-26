---
name: architecture-strategy
description: "Assess repo-grounded architecture choices and improvements. Use for boundaries, service splits, dependency direction, or distributed posture."
metadata:
  argument-hint: "[feature, path, boundary question, architecture decision, or improve architecture]"
---

# Architecture Strategy

Use this helper when the main question is system shape or architecture
improvement.

`$fw:architecture-strategy` is a support skill. It can be invoked
directly, or pulled into `ideate`, `brainstorm`, `plan`, `work`, or `review`
when the task introduces real boundary, ownership, or architecture-improvement
decisions.

**When directly invoked, always do architecture work.** Do not stop at naming
patterns. Ground the repo, compare lighter and heavier options, and recommend
the minimum durable shape that fits the actual problem.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Call the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When multiple viable architecture postures exist:

- present 2-3 portable predicted options by default
- put the recommended option first
- keep the tradeoffs concrete
- rely on the host's native freeform final path when it exists

## Input

<architecture_input> #$ARGUMENTS </architecture_input>

If blank, inspect the repo for the strongest current architecture seams and
improvement opportunities first.

## Reference Loading Map

Do not load every shared reference by default. Load only what the current phase
needs:

- Read `../references/architecture-code-quality/activation-heuristics.md` when
  deciding whether the task truly warrants this helper.
- Read `../references/architecture-code-quality/pattern-families.md` when
  comparing boundary, style, or distributed-system choices.
- Read `../references/architecture-code-quality/deepening-opportunities.md`
  when the input asks to improve architecture, find refactoring opportunities,
  consolidate tightly coupled modules, make the codebase more testable, or
  feed architecture opportunities into `ideate`.
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
7. **Deepen shallow modules when improving architecture** - look for places
   where a small, stable interface can hide real behavior and concentrate
   change, tests, and knowledge.

## Workflow

### Phase 1: Ground Current Truth

Inspect the relevant repo surfaces:

- current module or package boundaries
- ownership and dependency direction
- external integrations and transport seams
- service or deployable shape
- existing docs or solution entries for the same area
- existing context/glossary docs and decision records for the same language,
  boundary, workflow contract, or system area
- current test surfaces and whether they exercise behavior through useful
  interfaces or through fragile implementation details

### Phase 2: Define The Decision Surface

Clarify what is actually changing:

- system boundary
- bounded context
- external integration seam
- distributed workflow or failure boundary
- dependency direction or layering
- improve architecture / deepening opportunity for shallow modules

If the decision is really local code cleanup, say so and route toward
`$fw:maintainability` or `$fw:simplify` instead.

If existing context or decision records already settle the boundary, treat them
as durable input. Recommend reopening through `$fw:decision` only when repo
truth or the new requirement materially contradicts them.

When the user asks to **improve architecture** or when `ideate` activates this
helper as an architecture lens, also identify deepening opportunities:

- modules whose interface is nearly as complex as their implementation
- concepts that require bouncing across many small files to understand
- pure helpers extracted for testability while the real bugs hide in
  orchestration callers
- tightly coupled modules whose seams leak ordering, invariants, error modes,
  config, or provider details
- behavior that is hard to test through the current interface

For suspected shallow modules, apply the deletion test: if deleting the module
would remove complexity, it was a pass-through; if the complexity would
reappear across callers, the module is earning its keep or should become deeper.
Use `module`, `interface`, `implementation`, `seam`, `adapter`, `depth`,
`leverage`, and `locality` for code-level deepening analysis. Keep `boundary`
and `bounded context` for system-level architecture decisions.

### Phase 3: Compare Viable Shapes

Compare the smallest useful options first, for example:

- local change inside the current module
- clearer module boundary inside a modular monolith
- bounded-context split without separate deployment
- service boundary with explicit data and failure ownership
- hexagonal or ports/adapters boundary around a real external seam

When distributed behavior matters, call out the concrete posture for retries,
idempotency, timeouts, outbox, or saga behavior.

When deepening a shallow module is a viable architecture improvement, classify
its dependency shape before recommending it:

- in-process computation or state
- local-substitutable dependency with a real test stand-in
- remote but owned dependency that may justify a port plus production and test
  adapters
- true external dependency that should remain behind an injected port or mock
  adapter

Do not introduce an external seam only because one adapter exists. One adapter
is hypothetical; two justified adapters make the seam real.

### Phase 4: Recommend The Shape

Choose one recommendation and state:

- why it fits this repo and this problem
- why the simpler option is insufficient
- why the heavier option is not justified
- which clean-code constraints later stages must preserve

For improve-architecture mode, present a numbered list of candidate
opportunities before choosing one path. For each candidate include:

- **Files** - repo-relative files or modules involved
- **Problem** - the architecture friction being felt
- **Solution** - the plain-English deepening or boundary change
- **Benefits** - locality, leverage, and how tests improve
- **Dependency shape** - one of the dependency categories above
- **Decision conflicts** - any context or decision record that should stand or
  be reopened

Do not design new interfaces until the user chooses a candidate. If interface
exploration is selected, compare multiple interface shapes by depth, locality,
seam placement, dependency strategy, and tradeoffs before recommending one.

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
