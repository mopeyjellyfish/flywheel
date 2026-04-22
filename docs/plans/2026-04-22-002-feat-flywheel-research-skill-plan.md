---
title: Flywheel Research Skill Plan
type: feat
status: completed
date: 2026-04-22
origin: docs/brainstorms/2026-04-22-flywheel-research-skill-requirements.md
---

# Flywheel Research Skill Plan

## Overview

This plan adds a first-class `flywheel:research` helper skill and wires it into
the shaping half of Flywheel so topic investigation, current-practice
discovery, and ranked evidence gathering become reusable product behavior
instead of scattered stage-local heuristics.

The target outcome is:

- one direct-call `flywheel:research` helper skill
- a shared research reference pack for activation, source ranking, synthesis,
  and durable brief shape
- a new `docs/research/` convention for reusable research briefs with explicit
  freshness and source-scope metadata
- `flywheel:start` routing plus `ideate`, `brainstorm`, and `plan`
  integrations that can proactively trigger or reuse research without turning
  research into a mandatory visible backbone stage
- additive eval coverage for direct research behavior and proactive activation
  inside shaping stages

## Problem Frame

Flywheel already performs some repo grounding and selective web research inside
`skills/ideate/SKILL.md`, `skills/brainstorm/SKILL.md`, and
`skills/plan/SKILL.md`, but that behavior is fragmented. There is no single
research surface, no durable reusable research artifact, and no clear product
contract for when frontier-model research should stay serial, when it can run
in parallel, and how findings should be ranked and carried forward.

The implementation goal is not to add another required visible stage. The goal
is to make fuzzy topic work and current-practice discovery sharper by adding a
proper helper skill and reusable artifact contract that shaping stages can
invoke or consume on the user's behalf.

See origin:
`docs/brainstorms/2026-04-22-flywheel-research-skill-requirements.md`.

## Requirements Trace

- R1-R5. Provide a direct-call `flywheel:research` surface, route to it from
  `start`, and allow proactive research activation inside shaping while keeping
  research out of the mandatory visible backbone.
- R6-R10. Use host-native question tooling sparingly, decompose broad topics,
  research on the user's behalf when the topic is clear enough, and honor
  explicit opt-outs from external research.
- R11-R21. Distinguish repo grounding from external research, rank evidence by
  source quality and freshness, keep claims traceable, and default to simple
  research architecture with bounded parallelism only where it earns its keep.
- R22-R28. Make `ideate`, `brainstorm`, and `plan` able to reuse durable
  research briefs, while keeping narrow one-off research ephemeral.
- R29-R32. Add eval coverage for direct research behavior and proactive
  in-stage activation across Codex, Claude Code, and similar hosts.

## Scope Boundaries

- Do not add a new mandatory visible `research` stage to the public
  `shape -> work -> review -> commit -> spin` backbone.
- Do not integrate research into `work`, `review`, `commit`, or `spin` in this
  first pass.
- Do not build a vector store, retrieval platform, or scheduled research
  refresh system.
- Do not require multi-agent orchestration for ordinary research topics.
- Do not treat saved research briefs as permanent truth; freshness checks and
  targeted follow-up research remain required.

### Deferred to Separate Tasks

- Research-aware `deepen` integration after the first shaping-stage pass proves
  stable.
- Research reuse inside `work`, `review`, `commit`, or `spin`.
- Additional non-web evidence sources such as dedicated Slack or issue-tracker
  connectors beyond the current host/tool surfaces.
- Automated research-brief refresh or staleness remediation workflows.

## Context & Research

### Relevant Code and Patterns

- `skills/start/SKILL.md` already routes helper-class surfaces without adding
  them to the visible backbone, and the repo solution doc
  `docs/solutions/developer-experience/use-flywheel-start-as-the-router-entrypoint-2026-04-19.md`
  reinforces keeping helper surfaces discoverable without bloating the router.
- `skills/ideate/SKILL.md` already performs repo grounding and conditional web
  research, making it the clearest existing seam for proactive research
  activation before candidate generation.
- `skills/brainstorm/SKILL.md` already supports repo verification, conditional
  Slack research, document review, and durable requirements capture, making it
  the right place to integrate research-backed shaping rather than inventing a
  parallel stage.
- `skills/plan/SKILL.md` already requires local research, conditional external
  research, and reusable planning artifacts, so it can consume prior research
  briefs instead of restarting from scratch.
- `skills/references/host-interaction-contract.md` already defines host-native
  question tooling and bounded delegation rules, which should stay the source
  of truth for research intake and parallel-research posture.
- `AGENTS.md` currently standardizes `docs/brainstorms/`, `docs/ideation/`,
  `docs/plans/`, `docs/setup/`, and `docs/solutions/`, but it does not yet
  define a home for durable research briefs.
- `.codex-plugin/plugin.json` and `plugins/flywheel/.codex-plugin/plugin.json`
  are the current Codex-facing discovery surfaces for helper-surface prompts.
- `tools/evals/src/scoring/index.cjs` already registers direct helper-skill and
  stage-suite scorers additively, so the research work can follow the same
  pattern without eval-harness redesign.
- Existing eval surfaces that matter here are:
  - `evals/flywheel/`
  - `evals/fw-ideate/`
  - `evals/fw-brainstorm/`
  - `evals/fw-plan/`

### Institutional Learnings

- `docs/solutions/developer-experience/use-flywheel-start-as-the-router-entrypoint-2026-04-19.md`
  reinforces keeping helper skills direct-callable while preserving
  `$flywheel:start` as the canonical router.
- `docs/solutions/developer-experience/journey-evals-without-a-harness-redesign-2026-04-19.md`
  reinforces additive suite growth over building a second evaluation system.
- `docs/solutions/operational-guidance/shared-evidence-bundle-for-stage-handoffs-2026-04-19.md`
  reinforces keeping durable reusable summaries separate from raw local
  artifacts; the same principle should shape research briefs.

### External References

- Anthropic, *Building effective agents*:
  https://www.anthropic.com/engineering/building-effective-agents
- Anthropic, *How we built our multi-agent research system*:
  https://www.anthropic.com/engineering/multi-agent-research-system
- OpenAI API docs, *Deep research*:
  https://developers.openai.com/api/docs/guides/deep-research
- OpenAI API docs, *Retrieval*:
  https://developers.openai.com/api/docs/guides/retrieval
- OpenAI, *BrowseComp: a benchmark for browsing agents*:
  https://openai.com/index/browsecomp/
- Google Cloud, *Choose a design pattern for your agentic AI system*:
  https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system

## Architecture and Pattern Decisions

- **Use a helper skill, not a new backbone stage.** The chosen direction is a
  direct-call `flywheel:research` helper plus stage-local activation rules in
  `start`, `ideate`, `brainstorm`, and `plan`. Rejected alternative:
  promoting research to a mandatory always-visible stage, which would weaken
  Flywheel's compact loop and contradict the origin requirements.
- **Store durable research in `docs/research/`.** The chosen direction is a
  new docs surface distinct from `docs/ideation/`, `docs/brainstorms/`, and
  `docs/plans/`, because research briefs are reusable evidence inputs rather
  than idea shortlists, requirements docs, or implementation plans. Rejected
  alternatives: overloading `docs/ideation/` or `docs/brainstorms/`, which
  would conflate evidence gathering with product-definition artifacts.
- **Use one shared research reference pack.** The chosen direction is shared
  references under `skills/references/research/` so `research`, `ideate`,
  `brainstorm`, and `plan` can reuse one contract for activation heuristics,
  source ranking, and brief shape. Rejected alternative: duplicating long
  research doctrine independently into each stage skill.
- **Default to serial or single-agent research.** The chosen direction is
  single-agent or inline research by default, with bounded parallel research
  only for broad topics that decompose cleanly into independent threads.
  Rejected alternative: multi-agent-by-default research, which adds cost,
  coordination risk, and synthesis complexity too early.
- **Keep the first pass scoped to shaping.** The chosen direction is to improve
  routing and shaping first, with `work`/`review`/`commit`/`spin` integrations
  explicitly deferred. Rejected alternative: a whole-workflow research sweep in
  the first implementation, which would broaden scope without a proven shaping
  contract.
- **Use additive evals instead of a dedicated research harness.** The chosen
  direction is one direct `research` suite plus updates to `flywheel`,
  `fw-ideate`, `fw-brainstorm`, and `fw-plan`. Rejected alternative: a new
  standalone workflow benchmark family before the direct and stage suites prove
  the contract.

## Testing Strategy

- **Project testing idioms:** This repo's primary regression surface is the
  eval harness under `evals/` and `tools/evals/src/scoring/`, with `make verify`
  as the broad validation entrypoint. The active repo instructions also require
  contract sweeps across `skills/`, manifests, docs, and evals when a
  user-facing command surface changes.
- **Posture selection rule:** Use `tdd` for every implementation unit because
  each unit changes visible skill behavior, routing behavior, or repo contract
  surfaces that are already represented in the eval harness.
- **Plan-level posture mix:** Units 1-4 all use `tdd`; there is no meaningful
  `characterization` or `no-new-tests` slice here because direct skill
  behavior, routing, and shaping integration are all externally visible
  product behavior.
- **Material hypotheses:**
  - A direct `flywheel:research` skill with a ranked research-brief contract
    will produce more useful outputs than today's scattered stage-local web
    research prose.
  - `flywheel:start` can route to research directly without weakening the
    compact visible backbone.
  - `ideate`, `brainstorm`, and `plan` can become more grounded by reusing or
    proactively triggering research instead of duplicating large report output.
  - Serial-by-default research with bounded parallel activation will be more
    reliable and cheaper than a multi-agent default.
- **Red -> green proof points:**
  - Red: `research` eval cases fail because the skill does not exist, does not
    rank evidence, or does not distinguish fact from inference.
  - Red: `flywheel` router cases fail because `start` does not surface
    `research` correctly or over-routes fuzzy shaping tasks away from
    `ideate`/`brainstorm`.
  - Red: `fw-ideate`, `fw-brainstorm`, or `fw-plan` cases fail because the
    stages ignore reusable research, do not proactively trigger research when
    warranted, or violate user opt-outs from external research.
  - Green: direct and stage suites pass with helper-surface discovery intact,
    research artifact reuse visible, and no regression into mandatory research
    ceremony.
- **Tooling assumption:** Reuse the current eval harness and deterministic
  scorer registration. Let later execution discover the exact command path via
  repo instructions rather than hardcoding shell steps into the plan.
- **Public contracts to protect:**
  - the visible `shape -> work -> review -> commit -> spin` backbone
  - helper-surface optionality
  - host-native question tooling via the shared interaction contract
  - repo-relative docs conventions and skill references
  - source traceability, freshness signaling, and explicit uncertainty in
    research output
- **Primary test surfaces:**
  - `evals/research/`
  - `evals/flywheel/`
  - `evals/fw-ideate/`
  - `evals/fw-brainstorm/`
  - `evals/fw-plan/`
- **Test patterns to mirror:**
  - helper-skill suite structure already used by
    `evals/architecture-strategy/`, `evals/maintainability/`, and
    `evals/simplify/`
  - router-suite expectations in `evals/flywheel/`
  - shaping-stage scorer structure in
    `tools/evals/src/scoring/fw-ideate.cjs`,
    `tools/evals/src/scoring/fw-brainstorm.cjs`, and
    `tools/evals/src/scoring/fw-plan.cjs`

## Dependencies And Parallelism

- **Critical path:** Unit 1 -> Unit 2 -> Unit 3/Unit 4 -> finish
- **Parallel-ready sets:** After Unit 2 establishes the research contract and
  router/discovery posture, Units 3 and 4 may run in parallel because they
  touch disjoint stage surfaces (`ideate` versus `brainstorm`/`plan`) and only
  read the shared research refs from Unit 1.
- **Serial-only units:** Unit 1 and Unit 2 must stay serial because they
  establish shared research refs, docs conventions, and router/discovery
  surfaces that later stage integrations depend on.

## Open Questions

### Resolved During Planning

- **Where should durable research artifacts live?** Use `docs/research/` with
  a lightweight frontmatter contract instead of overloading `docs/ideation/`,
  `docs/brainstorms/`, or `docs/plans/`.
- **What should the reusable research brief contain?** Require enough metadata
  for later reuse and freshness checks, including topic, date or last-verified
  signal, source scope or policy, plus sections for ranked findings, source
  notes, conflicts or open questions, and reuse guidance.
- **How should parallel research be triggered initially?** Default to inline or
  serial research; allow bounded parallel research only when the topic has
  clearly independent subquestions and the active host policy allows it.
- **Which eval suites should own research behavior?** Use one direct
  `research` suite plus updates to `flywheel`, `fw-ideate`, `fw-brainstorm`,
  and `fw-plan`.

### Deferred to Implementation

- **Exact metadata names for the research brief frontmatter:** keep the contract
  lightweight during implementation as long as topic, freshness, and source
  scope remain explicit and searchable.
- **Whether `deepen` should consume research briefs in a later pass:** not part
  of the first shaping-focused implementation.
- **Whether topic-specific freshness windows should differ by domain:** start
  with a generic freshness check and tune thresholds through eval iteration.

## Output Structure

```text
docs/
  research/
    .gitkeep
skills/
  research/
    SKILL.md
    agents/
      openai.yaml
  references/
    research/
      activation-heuristics.md
      research-brief-contract.md
      source-ranking-and-synthesis.md
evals/
  research/
    manifest.json
    cases.jsonl
    rubric.md
tools/
  evals/
    src/
      scoring/
        research.cjs
```

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification.*

```text
User asks for topic research OR shaping stage detects freshness/uncertainty gap
  -> `start` routes to `flywheel:research` directly when research is the
     earliest missing stage
  -> otherwise `ideate` / `brainstorm` / `plan` load shared research rules
     and decide whether to:
       - reuse a matching fresh brief from `docs/research/`
       - run targeted follow-up research
       - skip external research when repo truth or user constraints make it unnecessary

`flywheel:research`
  -> clarify only when a short question materially improves scope
  -> gather repo and/or external evidence
  -> rank findings by relevance, source quality, freshness, and confidence
  -> separate facts, inferences, and open questions
  -> optionally persist a reusable brief in `docs/research/`

Shaping stages
  -> consume the brief as grounding input
  -> continue producing their native artifact:
       `ideate` -> shortlist
       `brainstorm` -> requirements doc
       `plan` -> implementation plan
```

## Implementation Units

- [x] **Unit 1: Establish the research helper, shared refs, and brief contract**

**Goal:** Create the direct-call `flywheel:research` skill, the shared
research reference pack, the durable brief contract, and the direct eval
surface.

**Requirements:** [R1, R6-R21, R25-R30, R32]

**Dependencies:** None

**Execution mode:** `serial` -- This unit establishes the shared contract that
all later routing and stage integrations depend on.

**Files:**
- Create: `skills/research/SKILL.md`
- Create: `skills/research/agents/openai.yaml`
- Create: `skills/references/research/activation-heuristics.md`
- Create: `skills/references/research/research-brief-contract.md`
- Create: `skills/references/research/source-ranking-and-synthesis.md`
- Create: `docs/research/.gitkeep`
- Create: `tools/evals/src/scoring/research.cjs`
- Modify: `tools/evals/src/scoring/index.cjs`
- Modify: `evals/README.md`
- Test: `evals/research/manifest.json`
- Test: `evals/research/cases.jsonl`
- Test: `evals/research/rubric.md`

**Test posture:** `tdd` -- This is a new user-callable helper whose output
shape and evidence-ranking contract should be locked down by a direct suite
before stage integrations depend on it.

**Approach:**
- Model the direct helper on existing focused Flywheel helpers: narrow remit,
  explicit suppressions, and reusable references instead of one giant prompt.
- Keep research output structured around ranked findings, source notes,
  uncertainty, and reuse guidance rather than long narrative report text.
- Treat persistence as conditional: the skill should write a durable brief only
  when the topic is broad enough, likely to recur, or explicitly requested.
- Encode serial-by-default research posture in the helper contract and shared
  refs; parallel research remains conditional guidance, not the default path.

**Execution note:** Keep the initial research brief contract lightweight and
text-first. Do not expand this unit into retrieval infrastructure or scheduled
refresh logic.

**Patterns to follow:**
- `skills/observability/SKILL.md`
- `skills/architecture-strategy/SKILL.md`
- `skills/references/host-interaction-contract.md`
- `tools/evals/src/scoring/maintainability.cjs`

**Test scenarios:**
- Direct `flywheel:research` asks a narrow clarifying question only when scope
  or source choice would materially improve the result.
- The output ranks findings by relevance, source quality, freshness, and
  confidence instead of dumping unordered sources.
- The output distinguishes established facts, model inferences, and open
  questions.
- Durable briefs carry reusable metadata and source-scope signals.
- Parallel research is described as conditional for independent threads, not as
  the default architecture.

**Red signal:** `evals/research/` fails because the skill is missing, produces
flat source dumps, or omits source ranking and uncertainty signaling.

**Green signal:** The new `research` suite passes with a narrow,
evidence-backed, reusable research-brief contract.

**Verification:**
- `tools/evals/src/scoring/index.cjs` resolves the new `research` suite
  without harness errors.
- `docs/research/` exists as a repo-visible durable artifact surface.

- [x] **Unit 2: Add router, docs, and plugin-surface discovery for research**

**Goal:** Make `flywheel:research` discoverable and routable without promoting
it into a mandatory visible workflow stage.

**Requirements:** [R1-R5, R25-R28, R31-R32]

**Dependencies:** Unit 1

**Execution mode:** `serial` -- This unit establishes the user-facing command
surface and docs convention the shaping-stage integrations must align to.

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `skills/start/SKILL.md`
- Modify: `skills/start/agents/openai.yaml`
- Modify: `.codex-plugin/plugin.json`
- Modify: `plugins/flywheel/.codex-plugin/plugin.json`
- Modify: `tools/evals/src/scoring/flywheel.cjs`
- Test: `evals/flywheel/cases.jsonl`
- Test: `evals/flywheel/rubric.md`

**Test posture:** `tdd` -- Router behavior and helper-surface discovery are
visible product behavior and should be protected before wording changes land.

**Approach:**
- Add `flywheel:research` as a helper-class surface in docs and router rules,
  alongside the existing focused helpers.
- Extend the repo docs convention so durable research briefs have one canonical
  home under `docs/research/`.
- Route to `research` when the immediate job is topic investigation, current
  best-practice discovery, or evidence gathering before requirements or
  planning.
- Keep fuzzy product-definition requests routed to `ideate` or `brainstorm`
  when those remain the real artifacts, with research treated as a helper or
  earliest missing stage only when that is genuinely true.

**Execution note:** Preserve the compact backbone in all user-facing docs.
Research should read as an optional helper surface, not a new default step.

**Patterns to follow:**
- `docs/solutions/developer-experience/use-flywheel-start-as-the-router-entrypoint-2026-04-19.md`
- `README.md`
- `skills/start/SKILL.md`

**Test scenarios:**
- `start` routes direct research requests to `flywheel:research`.
- `start` still routes vague feature shaping to `ideate` or `brainstorm` when
  those are the correct artifacts.
- The docs convention explicitly names `docs/research/`.
- Codex plugin prompts mention `research` as a helper without changing the
  visible backbone summary.

**Red signal:** `evals/flywheel/` fails because the router never selects
`research`, over-selects it, or the helper appears as a new mandatory stage.

**Green signal:** Router and discovery surfaces pass with `research`
discoverable, helper-class, and correctly bounded.

**Verification:**
- `README.md`, `AGENTS.md`, and the Codex plugin manifests describe compatible
  command-surface behavior.

- [x] **Unit 3: Integrate research activation and reuse into ideation**

**Goal:** Let `ideate` proactively trigger research when current external
signals matter and reuse fresh research briefs when they already exist.

**Requirements:** [R4-R5, R8-R10, R11-R18, R21-R28, R31-R32]

**Dependencies:** Unit 1, Unit 2

**Execution mode:** `parallel-ready` -- After the shared contract and router
surface land, this unit is independent of the `brainstorm`/`plan` write set
and can be executed concurrently with Unit 4 after a fresh overlap check.

**Files:**
- Modify: `skills/ideate/SKILL.md`
- Modify: `skills/ideate/agents/openai.yaml`
- Modify: `tools/evals/src/scoring/fw-ideate.cjs`
- Test: `evals/fw-ideate/cases.jsonl`
- Test: `evals/fw-ideate/rubric.md`

**Test posture:** `tdd` -- Ideation grounding quality and research activation
are behavior-bearing and already represented in the existing ideation suite.

**Approach:**
- Teach `ideate` to search `docs/research/` by topic and reuse a matching
  fresh brief before launching new external research.
- When a fresh brief is absent and external context would materially improve the
  idea shortlist, have `ideate` proactively invoke the research path or state
  that it is doing so on the user's behalf.
- Preserve opt-out behavior for `no external research` constraints.
- Keep ideation outputs shortlist-first; research should improve candidate
  quality, not replace ideation with a report.

**Execution note:** Reuse only when the brief is still in-scope and fresh
enough; otherwise trigger targeted follow-up research rather than trusting old
material blindly.

**Patterns to follow:**
- `skills/ideate/SKILL.md`
- `skills/references/research/activation-heuristics.md`
- `skills/references/research/research-brief-contract.md`

**Test scenarios:**
- Repo-grounded ideation uses a matching research brief when current practice
  or unfamiliar territory would otherwise force broad web browsing.
- Outside-repo software ideation proactively researches on the user's behalf by
  default unless external research is explicitly disabled.
- Ideation still returns a ranked shortlist rather than a generic research
  report.
- Opt-outs from external research are honored cleanly.

**Red signal:** `fw-ideate` cases fail because ideation ignores reusable
research, does not proactively gather research when needed, or regresses into
report output instead of idea filtering.

**Green signal:** `fw-ideate` passes with sharper grounding, explicit research
activation, and preserved shortlist behavior.

**Verification:**
- Ideation outputs visibly reference research as grounding when used, but the
  final artifact remains an ideation shortlist.

- [x] **Unit 4: Integrate research activation and reuse into brainstorm and plan**

**Goal:** Let `brainstorm` and `plan` use research briefs as reusable shaping
inputs, proactively run research when the problem is fuzzy or current-practice
dependent, and avoid re-running full research unnecessarily.

**Requirements:** [R4-R5, R6-R15, R17-R24, R27-R32]

**Dependencies:** Unit 1, Unit 2

**Execution mode:** `parallel-ready` -- After the shared research contract and
router posture are established, this unit is independent of the `ideate` write
set and can run alongside Unit 3.

**Files:**
- Modify: `skills/brainstorm/SKILL.md`
- Modify: `skills/brainstorm/agents/openai.yaml`
- Modify: `skills/plan/SKILL.md`
- Modify: `skills/plan/agents/openai.yaml`
- Modify: `tools/evals/src/scoring/fw-brainstorm.cjs`
- Modify: `tools/evals/src/scoring/fw-plan.cjs`
- Test: `evals/fw-brainstorm/cases.jsonl`
- Test: `evals/fw-brainstorm/rubric.md`
- Test: `evals/fw-plan/cases.jsonl`
- Test: `evals/fw-plan/rubric.md`

**Test posture:** `tdd` -- Brainstorming and planning behavior changes are
visible, artifact-bearing, and already protected by stage suites.

**Approach:**
- Teach `brainstorm` to check for a matching research brief before extended
  dialogue when the topic is fuzzy, unfamiliar, or dependent on current
  published information.
- Require `brainstorm` to say plainly when it is doing extra research on the
  user's behalf and why that pass is worth the cost.
- Teach `plan` to treat matching research briefs as reusable auxiliary input,
  then run only targeted follow-up research when gaps remain rather than
  starting from zero.
- Keep `plan` read-only and artifact-focused; research should strengthen the
  plan, not turn the planning stage into report-writing or implementation.

**Execution note:** Preserve the native artifacts for each stage: requirements
  docs from `brainstorm` and implementation plans from `plan`.

**Patterns to follow:**
- `skills/brainstorm/SKILL.md`
- `skills/plan/SKILL.md`
- `skills/references/research/source-ranking-and-synthesis.md`

**Test scenarios:**
- `brainstorm` proactively researches on the user's behalf when a fuzzy or
  current-practice-heavy topic would otherwise produce weak requirements.
- `brainstorm` still exits with a requirements artifact, not a standalone
  research report.
- `plan` reuses fresh research briefs and only runs targeted follow-up
  research when needed.
- `plan` keeps repo truth, external findings, and deferred implementation
  unknowns distinct.

**Red signal:** `fw-brainstorm` or `fw-plan` cases fail because research reuse
is absent, proactive research never triggers, or the stage artifacts drift into
report-style outputs.

**Green signal:** `fw-brainstorm` and `fw-plan` pass with explicit research
reuse, proactive activation where warranted, and preserved stage artifacts.

**Verification:**
- Requirements and plan outputs cite research grounding when used, while
  keeping the planning boundary intact.

## System-Wide Impact

- **Interaction graph:** `start` may route into `research`; `research` may
  write `docs/research/*`; `ideate`, `brainstorm`, and `plan` may read those
  briefs and optionally trigger targeted follow-up research before producing
  their native artifacts.
- **Error propagation:** stale or weak research must degrade into explicit
  follow-up research or warning labels, not silent confidence.
- **State lifecycle risks:** saved research briefs can become stale; the brief
  contract must therefore carry freshness signals and reuse guidance.
- **API surface parity:** Codex-facing discovery prompts and shared
  cross-host skill guidance must teach the same helper-class research story.
- **Integration coverage:** direct research behavior plus router and shaping
  suites must all validate the contract; direct-suite coverage alone is not
  enough.
- **Unchanged invariants:** the visible backbone stays compact; `work`,
  `review`, `commit`, and `spin` are unchanged in this first pass.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `research` starts behaving like a mandatory visible stage | Keep router and README language explicit that it is a helper surface and verify that behavior in `evals/flywheel/` |
| Durable briefs become stale and mislead later shaping | Require freshness metadata, reuse guidance, and targeted follow-up research when the brief is old or out of scope |
| Research outputs become long generic reports instead of decision-support artifacts | Encode ranked findings, source-quality rules, and restraint expectations in the direct `research` suite |
| Parallel research adds cost and synthesis complexity without value | Keep serial or single-agent research as the default and gate parallelism behind independent-thread heuristics |
| Cross-host question UX drifts inside research flows | Reuse `skills/references/host-interaction-contract.md` instead of inventing research-specific interaction doctrine |

## Documentation / Operational Notes

- Update `AGENTS.md` so the repo's docs convention explicitly includes
  `docs/research/`.
- Update `README.md` and the Codex plugin prompt surfaces so users can discover
  `flywheel:research` without mistaking it for a new backbone stage.
- No new runtime dependencies or installation surfaces are expected; the
  implementation should stay within the current skill, docs, and eval
  packaging model.

## Sources & References

- **Origin document:** `docs/brainstorms/2026-04-22-flywheel-research-skill-requirements.md`
- Related code: `skills/start/SKILL.md`
- Related code: `skills/ideate/SKILL.md`
- Related code: `skills/brainstorm/SKILL.md`
- Related code: `skills/plan/SKILL.md`
- Related code: `tools/evals/src/scoring/index.cjs`
- Related docs: `docs/solutions/developer-experience/use-flywheel-start-as-the-router-entrypoint-2026-04-19.md`
- Related docs: `docs/solutions/developer-experience/journey-evals-without-a-harness-redesign-2026-04-19.md`
- External docs: `https://www.anthropic.com/engineering/building-effective-agents`
- External docs: `https://www.anthropic.com/engineering/multi-agent-research-system`
- External docs: `https://developers.openai.com/api/docs/guides/deep-research`
- External docs: `https://developers.openai.com/api/docs/guides/retrieval`
- External docs: `https://openai.com/index/browsecomp/`
- External docs: `https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system`
