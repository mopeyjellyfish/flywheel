# Architecture Deepening Opportunities

Use this reference when architecture work is about improving a codebase rather
than deciding a service, bounded-context, or distributed-system boundary.

This guidance is for `architecture-strategy` and for `ideate` when repo-grounded
ideation should include an improve-architecture lens.

## Vocabulary

Use these terms for code-level architecture improvement:

- **Module** - anything with an interface and an implementation, at any scale.
- **Interface** - everything a caller must know to use the module correctly:
  types, invariants, ordering, error modes, configuration, and performance
  characteristics.
- **Implementation** - the code inside the module.
- **Depth** - leverage at the interface. A deep module puts a lot of behavior
  behind a small, stable interface. A shallow module has an interface nearly as
  complex as its implementation.
- **Seam** - the place where a module's interface lives and where behavior can
  vary without editing callers in place.
- **Adapter** - a concrete thing that satisfies an interface at a seam.
- **Leverage** - what callers gain from depth: more capability for less surface
  area.
- **Locality** - what maintainers gain from depth: change, bugs, knowledge, and
  verification concentrated in one place.

Keep this vocabulary distinct from system-level architecture terms. Use
`boundary`, `bounded context`, and `service` when the decision is about
ownership, language, deployment, data, or failure isolation. Use `seam` and
`interface` when the decision is about a module's caller-facing shape.

## Signals

Look for deepening opportunities where:

- understanding one domain concept requires bouncing across many small modules
- a module is mostly pass-through coordination with little leverage at its
  interface
- pure functions were extracted for testability, but bugs live in how callers
  orchestrate them
- tightly coupled modules leak ordering, invariants, error modes, provider
  details, config, or performance assumptions across seams
- tests must reach past the public interface or duplicate implementation
  knowledge to assert useful behavior
- a repeated caller pattern suggests one deeper module could concentrate the
  behavior

Apply the deletion test before recommending a deepening candidate. Imagine
deleting the suspected module:

- If complexity vanishes, the module was likely pass-through ceremony.
- If complexity reappears across several callers, the module was earning its
  keep or should hide more behavior behind a better interface.

## Dependency Categories

Classify dependencies before recommending how to deepen a module.

### In-Process

Use for pure computation or in-memory state with no I/O.

Recommended posture: deepen directly and test through the new interface. No
adapter is needed.

### Local-Substitutable

Use when an I/O dependency has a faithful local test stand-in, such as an
in-memory filesystem, local queue, or embedded database.

Recommended posture: keep the external seam internal to the implementation.
Test the deeper module through its interface while the stand-in runs in the
test suite.

### Remote But Owned

Use for owned services or internal APIs across a network, queue, or process
boundary.

Recommended posture: define a port at the seam only when the logic belongs in
the deep module and transport varies. Production uses an HTTP, gRPC, queue, or
client adapter; tests use an in-memory adapter.

### True External

Use for third-party systems the repo does not control.

Recommended posture: keep the external dependency behind an injected port or
mockable adapter. Do not let external vocabulary leak into the local domain
model unless the integration is intentionally thin.

## Seam Discipline

- One adapter is hypothetical; two justified adapters make a seam real.
- Internal seams can exist inside a deep module for its own tests, but they
  should not leak into the external interface.
- Do not expose internal implementation knobs just because tests currently need
  them.
- Do not add ports, repositories, or DTOs unless they protect a real seam,
  invariant, provider variation, or failure mode.

## Testing Strategy

The interface is the test surface.

- Write tests through the deepened module's interface.
- Assert observable behavior, not internal state.
- Remove old shallow-module unit tests once deeper interface tests cover the
  behavior they described.
- Good tests should survive internal refactors. If a test must change whenever
  the implementation changes, it is testing past the interface.

## Candidate Output

When presenting improve-architecture opportunities, include:

1. **Files** - repo-relative files or modules involved
2. **Problem** - why the current shape creates architecture friction
3. **Solution** - the plain-English deepening or boundary move
4. **Benefits** - locality, leverage, and testability payoff
5. **Dependency shape** - in-process, local-substitutable, remote but owned, or
   true external
6. **Decision conflicts** - context or decision records that should stand or be
   reopened

Do not design final interfaces in the first candidate list. First choose the
candidate worth exploring.

## Interface Exploration

When a candidate is selected, compare multiple interface shapes before
committing to one. At minimum, contrast:

- a minimal interface with 1-3 high-leverage entry points
- a flexible interface that supports several real use cases
- a common-case interface that makes the dominant caller trivial
- a ports-and-adapters shape when cross-seam dependencies make that necessary

For each interface option, cover:

- types, parameters, invariants, ordering, error modes, and configuration
- a usage example from the likely caller
- what implementation detail sits behind the seam
- dependency and adapter strategy
- tradeoffs in depth, locality, and flexibility

Recommend one option or a hybrid after comparing them. Do not present the set as
an unranked menu.
