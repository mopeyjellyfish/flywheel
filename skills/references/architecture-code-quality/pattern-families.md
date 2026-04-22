# Pattern Families

Use this reference to reason about named patterns as problem-solving tools, not
as default architecture doctrine.

## Architectural Styles

### Modular Monolith

Use when:

- one deployable still matches ownership and release needs
- boundaries matter, but independent deployment does not
- data consistency is easier inside one process or one database boundary

Avoid when:

- teams need independent release cadence or failure isolation that a module
  boundary cannot provide

Failure mode:

- faking service boundaries with HTTP calls inside one product without a real
  ownership or deployment reason

### Right-Sized Bounded Contexts

Use when:

- the domain has distinct language, invariants, or ownership zones
- the same term means different things in different parts of the system
- one model is becoming overloaded by unrelated concerns

Avoid when:

- the split is only for aesthetic neatness
- the domain is still small and coherent

Failure mode:

- tiny contexts that create translation cost with no reduction in ambiguity

### Hexagonal / Ports-And-Adapters

Use when:

- external systems or transports are real seams worth isolating
- domain logic should stay stable while adapters vary
- tests benefit from exercising domain behavior without transport or provider
  coupling

Avoid when:

- the code is mostly local coordination with no meaningful external seam
- wrappers would outnumber the business rules they protect

Failure mode:

- ceremonial ports around internal code that was already easy to change

## Boundary And Integration Patterns

### DTO

Use when:

- transport or integration boundaries need explicit shape control
- you must decouple external payloads from domain objects

Avoid when:

- the mapping only adds boilerplate between nearly identical internal objects

Failure mode:

- DTOs leaking deep into domain logic and replacing actual models

### Repository

Use when:

- persistence needs a real abstraction boundary
- query or storage concerns should not leak through domain logic

Avoid when:

- it becomes a generic CRUD veneer over a single ORM call site

Failure mode:

- repositories as junk drawers for every data access path

### Anti-Corruption Layer

Use when:

- an external system has a model or vocabulary that should not infect the local
  domain

Avoid when:

- the integration is small and a narrow mapper is enough

Failure mode:

- a "translation layer" that duplicates the full upstream API without reducing
  coupling

## Domain Patterns

### Aggregate / Value Object / Domain Service

Use when:

- invariants span multiple fields or transitions
- domain rules need stable language and ownership

Avoid when:

- the model is straightforward CRUD with no real invariant pressure

Failure mode:

- renaming tables and DTOs with DDD nouns while behavior stays anemic

## Construction And Variation Patterns

### Builder

Use when:

- object construction has many optional combinations or staged validation
- setup readability is failing with telescoping constructors or giant literals

Avoid when:

- the object has a few obvious fields and direct construction is already clear

Failure mode:

- builders for trivial objects that only hide required inputs

### Strategy / Factory / Adapter / Decorator

Use when:

- variation points are real and already recurring
- one axis of change should stay explicit and testable

Avoid when:

- only one implementation exists and no concrete second use is visible

Failure mode:

- speculative extensibility that adds interfaces without current payoff

## Distributed Reliability Patterns

### Idempotency / Outbox / Saga / Retry / Timeout / Circuit Breaker

Use when:

- work crosses process or service boundaries
- retries, duplicate delivery, or partial failure are realistic
- success and failure ownership span more than one component

Avoid when:

- a local transaction or simpler synchronous flow already satisfies the need

Failure mode:

- copying distributed-systems patterns into local code paths with no actual
  failure boundary

## Selection Rule

For every pattern recommendation, answer all three:

1. What concrete seam, invariant, or failure mode does it address here?
2. Why is a simpler local design insufficient?
3. Why is a heavier architecture not justified?
