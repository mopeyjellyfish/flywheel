---
date: 2026-04-22
topic: flywheel-research-persona-architecture
---

# Add A Persona-Driven Research Architecture To Flywheel

## Problem Frame

Flywheel now has a first-class `flywheel:research` helper, but its internal
shape is still comparatively monolithic: one skill body, a small shared
reference pack, and stage-specific reuse rules in `ideate`, `brainstorm`,
`review`, and `plan`.

That is good enough for a first version, but it will get crowded fast if the
product keeps absorbing more research capability. Popular skill libraries show
the same pattern:

- the useful ones separate orchestration from specialized knowledge
- they keep research as support for another artifact rather than turning every
  task into a standalone report
- they move large conditional guidance into references, sub-skills, or
  specialized roles instead of inlining everything into one prompt

Flywheel should follow the same direction without copying the failure modes of
the broader libraries:

- no giant always-loaded catalogs
- no mandatory autonomous long-running research loop
- no hard dependency on one vendor-specific deep-research API
- no new visible stage inserted into the compact backbone

The target shape is:

- one public `flywheel:research` surface
- internal research personas and reference packs selected by evidence
- small, target-aware loading rules similar to `flywheel:review`
- research that sharpens `ideate`, `brainstorm`, `review`, and `plan` instead
  of replacing them

## External Signals

These repos were the strongest direct inputs as of 2026-04-22:

- [anthropics/skills](https://github.com/anthropics/skills) — strongest
  structure reference, especially self-contained skills and progressive
  disclosure. GitHub showed about 122k stars.
- [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)
  — strongest discovery catalog, but too broad to copy directly. GitHub showed
  about 34.6k stars.
- [Orchestra-Research/AI-research-SKILLs](https://github.com/Orchestra-Research/AI-research-SKILLs)
  — strongest research-orchestration example. Good at routing to domain skills,
  keeping reusable state, and separating orchestration from execution. GitHub
  showed about 7.2k stars.
- [Galaxy-Dawn/claude-scholar](https://github.com/Galaxy-Dawn/claude-scholar)
  — strongest “research as ideation/planning support” example. Good at gap
  analysis, question formation, and method selection. GitHub showed about 3.4k
  stars.
- [posit-dev/skills](https://github.com/posit-dev/skills) — strongest helper
  posture example: targeted skills that improve another workflow artifact
  instead of becoming a whole separate stage. GitHub showed about 302 stars.
- [glebis/claude-skills](https://github.com/glebis/claude-skills) — strongest
  concrete scripted deep-research example, but too tool- and vendor-specific to
  use as the main Flywheel pattern. GitHub showed about 123 stars.
- [WorldFlowAI/everything-claude-code](https://github.com/WorldFlowAI/everything-claude-code)
  — useful reminder that research output should stay “findings first,
  recommendations second,” but its research support is more mode/context than a
  real research architecture.

### Patterns To Borrow

- From `anthropics/skills`: self-contained skills, references loaded on demand,
  and small public surfaces.
- From `AI-research-SKILLs`: orchestrator-not-expert posture, explicit routing
  to specialized knowledge, and structured project memory concepts.
- From `claude-scholar`: question framing, literature/gap analysis, and staged
  research decomposition that feeds later planning.
- From `posit-dev/skills`: helper-first posture, where the skill sharpens the
  primary artifact instead of hijacking the workflow.
- From `glebis/claude-skills`: reproducibility concepts such as saved prompt
  parameters and durable output artifacts when the research itself is valuable.

### Patterns To Reject

- Full autonomous “never stop” research loops and mandatory wall-clock
  continuations from `AI-research-SKILLs`.
- Large static catalogs that encourage overloading the active context by
  default.
- Single-vendor API dependence as the main research implementation contract.
- Full academic-project scaffolding when the Flywheel use case is mostly
  product, repo, workflow, and technical decision support.

## Requirements

**Public Product Shape**
- R1. Flywheel must keep a single public `flywheel:research` surface rather
  than splitting research into many user-facing commands.
- R2. `flywheel:research` must remain helper-first: it should strengthen
  `ideate`, `brainstorm`, `review`, and `plan`, and only become the primary
  artifact when the user explicitly asks for research or when a reusable brief
  is the honest output.
- R2a. The main workflow skills that consume research must be able to trigger
  or reuse it heuristically when the topic is unfamiliar, freshness-sensitive,
  standards-sensitive, or otherwise evidence-light; they must not rely only on
  explicit user requests for research.
- R3. Flywheel must not add research as a mandatory visible stage in the public
  backbone.

**Internal Architecture**
- R4. `skills/research/SKILL.md` should become a thin orchestrator similar in
  spirit to `skills/review/SKILL.md`: stable scaffold first, conditional
  persona loading later.
- R5. Research must gain a registry-driven internal architecture with:
  - a persona registry
  - a persona loading guide
  - selected persona files
  - source or domain packs
  - optional consumer-target packs for `ideate`, `brainstorm`, `review`, and
    `plan`
- R6. Flywheel must read the research registry and loading guide first, then
  only the selected persona and pack files, never the whole research library by
  default.
- R7. The registry must be the source of truth for persona IDs, paths, default
  groups, and activation conditions, mirroring the review reviewer-registry
  pattern.

**Persona Model**
- R8. Research must have a bounded baseline set of personas that run or load
  for every substantive research pass. Recommended baseline:
  - `topic-framing`
  - `repo-grounding`
  - `source-planning`
  - `synthesis`
- R9. Research must have scale-up personas that activate only when topic shape
  justifies them. Recommended examples:
  - `contrarian-challenge`
  - `freshness-checker`
  - `reuse-finder`
  - `evidence-ranker`
- R10. Research must have conditional personas selected by source family or
  decision surface rather than by keywords alone. Recommended examples:
  - `official-docs`
  - `papers-benchmarks`
  - `implementation-precedents`
  - `standards-policy`
  - `security-guidance`
  - `product-market-signals`
- R11. Research must support stage-aware or consumer-aware output shaping so
  the same evidence can feed different artifacts cleanly:
  - `ideate` wants option pressure and shortlist leverage
  - `brainstorm` wants requirements and tradeoff leverage
  - `review` wants correctness and standards leverage
  - `plan` wants implementation-decision leverage

**Reference And Pack Model**
- R12. Shared research guidance must stay in `skills/references/research/`,
  but large conditional material should move into specialized files instead of
  growing the main `SKILL.md`.
- R13. Research must support additive packs comparable to review stack packs,
  but tuned for source classes and topic families rather than programming
  languages. Recommended pack families:
  - `official-docs`
  - `papers-benchmarks`
  - `github-precedents`
  - `standards-policy`
  - `security-compliance`
  - `product-strategy`
- R14. Packs may add personas and reference files, but they must not replace
  the research baseline personas.

**Loading Discipline**
- R15. Research loading must stay deterministic and cheap:
  1. read registry
  2. read loading guide
  3. classify consumer target and topic shape
  4. select baseline personas
  5. add only justified scale-up personas
  6. read only matching packs
  7. load only the selected persona files and pack references
- R16. The loading rules must explicitly optimize for context discipline rather
  than “maximum coverage.”
- R17. If the host does not support delegation or parallel sub-work, the same
  persona model must still work serially.

**Research Method**
- R18. Research must preserve the current `inline`, `delegated`, and
  `orchestrated` execution modes, but persona selection must be orthogonal to
  execution mode.
- R19. Research must keep the current “start broad, then narrow” posture and
  source preference ordering.
- R20. Research must keep evidence labels such as fact, inference, and open
  question, and persona outputs must not erase those distinctions.
- R21. Research must always synthesize findings serially even when gathering
  was parallelized.

**Outputs And Reuse**
- R22. Direct `flywheel:research` runs must still return a compact research
  brief, not a giant report by default.
- R22a. Most research runs should stay ephemeral: the default outcome should be
  a handback to the caller skill rather than a saved `docs/research/` brief.
- R23. When research is used inside another stage, the default output should be
  a compact research note folded into that stage’s artifact, including the
  supporting findings and a clear recommendation for the caller stage to use in
  its decision-making, not a detached standalone brief unless the user asked
  for one.
- R24. Durable briefs in `docs/research/` must remain the reuse surface for
  the smaller set of broad or likely-to-recur topics, but they should record
  which personas and packs were used when that helps later freshness or trust
  decisions.
- R24a. Stored research should be the exception, not the norm: persistence is
  warranted when reuse is likely, the topic is broad, or the user explicitly
  asked for a saved artifact.

**Evaluation**
- R25. Eval coverage must test persona and pack selection discipline, not only
  final prose shape.
- R26. Evals must verify that research stays helper-first inside `ideate`,
  `brainstorm`, `review`, and `plan`.
- R27. Evals must verify that external-source packs are not activated for
  repo-only or “no external research” cases.
- R28. Evals must verify that research can activate richer source families for
  standards-, framework-, or benchmark-sensitive topics without expanding into
  unnecessary breadth.

## Success Criteria

- Flywheel keeps one clean public `flywheel:research` surface, but internally
  gains much wider topic coverage.
- Broad capability comes from selective loading, not from a swollen
  always-on prompt.
- `ideate`, `brainstorm`, `review`, and `plan` can all use research without
  turning into report-writing workflows.
- Most research runs hand back evidence plus a recommendation to the caller
  stage without creating a durable file.
- The product can absorb new research personas and packs without rewriting the
  orchestrator body every time.
- Research stays legible, source-ranked, and cheap enough for routine use on
  normal shaping and review work.

## Scope Boundaries

- Do not add a new always-visible stage to the user-facing loop.
- Do not copy full academic autoresearch workflows into Flywheel.
- Do not require a separate workspace, experiment log, or cron-driven
  continuity loop for normal product research.
- Do not hardwire one commercial research API into the core skill contract.
- Do not load every persona or pack just because the library exists.

## Key Decisions

- **One public surface, many internal lenses:** the user should still think in
  terms of one `research` helper, not a family of mini-commands.
- **Adopt review’s architecture, not review’s exact semantics:** reuse the
  registry/loading/pack pattern, but tune the persona set and output contract
  for evidence gathering rather than bug finding.
- **Use consumer-target awareness:** research should know whether it is feeding
  ideation, requirements, review, planning, or a direct brief.
- **Keep the helper posture:** research is mainly a way to produce better
  choices, requirements, findings, and plans.
- **Default to ephemeral handback:** most research should return findings plus
  a recommendation to the caller stage and skip durable storage unless reuse is
  likely.
- **Make heuristic activation explicit:** `start`, `ideate`, `brainstorm`,
  `review`, and `plan` should be able to pull in research when the current
  stage would be weaker without it, not only when the user literally says
  "research this."
- **Optimize for context discipline:** the library should become larger while
  the default active context stays small.

## High-Level Technical Direction

- Recommended direction: refactor `skills/research/SKILL.md` into a thin
  orchestrator and add:
  - `skills/research/references/researcher-registry.yaml`
  - `skills/research/references/persona-loading.md`
  - `skills/research/references/personas/*.md`
  - `skills/research/references/source-packs/index.yaml`
  - `skills/research/references/source-packs/*.yaml`
- Recommended baseline persona set:
  - `topic-framing`
  - `repo-grounding`
  - `source-planning`
  - `synthesis`
- Recommended first conditional persona set:
  - `contrarian-challenge`
  - `evidence-ranker`
  - `freshness-checker`
  - `official-docs`
  - `papers-benchmarks`
  - `implementation-precedents`
  - `standards-policy`
- Recommended first pack families:
  - `framework-docs`
  - `papers-benchmarks`
  - `github-precedents`
  - `policy-standards`
- Recommended output adaptation:
  - direct research -> compact in-turn brief by default, with persistence only
    when reuse is warranted
  - ideate/brainstorm/plan/review -> compact embedded research note plus reuse
    guidance when persistence is warranted

## Dependencies / Assumptions

- The current review registry and loading-guide pattern is stable enough to
  reuse conceptually for research.
- The current `docs/research/` contract remains the durable artifact surface.
- Host behavior may differ, so the research registry must be usable serially
  even when no subagent or parallel worker support exists.

## Outstanding Questions

### Resolve Before Planning

- [Affects R8-R14][Design] What is the smallest useful baseline persona set for
  software-product research without making even narrow runs feel heavy?
- [Affects R11][Design] Should consumer-target awareness be encoded as packs,
  output modes, or a simpler `consumer_target` field?

### Deferred To Planning

- [Affects R25-R28][Technical] Which eval dimensions should score persona
  selection discipline versus final answer quality?
- [Affects R12-R14][Technical] How should packs declare the reference files and
  persona IDs they add?
- [Affects R24][Technical] Which brief metadata should record personas or packs
  without turning saved briefs into noisy implementation artifacts?

## Next Steps

-> `$flywheel:plan` to turn this persona-driven research architecture into
   concrete file changes, selection rules, and eval coverage
