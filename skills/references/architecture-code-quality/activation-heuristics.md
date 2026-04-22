# Architecture And Code-Quality Activation Heuristics

Use this reference to decide when Flywheel should pull in specialist helper
skills instead of relying on generic shaping, planning, or execution language.

## General Rule

Activate the smallest specialist surface that meaningfully sharpens the work.
Do not fan out across every helper because the task "sounds technical."

Ask:

1. Is there a real boundary, pattern, or clean-code decision here?
2. Would the default stage likely hand-wave that decision?
3. Which helper answers the specific question with the least extra ceremony?

## `architecture-strategy`

Use when the work changes or questions:

- bounded contexts, ownership, or service boundaries
- modular-monolith vs service split decisions
- dependency direction, layering, or hexagonal boundaries
- cross-service workflows, failure boundaries, or data ownership
- distributed-system posture such as idempotency, outbox, saga, timeout,
  retry, or circuit breaker decisions

Strong signals:

- "Should this be its own service?"
- "Where should this boundary live?"
- "Do we need ports/adapters here?"
- "How should this workflow survive retries or partial failure?"

Suppress when:

- the change is local to one module with no boundary or ownership shift
- the user is really asking about code cleanup rather than system shape

## `pattern-recognition`

Use when the work needs help deciding whether a named pattern fits:

- DTO
- ports/adapters
- repository
- builder
- strategy, factory, adapter, decorator
- aggregate, value object, domain service
- anti-corruption layer

Strong signals:

- "Should we use a repository here?"
- "Does this need DDD?"
- "Are DTOs justified or just extra mapping?"
- "What existing repo pattern should this follow?"

Suppress when:

- the answer is already fixed by a strong nearby repo pattern
- the work is boundary-free and the named pattern question is rhetorical

## `maintainability`

Use when future edit cost is rising because the change adds:

- wrappers or helper layers
- orchestration across multiple files
- naming or ownership ambiguity
- duplicate control flow or parallel paths
- coupling that forces unrelated code to move together

Strong signals:

- "Will this stay easy to change?"
- "Is this structure making later edits harder?"
- "Should this logic stay local or be extracted?"

Suppress when:

- the change is tiny and obviously local
- the concern is purely stylistic with no future-edit downside

## `simplify`

Use after a cluster of changes or when recent edits introduced:

- removable wrappers
- optional configuration that is not earning its keep
- generalized abstractions with one concrete use
- helper sprawl that could be localized
- ceremony that makes a small change harder to follow

Strong signals:

- "What can we remove?"
- "This feels overbuilt."
- "Collapse this before review."

Suppress when:

- the code has not settled enough to know where duplication should land
- the suggested cleanup would widen scope into unrelated files

## Ordering Rules

- Use `architecture-strategy` before `pattern-recognition` when the boundary or
  system shape is still undecided.
- Use `pattern-recognition` before `maintainability` when the main question is
  whether a named abstraction is justified at all.
- Use `simplify` after implementation clusters, not before the first concrete
  shape exists.
- Use `maintainability` when the code already exists and the question is about
  long-term edit cost rather than architectural shape.

## Anti-Patterns

- Do not default to microservices because the task mentions "domain" or
  "scaling."
- Do not invoke every helper for one change just to sound thorough.
- Do not recommend DDD, hexagonal architecture, repositories, or DTOs without
  naming the concrete seam or failure mode they improve.
- Do not treat simplification as a whole-repo cleanup pass.
