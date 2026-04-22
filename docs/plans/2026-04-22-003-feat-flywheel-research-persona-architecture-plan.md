---
title: Flywheel Research Persona Architecture Plan
type: feat
status: active
date: 2026-04-22
origin: docs/brainstorms/2026-04-22-flywheel-research-persona-architecture-requirements.md
---

# Flywheel Research Persona Architecture Plan

## Overview

This plan evolves `flywheel:research` from a single helper skill with shared
references into a review-style internal architecture: one stable public surface
plus a bounded set of research personas, source packs, and loading rules that
expand capability without bloating the default prompt.

The target outcome is:

- one unchanged public `flywheel:research` command surface
- a thin orchestrator in `skills/research/SKILL.md`
- research-specific registry, loading-guide, persona, and source-pack files
- heuristic research activation and reuse rules across `start`, `ideate`,
  `brainstorm`, `review`, and `plan`
- ephemeral research handback by default, with evidence plus recommendation for
  the caller stage and durable storage only when reuse is likely
- consumer-target-aware output shaping for `ideate`, `brainstorm`, `review`,
  `plan`, and direct research usage
- additive eval coverage that checks selection discipline, helper-first
  behavior, and source-pack correctness

## Problem Frame

Flywheel's current research implementation already supports direct research,
durable briefs, and stage-level reuse, but its internal shape is still mostly
monolithic. As more topic-specific or source-specific research behavior lands,
the current pattern will push too much conditional guidance into one
orchestrator and one shared reference pack.

The implementation goal is to preserve the current helper-first product
contract while adopting the same internal discipline that `flywheel:review`
already uses successfully:

- registry first
- loading guide second
- selected personas only
- additive packs only when justified

See origin:
`docs/brainstorms/2026-04-22-flywheel-research-persona-architecture-requirements.md`.

## Requirements Trace

- R1-R3. Keep one public `flywheel:research` helper surface and preserve the
  compact visible backbone.
- R2a. Make the main workflow skills able to invoke or reuse research
  heuristically when evidence gaps, freshness sensitivity, or standards-driven
  judgment make the current stage weaker without it.
- R4-R7. Refactor research into a thin orchestrator with registry-driven
  persona and pack selection.
- R8-R14. Add a bounded baseline persona set, optional scale-up personas, and
  additive source packs without default overloading.
- R15-R17. Keep loading deterministic, cheap, and serial-safe when hosts do
  not support delegated work.
- R18-R24. Preserve the current research execution modes, evidence posture,
  embedded-helper outputs, recommendation-bearing handback, and durable-brief
  reuse while adding lightweight lineage where it improves trust.
- R25-R28. Add eval coverage for persona and pack selection discipline, helper
  posture inside stage workflows, and source-pack suppression when external
  research is not warranted.

## Scope Boundaries

- Do not add new user-facing research subcommands.
- Do not turn research into a mandatory stage before shaping or review.
- Do not copy academic autoresearch workspace scaffolding, cron loops, or
  experiment-tracking flows into Flywheel.
- Do not hardwire any single vendor's deep-research API into the core
  architecture.
- Do not redesign `docs/research/` into a full retrieval platform or refresh
  system.
- Do not expand this pass into `work`, `commit`, or `spin`; keep the changes
  centered on direct research plus shaping/review consumers.

### Deferred to Separate Tasks

- Additional source packs for issue trackers, Slack, or internal knowledge
  systems beyond the current repo and web surfaces.
- Automated stale-brief refresh and research-brief invalidation workflows.
- Research-aware helper integration inside `work`, `commit`, or `spin`.
- Secondary language- or domain-specific research personas once the baseline
  source-pack architecture proves stable.

## Context & Research

### Relevant Code and Patterns

- `skills/review/SKILL.md` already demonstrates the exact internal architecture
  this work should emulate: registry-first loading, bounded persona selection,
  additive stack packs, and a thin orchestrator body.
- `skills/review/references/reviewer-registry.yaml` and
  `skills/review/references/persona-loading.md` are the clearest local pattern
  for deterministic frontier-model loading discipline.
- `skills/research/SKILL.md` already contains the correct product-level
  helper-first contract, direct output structure, and execution-mode model;
  that surface should stay public while its internals become more modular.
- `skills/references/research/activation-heuristics.md`,
  `skills/references/research/source-ranking-and-synthesis.md`, and
  `skills/references/research/research-brief-contract.md` are the existing
  shared cross-stage contract and should stay the shared seam for stage-local
  consumers.
- `skills/start/SKILL.md`, `skills/ideate/SKILL.md`,
  `skills/brainstorm/SKILL.md`, `skills/review/SKILL.md`, and
  `skills/plan/SKILL.md` already consume the current research contract and will
  need explicit heuristic activation rules, consumer-target-aware wording, and
  reuse rules rather than a ground-up rewrite.
- `evals/research/` already covers direct research behavior, and
  `evals/fw-review/` already covers review-time research support. These are the
  primary eval surfaces to extend before touching adjacent stage suites.
- Current research write scope is still compact:
  - `skills/research/SKILL.md`
  - `skills/research/agents/openai.yaml`
  - `skills/references/research/*`
  - `evals/research/*`
  - `evals/fw-review/*`
  - `tools/evals/src/scoring/research.cjs`
  - `tools/evals/src/scoring/fw-review.cjs`

### Institutional Learnings

- `docs/solutions/developer-experience/use-flywheel-start-as-the-router-entrypoint-2026-04-19.md`
  reinforces keeping helper surfaces discoverable without adding new visible
  backbone stages.
- `docs/solutions/developer-experience/journey-evals-without-a-harness-redesign-2026-04-19.md`
  reinforces additive suite growth instead of inventing a second evaluation
  system.
- The current `review` implementation proves that capability can scale through
  registries and packs while keeping the stable orchestration scaffold small.

### External References

- Anthropic skills repo:
  https://github.com/anthropics/skills
- Orchestra Research AI Research SKILLs:
  https://github.com/Orchestra-Research/AI-research-SKILLs
- Claude Scholar:
  https://github.com/Galaxy-Dawn/claude-scholar
- Posit skills:
  https://github.com/posit-dev/skills
- Glebis claude-skills:
  https://github.com/glebis/claude-skills
- WorldFlowAI everything-claude-code research context:
  https://github.com/WorldFlowAI/everything-claude-code/blob/main/contexts/research.md

## Architecture and Pattern Decisions

- **Keep one public research surface.** The chosen direction is one
  `flywheel:research` helper with a richer internal architecture. Rejected
  alternative: split research into many user-facing mini-commands, which would
  erode the helper-first product contract and complicate discovery.
- **Make stage-level heuristic activation first-class.** The chosen direction
  is that `start`, `ideate`, `brainstorm`, `review`, and `plan` can invoke or
  reuse research when unfamiliarity, freshness, standards, or weak local
  precedent make the stage materially weaker without it. Rejected alternative:
  require explicit user phrasing such as "research this" before helper research
  can engage.
- **Adopt review's registry and pack pattern.** The chosen direction is a thin
  research orchestrator backed by a registry, loading guide, persona files, and
  source packs. Rejected alternative: continue adding conditional doctrine to
  `skills/research/SKILL.md` until it becomes a large always-loaded prompt.
- **Separate research internals from shared stage contracts.** The chosen
  direction is to add research-specific internals under
  `skills/research/references/` while keeping cross-stage contracts in
  `skills/references/research/`. Rejected alternative: move all research
  references under the research skill and force shaping/review stages to depend
  on research-local implementation details.
- **Use consumer-target awareness as runtime classification, not as a public
  subcommand family.** The chosen direction is an internal `consumer_target`
  classification such as `direct`, `ideate`, `brainstorm`, `review`, or `plan`
  that shapes output and pack activation. Rejected alternative: expose target
  variants in the command surface or encode them as user-facing packs.
- **Default to ephemeral handback, not saved research.** The chosen direction
  is for most research runs to return a compact evidence summary plus a
  recommendation to the caller stage and skip persistence unless reuse is
  likely or the user explicitly asked for a saved artifact. Rejected
  alternative: treat durable `docs/research/` artifacts as the normal output of
  helper-stage research.
- **Keep baseline personas minimal and additive.** The chosen baseline is:
  `topic-framing`, `repo-grounding`, `source-planning`, and `synthesis`.
  Rejected alternative: broad baseline fan-out that would erase the context
  budget advantage this refactor is meant to create.
- **Use source packs, not stack packs.** The chosen direction is additive packs
  keyed by source family and decision surface, for example `official-docs`,
  `papers-benchmarks`, `github-precedents`, and `policy-standards`. Rejected
  alternative: language-style packs that do not map cleanly to research tasks.
- **Persist lineage lightly.** Durable briefs should keep source-scope and
  research-mode metadata as they do now, and add only lightweight optional
  lineage such as `source_packs` when the source mix materially affects later
  trust or freshness checks. Rejected alternative: mandatory exhaustive persona
  traces in every saved brief.
- **Keep research execution mode orthogonal to persona selection.** The chosen
  direction is to preserve `inline`, `delegated`, and `orchestrated` as
  execution posture while persona and pack selection remain a separate concern.
  Rejected alternative: conflate every complex source family with multi-agent
  execution.

## Testing Strategy

- **Project testing idioms:** This repo's primary regression surface is the
  eval harness under `evals/` and `tools/evals/src/scoring/`, with `make verify`
  as the broad validation entrypoint.
- **Posture selection rule:** Use `tdd` for every implementation unit because
  each unit changes external workflow behavior, deterministic scoring, or
  durable research-brief contracts.
- **Plan-level posture mix:** All units use `tdd`. None of the proposed work is
  narrow enough for `no-new-tests`, and characterization-only coverage would be
  too weak for a user-facing workflow contract refactor.
- **TDD sequencing note:** Each behavior-bearing unit should begin by tightening
  or adding the relevant failing eval/scorer expectations in the existing suite
  before changing the skill or doc surface. Unit 4 collects the broader suite
  expansion and scorer hardening once the contract is stable enough to codify
  cleanly.
- **Material hypotheses:**
  - Research capability can widen through selected personas and packs without
    increasing default context load.
  - `review`-style loading discipline can transfer cleanly to `research`
    without weakening the current helper-first contract.
  - Consumer-target-aware output shaping will let `research` sharpen `ideate`,
    `brainstorm`, `review`, and `plan` without turning those stages into
    detached report generators.
  - Most research runs can hand back evidence plus a recommendation without
    creating a durable file, while still allowing persistence when reuse is
    likely.
  - Main workflow skills can heuristically activate research when needed
    without implying that research is a mandatory visible stage.
  - Eval suites can detect over-eager source-pack activation and helper-stage
    regressions without a new harness design.
- **Red -> green proof points:**
  - Red: direct `research` evals fail because no registry or loading discipline
    is visible, source packs over-trigger, or embedded outputs degrade into
    standalone reports.
  - Red: helper-stage research persists too eagerly instead of handing back an
    embedded recommendation-bearing result.
  - Red: `fw-review` fails because review-time targeted research is not clearly
    helper-first.
  - Red: shaping-stage suites fail because they stop reusing briefs cleanly or
    begin implying research is a mandatory stage or only activate research on
    literal user request.
  - Green: direct and stage suites pass with bounded loading language,
    consumer-target-aware reuse, explicit heuristic activation,
    recommendation-bearing handback, and correct suppression of external packs
    for repo-only cases.
- **Public contracts to protect:**
  - one public `flywheel:research` helper surface
  - helper-stage optionality inside the compact visible loop
  - explicit source ranking, uncertainty, and fact/inference separation
  - durable brief reuse through `docs/research/`
  - review's ability to use research support without routing away from review
- **Primary test surfaces:**
  - `evals/research/`
  - `evals/fw-review/`
  - `evals/fw-ideate/`
  - `evals/fw-brainstorm/`
  - `evals/fw-plan/`
  - `tools/evals/src/scoring/research.cjs`
  - `tools/evals/src/scoring/fw-review.cjs`
  - `tools/evals/src/scoring/fw-ideate.cjs`
  - `tools/evals/src/scoring/fw-brainstorm.cjs`
  - `tools/evals/src/scoring/fw-plan.cjs`

## Dependencies And Parallelism

- **Critical path:** Unit 1 -> Unit 2 -> Unit 3 -> Units 4 and 5
- **Parallel-ready sets:** After Unit 3 locks the internal contract and
  consumer-target behavior, Unit 4 (evals/scorers) and Unit 5
  (docs/discovery sweep) can run in parallel because they touch disjoint
  surfaces.
- **Serial-only units:** Units 1-3 must stay serial because each establishes
  contract surfaces the next unit depends on.

## Open Questions

### Resolved During Planning

- **Where should the internal persona architecture live?** Put it under
  `skills/research/references/` and keep shared cross-stage research guidance
  under `skills/references/research/`.
- **How should consumer-target awareness be modeled?** Treat it as runtime
  classification inside the orchestrator and stage contracts, not as new
  user-facing commands or separate persisted pack types.
- **How much lineage should a saved brief retain?** Keep lineage lightweight
  and optional; preserve required source and freshness metadata, and add pack
  lineage only when it materially improves later trust or reuse decisions.
- **What should the default research output be?** Use ephemeral handback with
  findings plus recommendation by default; persist only when reuse is likely or
  explicitly requested.

### Deferred to Execution

- Exact persona wording and whether one or two planned conditional personas
  should collapse into a shared file once the first draft exists.
- Whether `product-market-signals` belongs in the first implementation batch or
  should wait until the source-pack architecture proves stable on technical and
  repo-grounded research.

## Implementation Units

- [ ] **Unit 1: Add the research loading scaffold**

**Goal:** Establish the internal registry, loading guide, and pack entrypoint
that let `flywheel:research` select bounded capability by evidence instead of
by always-loaded prompt text.

**Requirements:** [R4, R5, R6, R7, R15, R16, R17, R18]

**Dependencies:** None

**Execution mode:** `serial` -- This unit establishes the shared internal
contract and file layout that all later units depend on.

**Files:**
- Modify: `skills/research/SKILL.md`
- Modify: `skills/research/agents/openai.yaml`
- Add: `skills/research/references/researcher-registry.yaml`
- Add: `skills/research/references/persona-loading.md`
- Add: `skills/research/references/source-packs/index.yaml`
- Test: `evals/research/cases.jsonl`
- Test: `evals/research/rubric.md`
- Test: `tools/evals/src/scoring/research.cjs`

**Test posture:** `tdd` -- The direct research contract is user-visible and
already represented by the `evals/research/` suite.

**Approach:**
- Refactor `skills/research/SKILL.md` into a stable orchestrator with explicit
  registry-first loading instructions.
- Classify `consumer_target` early so direct research and embedded research can
  reuse one orchestrator without one-size-fits-all output behavior.
- Make direct and embedded outputs recommendation-bearing so the caller stage
  gets both the supporting findings and the suggested direction to act on.
- Keep `inline`, `delegated`, and `orchestrated` execution-mode instructions
  intact while making persona and pack selection a separate layer.

**Execution note:** Preserve the current helper-first public contract: do not
add new user-facing command variants or mandatory research ceremony.

**Patterns to follow:**
- `skills/review/SKILL.md`
- `skills/review/references/reviewer-registry.yaml`
- `skills/review/references/persona-loading.md`

**Test scenarios:**
- Direct `research` still presents one stable command surface.
- The orchestrator explicitly follows registry -> loading guide -> selected
  personas/packs.
- The execution-mode model remains explicit and unchanged in spirit.
- Serial hosts still have a valid path through the same contract.
- Direct research returns findings plus recommendation without implying that a
  saved brief is always created.

**Red signal:** `evals/research/` fails because the response no longer makes a
coherent execution strategy visible or implies a bulk-loaded catch-all
researcher.

**Green signal:** The direct research suite can recognize the bounded loading
discipline while preserving the current execution-mode contract.

**Verification:**
- `evals/research/` passes with the new orchestrator shape.

- [ ] **Unit 2: Add the first research personas and source packs**

**Goal:** Introduce the minimal baseline and conditional persona library plus
the first additive source packs needed to cover current technical and
workflow-research use cases.

**Requirements:** [R8, R9, R10, R11, R13, R14, R19, R20, R21]

**Dependencies:** Unit 1

**Execution mode:** `serial` -- This unit defines the capability surface that
consumer stages and evals will rely on, so the first implementation should stay
in one coordinated pass.

**Files:**
- Add: `skills/research/references/personas/topic-framing.md`
- Add: `skills/research/references/personas/repo-grounding.md`
- Add: `skills/research/references/personas/source-planning.md`
- Add: `skills/research/references/personas/synthesis.md`
- Add: `skills/research/references/personas/freshness-checker.md`
- Add: `skills/research/references/personas/evidence-ranker.md`
- Add: `skills/research/references/personas/contrarian-challenge.md`
- Add: `skills/research/references/personas/reuse-finder.md`
- Add: `skills/research/references/personas/official-docs.md`
- Add: `skills/research/references/personas/papers-benchmarks.md`
- Add: `skills/research/references/personas/implementation-precedents.md`
- Add: `skills/research/references/personas/standards-policy.md`
- Add: `skills/research/references/source-packs/official-docs.yaml`
- Add: `skills/research/references/source-packs/papers-benchmarks.yaml`
- Add: `skills/research/references/source-packs/github-precedents.yaml`
- Add: `skills/research/references/source-packs/policy-standards.yaml`
- Test: `evals/research/cases.jsonl`
- Test: `evals/research/rubric.md`
- Test: `tools/evals/src/scoring/research.cjs`

**Test posture:** `tdd` -- These personas and packs exist to change visible
research behavior, source posture, and output quality.

**Approach:**
- Keep the baseline set small and always applicable.
- Make scale-up and conditional personas additive only when topic shape or
  source family justifies them.
- Keep pack activation tied to source families and decision surfaces rather
  than raw keywords.
- Ensure synthesis remains the one place where final findings are ranked,
  deduplicated, and labeled as fact, inference, or open question.

**Execution note:** Avoid academic-project sprawl. These personas should be
aimed at product, repo, workflow, and technical decision research, not full
autonomous experiment management.

**Patterns to follow:**
- `skills/review/references/personas/*.md`
- `skills/review/references/stack-packs/*.yaml`
- `skills/references/research/source-ranking-and-synthesis.md`

**Test scenarios:**
- Narrow repo-grounded research activates only the bounded baseline set.
- Official-docs-sensitive questions can activate official-docs support without
  implying academic or precedent packs.
- Benchmark- or standards-sensitive questions can add the relevant packs
  without collapsing into every conditional persona.
- Findings still preserve fact, inference, and open-question distinctions.

**Red signal:** `evals/research/` fails because the response implies all packs
or all personas run for ordinary cases.

**Green signal:** Direct research responses reflect bounded persona and
source-pack selection while staying concise and source-ranked.

**Verification:**
- `evals/research/` passes with cases that distinguish narrow, repo-only, and
  richer source-family scenarios.

- [ ] **Unit 3: Teach stages to consume research with consumer-target-aware behavior**

**Goal:** Update the router and shaping/review stages so research remains a
helper-first capability with output shaped to the artifact actually being
produced.

**Requirements:** [R1, R2, R3, R11, R18, R22, R23, R24, R26]

**Dependencies:** Unit 2

**Execution mode:** `serial` -- This unit changes overlapping stage contracts
and shared research-brief expectations, so one coordinated pass is safer than
parallel edits.

**Files:**
- Modify: `skills/references/research/activation-heuristics.md`
- Modify: `skills/references/research/source-ranking-and-synthesis.md`
- Modify: `skills/references/research/research-brief-contract.md`
- Modify: `skills/start/SKILL.md`
- Modify: `skills/start/agents/openai.yaml`
- Modify: `skills/ideate/SKILL.md`
- Modify: `skills/ideate/agents/openai.yaml`
- Modify: `skills/brainstorm/SKILL.md`
- Modify: `skills/brainstorm/agents/openai.yaml`
- Modify: `skills/review/SKILL.md`
- Modify: `skills/plan/SKILL.md`
- Modify: `skills/plan/agents/openai.yaml`
- Test: `evals/fw-review/cases.jsonl`
- Test: `evals/fw-review/rubric.md`
- Test: `evals/fw-ideate/cases.jsonl`
- Test: `evals/fw-brainstorm/cases.jsonl`
- Test: `evals/fw-plan/cases.jsonl`

**Test posture:** `tdd` -- These are stage-surface contract changes that must
stay visible through existing shaping and review evals.

**Approach:**
- Add clear consumer-target language so direct research returns a compact
  in-turn brief by default, while stage-embedded research defaults to a
  compact embedded note that sharpens the primary artifact.
- Make the embedded handback explicit: the caller stage should receive the key
  findings, source posture, and a recommendation it can use in its own
  shortlist, requirements, review verdict, or plan decisions.
- Add explicit heuristic activation rules for `start`, `ideate`,
  `brainstorm`, `review`, and `plan` so those stages can trigger or reuse
  research when unfamiliarity, freshness, standards, or weak precedent justify
  it, even if the user did not explicitly ask for research.
- Keep `docs/research/` reuse as the preferred first move when a fresh
  matching brief already exists.
- Keep persistence narrow: only save to `docs/research/` when reuse is likely,
  the topic is broad, or the user explicitly asked for a saved artifact.
- Add only lightweight lineage to the brief contract and keep it optional when
  it does not materially improve future trust or freshness decisions.
- Preserve the current review-time targeted lookup posture and make it fit the
  richer internal research library.

**Execution note:** Preserve helper-stage optionality. None of these stages
should start implying that research is mandatory before they can act.

**Patterns to follow:**
- `skills/references/research/research-brief-contract.md`
- `skills/review/SKILL.md`
- `skills/brainstorm/SKILL.md`

**Test scenarios:**
- `ideate` can use research to pressure-test options without turning the output
  into a research report.
- `brainstorm` can use research to sharpen requirements and tradeoffs while
  keeping the requirements doc primary.
- `review` can use targeted research support while keeping findings and verdict
  primary.
- `plan` can reuse briefs and add narrow follow-up research without drifting
  into detached report writing.
- `start` can still route directly to a stage while making it clear that the
  downstream stage may pull in heuristic research when warranted.
- Stages can trigger heuristic research on evidence-light or freshness-sensitive
  asks without implying that the user must explicitly request research first.
- Embedded research returns the details that matter plus a recommendation for
  the caller stage, and only persists when reuse is likely.

**Red signal:** `fw-review`, `fw-ideate`, `fw-brainstorm`, or `fw-plan` fail
because research becomes a route-away stage or stops reading as helper-first.

**Green signal:** Those suites still read as review, ideation, brainstorming,
or planning workflows even when research support is active.

**Verification:**
- `evals/fw-review/`, `evals/fw-ideate/`, `evals/fw-brainstorm/`, and
  `evals/fw-plan/` pass with the updated helper-first contract.

- [ ] **Unit 4: Expand eval and scorer coverage for persona and pack discipline**

**Goal:** Make the eval layer prove bounded persona selection, correct
source-pack activation, and helper-first embedded research behavior instead of
only generic mention of research.

**Requirements:** [R25, R26, R27, R28]

**Dependencies:** Unit 3

**Execution mode:** `parallel-ready` -- After the behavior contract is stable,
this unit stays within eval suites and scorers and does not need to modify the
skill docs themselves.

**Files:**
- Modify: `evals/research/manifest.json`
- Modify: `evals/research/cases.jsonl`
- Modify: `evals/research/rubric.md`
- Modify: `evals/fw-review/cases.jsonl`
- Modify: `evals/fw-review/rubric.md`
- Modify: `evals/fw-ideate/cases.jsonl`
- Modify: `evals/fw-ideate/rubric.md`
- Modify: `evals/fw-brainstorm/cases.jsonl`
- Modify: `evals/fw-brainstorm/rubric.md`
- Modify: `evals/fw-plan/cases.jsonl`
- Modify: `evals/fw-plan/rubric.md`
- Modify: `tools/evals/src/scoring/research.cjs`
- Modify: `tools/evals/src/scoring/fw-review.cjs`
- Modify: `tools/evals/src/scoring/fw-ideate.cjs`
- Modify: `tools/evals/src/scoring/fw-brainstorm.cjs`
- Modify: `tools/evals/src/scoring/fw-plan.cjs`
- Test: `evals/research/cases.jsonl`
- Test: `evals/fw-review/cases.jsonl`
- Test: `evals/fw-ideate/cases.jsonl`
- Test: `evals/fw-brainstorm/cases.jsonl`
- Test: `evals/fw-plan/cases.jsonl`

**Test posture:** `tdd` -- This unit is the regression surface for the whole
contract and should be driven by failing expectation changes first.

**Approach:**
- Add cases that distinguish baseline-only runs from richer source-pack runs.
- Score for bounded selection language, correct suppression under
  `no external research`, helper-first embedding in shaping and review, and
  ephemeral handback plus recommendation as the normal output.
- Keep scorer rules deterministic and section-aware rather than relying on
  generic keyword mentions.

**Execution note:** Do not create a second eval harness. Extend the current
  suite family additively.

**Patterns to follow:**
- `evals/research/*`
- `evals/fw-review/*`
- `tools/evals/src/scoring/research.cjs`
- `tools/evals/src/scoring/fw-review.cjs`

**Test scenarios:**
- Repo-only research does not imply rich external packs.
- Framework-guidance review cases show targeted support rather than route-away
  research.
- Shaping-stage cases still preserve their native artifact while acknowledging
  richer research support.
- Default research cases prefer handback plus recommendation over eager
  persistence.
- Persona and pack discipline is visible enough that over-eager fan-out would
  fail deterministically.

**Red signal:** The updated suites fail because bounded selection, suppression,
or helper-first embedding are not clearly expressed.

**Green signal:** The updated suites pass and would catch regression into
all-packs-by-default or standalone-report drift.

**Verification:**
- `evals/research/`
- `evals/fw-review/`
- `evals/fw-ideate/`
- `evals/fw-brainstorm/`
- `evals/fw-plan/`

- [ ] **Unit 5: Refresh docs and discovery copy without exposing internals**

**Goal:** Update discovery surfaces so the public documentation reflects the
strengthened helper capability without leaking internal persona or pack
implementation details into the user-facing contract.

**Requirements:** [R1, R2, R3]

**Dependencies:** Unit 3

**Execution mode:** `parallel-ready` -- This unit touches docs and manifests
only and can run alongside eval work once the stage contract is stable.

**Files:**
- Modify: `README.md`
- Modify: `.codex-plugin/plugin.json`
- Modify: `plugins/flywheel/.codex-plugin/plugin.json`

**Test posture:** `tdd` -- These discovery surfaces are part of the public
contract and already covered by broad verification.

**Approach:**
- Keep the public message focused on one helper-first `research` surface.
- Clarify that research sharpens ideation, brainstorming, review, and planning.
- Avoid exposing internal persona, pack, or loading-guide details in public
  discovery copy.

**Execution note:** Public docs should describe product behavior, not internal
  prompt architecture.

**Patterns to follow:**
- `README.md`
- `.codex-plugin/plugin.json`

**Test scenarios:**
- Discovery copy still points users to one `research` helper.
- README workflow guidance preserves the compact visible loop.
- Plugin prompts stay accurate after the richer internal architecture lands.

**Red signal:** Broad verification or discovery-copy evals fail because public
  docs imply new visible stages or internal implementation details as user
  contract.

**Green signal:** Public discovery surfaces still read cleanly and accurately
  after the internal refactor.

**Verification:**
- `make verify`
