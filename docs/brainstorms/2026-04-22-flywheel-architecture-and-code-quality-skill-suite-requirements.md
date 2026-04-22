---
date: 2026-04-22
topic: flywheel-architecture-and-code-quality-skill-suite
---

# Integrate Architecture And Code-Quality Specialist Skills Into Flywheel

## Problem Frame

Flywheel already has a strong compact workflow and a useful split between
shaping, execution, review, branch finishing, and durable learnings. The main
gap is not the lack of an extra visible stage. The gap is that Flywheel does
not yet provide a strong, explicit specialist layer for architecture,
maintainability, pattern selection, and simplification across the full
`spec -> plan -> work -> review -> commit -> spin` lifecycle.

Today, some of the needed seams already exist: `work` already reserves a
simplification pass, and `review` already has `architecture`, `maintainability`,
and `simplicity` personas. But the product contract is still too weak in four
ways:

1. architecture and pattern decisions are not captured consistently enough in
   shaping and planning
2. simplification is not yet a first-class helper skill with clear invocation
   rules during execution
3. review does not yet treat simplicity, maintainability, pattern fit, and
   architecture fit as a coherent specialist suite
4. the specialist prompts, schemas, and evaluation surfaces are not yet tuned
   explicitly for frontier reasoning models

The result is uneven pressure on code quality. Flywheel can describe good
engineering posture in general terms, but it cannot yet reliably decide when to
use or reject patterns such as DDD, DTOs, ports/adapters, repository,
builder, hexagonal boundaries, or distributed-system patterns, nor can it
consistently simplify code after rapid implementation work.

## Requirements

**Workflow Integration**
- R1. Flywheel must integrate architecture and code-quality specialist skills
  into the existing `spec -> plan -> work -> review -> commit -> spin`
  lifecycle without adding a new mandatory visible stage to the compact project
  loop.
- R2. The visible Flywheel backbone must remain `shape -> work -> review ->
  commit`, with specialist skills invoked conditionally inside those stages or
  called directly when the user explicitly asks for them.
- R3. When architecture, boundaries, abstractions, or service-shape decisions
  materially affect the work, Flywheel must capture those decisions in the
  shaping artifact and carry them forward into planning rather than expecting
  `work` or `review` to rediscover them from scratch.
- R4. `plan` must become the canonical place where architecture and pattern
  decisions are made explicit, including what was chosen, what was rejected,
  and why.
- R5. `work` must be able to invoke simplification and related quality helpers
  during execution without waiting until the final review pass.
- R6. `review` must treat simplicity, maintainability, pattern justification,
  and architecture fit as distinct but coordinated quality concerns.
- R7. `commit` must carry forward only the material architecture or
  code-quality story needed for PR and branch-finishing context, not dump raw
  specialist output into the finish-stage narrative.
- R8. `spin` must be able to capture durable lessons about justified patterns,
  rejected patterns, simplification wins, and maintainability guidance when the
  session produced reusable project knowledge.

**Specialist Skill Suite**
- R9. Flywheel must provide or sharpen Flywheel-native specialist surfaces
  corresponding to:
  - code simplicity / simplification
  - maintainability
  - pattern recognition and pattern justification
  - architecture strategy
- R10. Each specialist surface must have a narrow, explicit remit, including
  what it focuses on, what it suppresses, and what evidence it must cite, so
  the suite does not collapse into one generic "clean code" doctrine.
- R11. The specialist suite must support pattern families that are materially
  relevant to modern codebase work, including:
  - GoF and object-behavior patterns when variation or construction warrants
    them
  - DDD concepts such as bounded contexts, aggregates, value objects, and
    domain services when domain complexity earns them
  - boundary patterns such as DTOs, ports/adapters, anti-corruption layers,
    and hexagonal boundaries when external seams or transport boundaries are
    real
  - persistence patterns such as repository when persistence needs a meaningful
    boundary
  - distributed-system patterns such as idempotency, outbox, saga,
    retry/fail-fast, timeout, and circuit-breaker posture when failure
    boundaries and distributed coordination matter
- R12. The specialist suite must help Flywheel decide when **not** to use a
  pattern, including when a local function, module boundary, or modular
  monolith is the better choice.
- R13. Architecture guidance must optimize for right-sized bounded contexts,
  ownership boundaries, release independence, and failure isolation rather than
  defaulting to microservices or smaller service count as a virtue by itself.

**Invocation Rules And Handoffs**
- R14. Flywheel must define explicit activation heuristics for each specialist
  based on artifact type, repo evidence, diff shape, and problem signals rather
  than keyword matching alone.
- R15. In shaping and planning, architecture and pattern specialists must
  activate when module boundaries, service splits, domain invariants,
  integration seams, data ownership, or distributed behavior are materially in
  scope.
- R16. In `work`, simplification must activate after clusters of related work
  or abstraction-heavy units, with stronger pressure when the implementation
  adds wrappers, helpers, orchestration, or new layers.
- R17. In `review`, simplicity and maintainability pressure must activate for
  non-trivial executable-code changes, with stronger weight when the diff adds
  abstractions, orchestration, layering, or pattern-heavy structure; review
  must also activate architecture and pattern-recognition specialists when
  module boundaries, dependency direction, ownership seams, distributed
  behavior, or explicit pattern introductions are materially changing.
- R18. Pattern-recognition output must be able to inform both planning and
  review, so the same repo-grounded pattern knowledge can shape the plan and
  later check whether the implementation actually followed or violated it.
- R19. When implementation truth invalidates an earlier architecture or pattern
  choice, Flywheel must surface that conflict explicitly and re-route through
  the relevant helper instead of silently drifting away from the planned
  boundary decisions.

**Model Effectiveness**
- R20. Specialist prompts must be written for frontier reasoning models using
  clear, direct instructions, explicit delimiters or tags for context blocks,
  structured outputs, and repo-grounded evidence requirements rather than vague
  roleplay or chain-of-thought prompting.
- R21. Specialist outputs must be schema-driven enough to support reliable
  synthesis, scoring, de-duplication, and evaluation across models.
- R22. The suite must support model tiering: architecture and final synthesis
  may use stronger reasoning models, while narrower specialist passes such as
  simplicity or maintainability may use smaller or faster models when quality
  remains acceptable.
- R23. Flywheel must evaluate specialist effectiveness explicitly, including:
  - activation and suppression quality
  - finding quality and evidence quality
  - overlap reduction between specialists
  - handoff quality from shaping to planning to execution
  - whether review and simplification pressure actually improve durable code
    quality without pushing the workflow into ceremony-heavy behavior
- R24. The eval strategy must verify that the specialist suite works across the
  intended workflow, not only as isolated prompts.

**Review Scoring And Synthesis**
- R25. Flywheel review must be able to score or otherwise track simplicity,
  maintainability, architecture fit, and pattern justification as separate
  quality dimensions for synthesis and prioritization.
- R26. Those dimensions must guide routing, ordering, or calibration without
  replacing the findings-first review contract.
- R27. Simplification pressure in review must prefer concrete removable or
  collapsible complexity over style-only advice or large rewrite suggestions.

## Success Criteria

- A technical brainstorm or requirements doc can capture when architecture and
  pattern choices materially shape the work without turning every brainstorm
  into an ADR exercise.
- A plan for architecture-bearing work names the relevant pattern and boundary
  decisions, explains why simpler options are insufficient, and explains why
  heavier options were rejected.
- `work` can run a simplification pass during execution and improve code
  clarity without silently widening scope into generic refactoring.
- `review` can surface independent signals for simplicity, maintainability,
  architecture fit, and pattern justification without duplicating the same
  finding four times.
- Flywheel can guide users toward right-sized bounded contexts and service
  boundaries without teaching microservices as the default answer.
- Eval coverage can detect whether the specialist suite is activating at the
  right times, staying grounded in repo truth, and producing better handoffs
  across the full workflow.

## Scope Boundaries

- Do not add a new mandatory visible `architecture` stage to the public
  Flywheel backbone.
- Do not force DDD, hexagonal architecture, microservices, or other named
  patterns onto routine or low-complexity work by default.
- Do not copy Compound Engineering prompts or personas verbatim; adapt the
  useful role split into Flywheel's existing workflow, naming, and evaluation
  contracts.
- Do not turn review scoring into the primary user-facing output; findings
  remain primary.
- Do not make simplification a blanket full-repo cleanup pass on every task.
- Do not expand this first pass into a separate continuous or scheduled cleanup
  automation product; the immediate scope is the interactive Flywheel workflow.

## Key Decisions

- **Keep the compact loop intact:** architecture and code-quality improvements
  belong inside shaping, plan, work, review, commit, and spin rather than as a
  new always-visible stage.
- **Split concerns into specialists instead of one doctrine:** simplicity,
  maintainability, pattern recognition, and architecture strategy should stay
  separate enough to produce non-overlapping, evidence-bound guidance.
- **Make planning the main architecture decision surface:** the plan is where
  Flywheel should lock pattern and boundary choices before execution starts.
- **Use simplification as both a work helper and a review pressure:** code
  should be simplified during execution when possible, with review serving as
  the safety net and scoring surface.
- **Favor right-sized boundaries over fashionable architecture:** bounded
  contexts, dependency direction, and failure boundaries matter more than
  pattern name recognition or service count.
- **Start with interactive workflow integration:** the first implementation
  should strengthen Flywheel's current `spec -> plan -> work -> review ->
  commit -> spin` path before pursuing separate continuous-simplicity or
  always-on automation workflows.
- **Design for frontier models deliberately:** prompts, schemas, and evals
  should be tuned for current reasoning-model behavior rather than relying on
  generic prompt folklore.

## Dependencies / Assumptions

- Existing Flywheel seams in `skills/work/SKILL.md` and
  `skills/review/references/reviewer-registry.yaml` remain the primary
  extension points for this work.
- Prompt-eval and workflow-eval infrastructure remain the main regression
  surface for specialist-skill behavior.
- Some model-specific tuning may live in references, agent configs, or reviewer
  contracts rather than in one giant top-level skill prompt.

## Outstanding Questions

### Resolve Before Planning
- None.

### Deferred to Planning
- [Affects R9][Technical] What Flywheel-native skill names and directory layout
  should represent the specialist suite so the names are explicit without
  bloating the command surface?
- [Affects R18][Technical] Should pattern recognition be a standalone helper
  skill, a review persona, a planning helper, or a combined surface with
  different invocation modes?
- [Affects R20][Needs research] Which prompt and schema shapes produce the most
  reliable frontier-model behavior for narrow specialist passes versus
  cross-specialist synthesis?
- [Affects R22][Needs research] What model-tiering defaults should Flywheel use
  for architecture strategy, pattern recognition, maintainability,
  simplification, and final review synthesis?
- [Affects R23][Technical] How should Flywheel evaluate activation quality,
  suppression quality, and overlap between specialists without creating brittle
  evals?
- [Affects R25][Technical] How should review scoring be represented so it helps
  routing and synthesis without making the user-facing output feel mechanical or
  dashboard-driven?
- [Affects R8][Technical] What frontmatter or schema additions, if any, should
  `spin` use to store durable lessons about pattern choices and simplification
  heuristics?

## Next Steps

-> $flywheel:plan for structured implementation planning by default.
