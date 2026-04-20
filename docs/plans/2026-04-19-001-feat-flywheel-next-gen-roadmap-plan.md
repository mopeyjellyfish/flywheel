---
title: Flywheel Next-Gen Roadmap Implementation Plan
type: feat
status: completed
date: 2026-04-19
origin: docs/brainstorms/2026-04-19-flywheel-next-gen-roadmap-requirements.md
---

# Flywheel Next-Gen Roadmap Implementation Plan

## Overview

This plan turns the next-gen Flywheel roadmap into a phased implementation
program. The main objective is not feature count. It is to make Flywheel the
strongest workflow for frontier-model-assisted engineering on services and
distributed-system-adjacent repositories by adding the missing operational
control plane and the missing product shell around the existing workflow.

The work centers on six outcomes:

1. explicit repo-local workflow policy controls
2. a more complete setup, doctor, install, and recovery story
3. a unified evidence bundle across proof-producing stages
4. a first-class rollout workflow for risky runtime changes
5. a first-class incident workflow for production issues
6. end-to-end scenario evals that score whole developer journeys

## Problem Frame

Flywheel already has a strong core loop and unusually good attention to repo
truth, observability, logging, and durable lessons. The main weaknesses are
outside the center of the loop:

- no dedicated rollout or change-management workflow for runtime-risky changes
- no dedicated incident workflow that starts from runtime evidence
- no unified evidence artifact that shipping can consume
- no fully productized setup and recovery shell
- no end-to-end eval story for whole workflows

Those gaps matter more for Flywheel's target domain than broad host support or
extra editor packaging. The plan therefore prioritizes service-engineering
leverage and product polish over marketplace breadth. See origin:
`docs/brainstorms/2026-04-19-flywheel-next-gen-roadmap-requirements.md`.

## Requirements Trace

- R1. Optimize for frontier-model-assisted engineering on services, APIs, jobs,
  queues, and distributed-system-adjacent repositories.
- R2. Stay Codex- and Claude Code-first for now.
- R3. Preserve progressive disclosure and low context pollution.
- R4. Add a first-class rollout workflow for runtime-risky changes.
- R5. Add a first-class incident workflow for production issues.
- R6. Support repo-local strict workflow policies for risky work.
- R7. Standardize a unified evidence bundle across proof-producing stages.
- R8. Productize setup, doctor, install, upgrade, and troubleshooting surfaces.
- R9. Add end-to-end scenario evals for key workflows.
- R10. Avoid always-loaded global instructions, mandatory ceremony for trivial
  work, and host-breadth work that dilutes the main workflow.

## Scope Boundaries

- Broad multi-host packaging is out of scope for this implementation pass.
- Do not add an always-loaded plugin-wide instruction file.
- Do not hard-force TDD, browser proof, or runtime validation for all work;
  strictness must stay policy-driven.
- Do not rewrite existing core skills from scratch when targeted extension is
  enough.

### Deferred to Separate Tasks

- Broader non-Codex / non-Claude packaging and marketplace polish: revisit
  after the workflow and product shell are stronger.
- Deep telemetry-provider-specific expansions beyond current repo-supported
  Datadog and OTel surfaces: treat as follow-on stack-pack growth.

## Context & Research

### Relevant Code and Patterns

- `README.md` already positions Flywheel around service and distributed-system
  engineering, plus setup and support workflows.
- `skills/start/SKILL.md` is the router and should stay thin, explicit, and
  artifact-forward.
- `skills/setup/SKILL.md` already contains the right posture for repo truth,
  local config, and recovery, but needs more productized outputs and doctor
  posture.
- `skills/work/SKILL.md` already carries runtime blast-radius and repo-truth
  guidance that rollout and strict policy work should extend rather than
  duplicate.
- `skills/review/SKILL.md` already has lazy-loading reviewer and stack-pack
  infrastructure that should remain the extensibility model.
- `skills/ship/SKILL.md` already requires operational validation notes and
  evidence hygiene, making it the natural evidence-bundle consumer.
- `skills/debug/SKILL.md` already enforces evidence-before-fix discipline and
  should become the main downstream integration point for incident work.
- `.flywheel/config.local.example.yaml` is the current durable local config
  surface.
- `scripts/flywheel-eval.js`, `tools/evals/`, and `evals/*` are the current
  validation infrastructure and should be extended rather than replaced.

### Institutional Learnings

- No relevant `docs/solutions/` entries were present during repo scan.

### External References

- None required for planning beyond the origin document and current repo state.

## Key Technical Decisions

- **Add `fw-rollout` and `fw-incident` as explicit skills**: these are distinct
  enough to deserve named workflows instead of hiding inside `fw-ship` or
  `fw-debug`.
- **Keep strictness in local config**: policy overlays belong in
  `.flywheel/config.local.yaml` and the setup template, not as unconditional
  workflow mandates.
- **Use a shared evidence contract, not stage-specific ad hoc notes**:
  `fw-browser-test`, `fw-review`, `fw-optimize`, and
  `verification-before-completion` should produce compatible evidence that
  `fw-ship` can consume.
- **Productize setup through existing surfaces first**: extend `fw-setup`,
  durable local config, repo docs, and a small doctor surface rather than
  building a large separate installation subsystem.
- **Make scenario evals the main regression surface for workflow behavior**:
  skill text is the product, so prompt-eval and scenario-eval coverage should
  be treated as first-class tests.

## Testing Strategy

- **Project testing idioms:** Flywheel's primary regression surface is the eval
  harness under `scripts/flywheel-eval.js`, `tools/evals/`, and `evals/*`.
  Skill correctness is primarily protected by eval suites, suite validation,
  doctor checks, and targeted artifact generation checks rather than
  application-runtime tests.
- **Posture selection rule:** Use `tdd` when adding or materially changing
  workflow behavior that can be proven with eval cases or harness checks. Use
  `characterization` when first capturing existing workflow behavior before
  tightening it. Use `no-new-tests` only for truly documentary or mechanical
  follow-through that does not change behavior-bearing skill surfaces.
- **Plan-level posture mix:** Most units should use `tdd` via new or expanded
  eval packs because they introduce new skill surfaces or orchestration
  behavior. Documentation-only follow-through may use `no-new-tests` only when
  the behavior has already been covered by the same unit's eval additions.
- **Material hypotheses:**
  - A dedicated rollout skill will improve runtime-risky change handling
    without bloating `fw-ship`.
  - A dedicated incident skill will let production issues start from runtime
    evidence and still route back into the main Flywheel loop cleanly.
  - A small set of strict local policy keys can strengthen risky work without
    forcing trivial work into excess ceremony.
  - A shared evidence bundle can reduce repeated proof capture and sharpen PR
    quality.
  - Scenario evals can represent whole journeys without breaking the current
    per-skill eval model.
- **Red -> green proof points:** For each new skill or behavior-bearing
  workflow change, add eval cases that fail against the current skill wording or
  harness shape, then update the skill or harness until those cases pass.
- **Tooling assumption:** Assume the existing eval harness, suite validation,
  and doctor surfaces remain the main verification path. Let implementation use
  repo-owned validation surfaces rather than inventing a separate test runner.
- **Public contracts to protect:** skill names, repo-relative path discipline,
  lazy-loading posture, `fw:setup` bootstrap expectations, `fw:ship` evidence
  and monitoring expectations, and the current Codex / Claude install story.
- **Primary test surfaces:** `evals/*`, `tools/evals/*`, durable artifact
  generation under `.context/flywheel-evals-*`, and targeted documentation
  review for new workflow surfaces.
- **Test patterns to mirror:** existing per-skill eval packs, scoring registry
  extensions under `tools/evals/src/scoring/`, and the current doctor and
  prepare flows in the eval harness.

## Open Questions

### Resolved During Planning

- Should rollout and incident work be standalone skills or hidden sub-modes?
  Standalone skills. The behavior is large enough and important enough to merit
  explicit routing and its own eval surfaces.
- Should strict workflow policies be global or local? Local. Repo- and
  machine-local policy overlays are the right control surface.
- Should scenario validation replace current prompt evals? No. Scenario evals
  should extend the current harness, not replace per-skill coverage.

### Deferred to Implementation

- Exact strict-policy key names and nesting in `.flywheel/config.local.yaml`.
- Final evidence bundle path and whether one shared template or multiple
  producers with a common schema are easier to maintain.
- Whether a top-level doctor wrapper should be a small new script or a surfaced
  alias around existing checks.
- Final scenario-eval directory naming and whether grouped journeys need new
  harness metadata fields.

## Output Structure

    .flywheel/
      config.local.example.yaml
    docs/
      brainstorms/
        2026-04-19-flywheel-next-gen-roadmap-requirements.md
      plans/
        2026-04-19-001-feat-flywheel-next-gen-roadmap-plan.md
      setup/
        compatibility.md
        troubleshooting.md
    evals/
      fw-rollout/
      fw-incident/
      flywheel-runtime-change/
      flywheel-incident-response/
    scripts/
      flywheel-doctor.js
    skills/
      flywheel/SKILL.md
      fw-setup/SKILL.md
      fw-work/SKILL.md
      fw-review/SKILL.md
      fw-ship/SKILL.md
      fw-debug/SKILL.md
      fw-run/SKILL.md
      fw-browser-test/SKILL.md
      fw-optimize/SKILL.md
      verification-before-completion/SKILL.md
      fw-rollout/
        SKILL.md
        references/
      fw-incident/
        SKILL.md
        references/
    tools/
      evals/
        src/

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification.*

```text
router -> brainstorm -> plan -> work -> review -> rollout? -> ship -> spin
                                 \-> incident -> debug -> plan/work -> review

strict local policy
  -> setup discovers and persists posture
  -> work/review/ship/debug enforce only the configured gates

evidence producers
  -> browser-test
  -> review
  -> optimize
  -> verification-before-completion
        |
        v
  shared evidence bundle
        |
        v
      ship / rollout

validation surfaces
  -> per-skill evals
  -> end-to-end scenario evals
  -> doctor / prepare / summarize flows
```

## Implementation Units

- [x] **Unit 1: Strict Policy Foundation**

**Goal:** Define and thread a small, explicit repo-local policy model for risky
workflow gates without making the default path heavy.

**Requirements:** R1, R3, R6, R10

**Dependencies:** None

**Files:**
- Modify: `.flywheel/config.local.example.yaml`
- Modify: `skills/setup/references/config-template.yaml`
- Modify: `skills/setup/SKILL.md`
- Modify: `skills/work/SKILL.md`
- Modify: `skills/review/SKILL.md`
- Modify: `skills/ship/SKILL.md`
- Modify: `skills/debug/SKILL.md`
- Modify: `README.md`
- Test: `evals/fw:setup/cases.jsonl`
- Test: `evals/fw:work/cases.jsonl`
- Test: `evals/fw:review/cases.jsonl`
- Test: `evals/fw:ship/cases.jsonl`
- Test: `evals/verification-before-completion/cases.jsonl`

**Test posture:** `tdd` -- the policy surface is behavior-bearing guidance and
should be pinned with failing eval expectations before the skill text shifts.

**Approach:**
- Define a compact set of local policy keys for browser proof, reproducer
  requirements, review requirements, and runtime validation.
- Teach setup to discover and persist those keys.
- Thread policy-aware language into work, review, ship, and debug without
  making unconfigured repos slower by default.

**Execution note:** Keep the config surface intentionally small; a few clear
keys are better than a dense policy taxonomy.

**Patterns to follow:**
- `.flywheel/config.local.example.yaml`
- `skills/setup/SKILL.md`
- `skills/review/SKILL.md`

**Test scenarios:**
- A setup path can recommend and persist strict policy settings for risky repos.
- Work and ship reflect configured proof requirements without implying they are
  universal defaults.
- Debug can require a reproducer when the policy says so.

**Red signal:** New eval cases assert policy-aware workflow behavior that the
current skill text does not yet satisfy.

**Green signal:** Updated eval cases for setup, work, review, ship, and
verification pass with the new policy model in place.

**Verification:**
- README and config-template wording align with the implemented policy names.

- [x] **Unit 2: Setup, Doctor, And Product Shell**

**Goal:** Make Flywheel feel installable, diagnosable, upgradeable, and
recoverable instead of only skill-rich.

**Requirements:** R2, R3, R8, R10

**Dependencies:** Unit 1

**Files:**
- Modify: `README.md`
- Modify: `skills/setup/SKILL.md`
- Create: `docs/setup/compatibility.md`
- Create: `docs/setup/troubleshooting.md`
- Create: `scripts/flywheel-doctor.js`
- Modify: `scripts/flywheel-eval.js`
- Test: `evals/fw:setup/cases.jsonl`
- Test: `evals/fw:run/cases.jsonl`
- Test: `tools/evals/src/doctor.cjs`

**Test posture:** `tdd` -- setup and doctor behavior should be driven by
explicit missing-surface and recovery cases rather than post hoc wording.

**Approach:**
- Surface a small doctor entry point that reuses existing checks and adds
  plugin-local readiness, upgrade, and recovery reporting.
- Expand README and setup docs around install, local-checkout testing,
  troubleshooting, and upgrade-time recovery.
- Default setup toward durable outputs such as a setup ledger or local config
  when the repo clearly benefits from them.

**Execution note:** Reuse existing eval-doctor logic where possible instead of
  creating a second independent health-check subsystem.

**Technical design:** *(optional -- directional guidance, not implementation specification)*
- `scripts/flywheel-doctor.js` should act as a small productized wrapper over
  existing harness or repo checks, not as a new sprawling framework.

**Patterns to follow:**
- `skills/setup/SKILL.md`
- `scripts/flywheel-eval.js`
- `tools/evals/src/doctor.cjs`

**Test scenarios:**
- A new repo gets a clear install and recovery path for Codex and Claude Code.
- Missing browser or review surfaces route back to setup cleanly.
- Doctor output reports plugin, host, and local-config readiness without vague
  advice.

**Red signal:** Setup and doctor eval or smoke cases fail because the current
surface does not yet expose a complete recovery or product shell.

**Green signal:** New setup and doctor cases pass, and the doctor surface can
prepare a clean readiness summary for first-run and upgrade-time flows.

**Verification:**
- The new setup docs link cleanly from README and do not duplicate conflicting
  install instructions.

- [x] **Unit 3: Unified Evidence Bundle**

**Goal:** Create one evidence contract that browser proof, review, optimize,
and verification stages can write and shipping can consume.

**Requirements:** R3, R7, R8, R10

**Dependencies:** Unit 1

**Files:**
- Modify: `skills/browser-test/SKILL.md`
- Modify: `skills/review/SKILL.md`
- Modify: `skills/optimize/SKILL.md`
- Modify: `skills/verification-before-completion/SKILL.md`
- Modify: `skills/ship/SKILL.md`
- Create: `skills/ship/references/evidence-bundle.md`
- Modify: `README.md`
- Test: `evals/fw:browser-test/cases.jsonl`
- Test: `evals/fw:review/cases.jsonl`
- Test: `evals/fw:optimize/cases.jsonl`
- Test: `evals/fw:ship/cases.jsonl`
- Test: `evals/verification-before-completion/cases.jsonl`

**Test posture:** `tdd` -- the evidence contract should be pinned with eval
expectations before producer and consumer wording are updated.

**Approach:**
- Define a minimal shared evidence shape and expected artifact location.
- Update proof-producing stages to write or reference evidence in that shape.
- Update shipping to consume the bundle rather than depending on scattered chat
  context.

**Execution note:** Keep the evidence contract small and human-readable; avoid
  inventing a heavy schema registry.

**Patterns to follow:**
- `skills/ship/SKILL.md`
- `skills/browser-test/SKILL.md`
- `skills/verification-before-completion/SKILL.md`

**Test scenarios:**
- Browser-visible work can carry safe proof into shipping.
- Review outcomes and verification evidence can be summarized in one bundle.
- Sensitive-data hygiene remains explicit even when evidence is centralized.

**Red signal:** New eval cases require a shared evidence bundle or contract that
the current skills do not yet describe.

**Green signal:** Browser-test, review, optimize, verification, and ship evals
pass with a consistent evidence-bundle story.

**Verification:**
- PR-body and shipping guidance still preserve the existing 90%-confidence
  sensitive-data rule.

- [x] **Unit 4: Rollout Workflow**

**Goal:** Add `fw-rollout` as the first-class path for runtime-risky change
management before final shipping closure.

**Requirements:** R1, R3, R4, R7, R8

**Dependencies:** Units 1 and 3

**Files:**
- Create: `skills/rollout/SKILL.md`
- Create: `skills/rollout/references/rollout-template.md`
- Create: `skills/rollout/references/validation-playbook.md`
- Modify: `skills/start/SKILL.md`
- Modify: `skills/work/SKILL.md`
- Modify: `skills/review/SKILL.md`
- Modify: `skills/ship/SKILL.md`
- Modify: `skills/observability/SKILL.md`
- Modify: `README.md`
- Create: `evals/fw:rollout/manifest.json`
- Create: `evals/fw:rollout/cases.jsonl`
- Create: `evals/fw:rollout/rubric.md`

**Test posture:** `tdd` -- rollout is a net-new workflow surface and should be
introduced only alongside its own eval pack.

**Approach:**
- Define when rollout is the right stage and how it hands off into shipping.
- Make rollout own compatibility posture, change sequencing, failure signals,
  rollback triggers, validation windows, and owners.
- Integrate rollout with the evidence bundle and operational validation story.

**Execution note:** Keep `fw-rollout` focused on change-management decisions and
  validation posture, not deployment automation.

**Patterns to follow:**
- `skills/ship/SKILL.md`
- `skills/observability/SKILL.md`
- `skills/work/SKILL.md`

**Test scenarios:**
- Runtime-risky changes route into rollout instead of being flattened into ship.
- Rollout choices stay grounded in blast radius, compatibility, and validation.
- Rollout produces a handoff artifact that ship can summarize cleanly.

**Red signal:** The new `fw-rollout` eval pack fails because no dedicated
workflow exists yet and existing stages do not express the required posture.

**Green signal:** `fw-rollout` evals pass and the router plus downstream stages
recognize rollout as part of the risky-change path.

**Verification:**
- README and router wording stay explicit about when rollout is optional vs
  required by repo policy or blast radius.

- [x] **Unit 5: Incident Workflow**

**Goal:** Add `fw-incident` as the first-class path for production issues that
begin with runtime evidence and may flow into debug, planning, implementation,
review, and shipping.

**Requirements:** R1, R3, R5, R6, R8

**Dependencies:** Units 1 and 3

**Files:**
- Create: `skills/incident/SKILL.md`
- Create: `skills/incident/references/incident-template.md`
- Create: `skills/incident/references/decision-matrix.md`
- Modify: `skills/start/SKILL.md`
- Modify: `skills/debug/SKILL.md`
- Modify: `skills/observability/SKILL.md`
- Modify: `skills/run/SKILL.md`
- Modify: `README.md`
- Create: `evals/fw:incident/manifest.json`
- Create: `evals/fw:incident/cases.jsonl`
- Create: `evals/fw:incident/rubric.md`

**Test posture:** `tdd` -- incident handling is a new workflow and should be
specified through eval cases before the skill text is written.

**Approach:**
- Define an incident-first path that starts from runtime evidence, establishes
  blast radius and immediate next move, and then routes into debug, rollout,
  plan, or work as appropriate.
- Preserve `fw-debug` as the causal-hypothesis path while letting incident own
  mitigation vs rollback vs patch framing.

**Execution note:** Keep incident scope on investigation, mitigation posture,
  and workflow routing; avoid turning it into a full SRE handbook.

**Patterns to follow:**
- `skills/debug/SKILL.md`
- `skills/observability/SKILL.md`
- `skills/start/SKILL.md`

**Test scenarios:**
- A production issue can begin with logs, traces, or metrics rather than a
  failing unit test.
- Incident handling distinguishes mitigation, rollback, and patch paths.
- Incident output can hand off into debug or planning without losing evidence.

**Red signal:** The new `fw-incident` eval pack fails because current Flywheel
does not expose a dedicated incident workflow.

**Green signal:** `fw-incident` evals pass and router or debug integrations
recognize incident handling as a first-class path.

**Verification:**
- Incident guidance remains compatible with the existing evidence-before-fix
  discipline in `fw-debug`.

- [x] **Unit 6: Scenario Evals And Workflow Regression**

**Goal:** Extend the eval harness to score whole developer journeys across
multiple Flywheel stages.

**Requirements:** R2, R3, R8, R9, R10

**Dependencies:** Units 1 through 5

**Files:**
- Modify: `scripts/flywheel-eval.js`
- Modify: `tools/evals/src/scoring/index.cjs`
- Modify: `evals/README.md`
- Create: `evals/flywheel-runtime-change/manifest.json`
- Create: `evals/flywheel-runtime-change/cases.jsonl`
- Create: `evals/flywheel-runtime-change/rubric.md`
- Create: `evals/flywheel-incident-response/manifest.json`
- Create: `evals/flywheel-incident-response/cases.jsonl`
- Create: `evals/flywheel-incident-response/rubric.md`
- Test: `tools/evals/src/doctor.cjs`
- Test: `evals/flywheel/cases.jsonl`

**Test posture:** `tdd` -- scenario support should be driven by failing journey
cases before harness changes are introduced.

**Approach:**
- Extend the harness only as much as needed to express multi-stage journeys.
- Add scenario suites for at least one runtime-risky change path and one
  incident-response path.
- Keep existing per-skill packs intact and treat scenarios as additive
  regression coverage.

**Execution note:** Prefer thin harness extensions over a full eval-platform
  redesign.

**Patterns to follow:**
- `scripts/flywheel-eval.js`
- `evals/flywheel/`
- `tools/evals/src/scoring/index.cjs`

**Test scenarios:**
- A runtime-risky change path can be evaluated from planning through rollout
  and shipping expectations.
- An incident path can be evaluated from runtime evidence through debug and
  downstream routing.
- Existing per-skill validation still works after scenario support lands.

**Red signal:** New scenario suites or harness expectations fail because the
current eval model cannot yet express the required journey shape.

**Green signal:** Scenario suites validate, prepare, and summarize cleanly
without regressing existing suite behavior.

**Verification:**
- The harness still reports missing or malformed suites clearly and keeps the
  current validator semantics intact.

## System-Wide Impact

- **Interaction graph:** router -> setup / brainstorm / plan / work / review /
  rollout / ship / spin, with incident feeding debug, plan, work, and rollout
  as needed.
- **Error propagation:** missing config, missing doctor readiness, or missing
  evidence should fail with explicit routing and recovery steps rather than
  vague warnings.
- **State lifecycle risks:** config drift, stale evidence artifacts, duplicate
  setup docs, and scenario-eval complexity are the main maintenance risks.
- **API surface parity:** router, README, config template, setup docs, skill
  descriptions, and eval packs must all agree on stage boundaries and next
  steps.
- **Integration coverage:** scenario evals are required because per-skill packs
  will not prove multi-stage handoff quality on their own.
- **Unchanged invariants:** repo-relative paths, lazy loading, Codex / Claude
  prioritization, and artifact-oriented workflow boundaries remain intact.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| New skills bloat the workflow and duplicate existing stages | Keep `fw-rollout` and `fw-incident` narrowly scoped, and enforce clear routing boundaries in the router and README |
| Strict policy config becomes noisy or overengineered | Keep the key set minimal and prove value with eval cases before widening |
| Evidence bundle grows into a heavy schema | Use a minimal contract and human-readable artifact path; avoid over-structuring early |
| Scenario evals overcomplicate the harness | Extend the current harness incrementally and keep existing per-skill suites unchanged |
| Setup doctor duplicates existing checks | Build a thin wrapper over current doctor or setup checks rather than inventing a parallel health system |

## Documentation / Operational Notes

- Update the README flow map and command guide once new skills and docs exist.
- Make setup docs explicit about local-checkout testing, upgrade recovery, and
  troubleshooting for Codex and Claude Code.
- Treat rollout and incident docs as operationally meaningful artifacts, not
  marketing copy.
- Ensure all new skill and eval documentation preserves the current
  low-context, progressive-loading posture.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-19-flywheel-next-gen-roadmap-requirements.md](docs/brainstorms/2026-04-19-flywheel-next-gen-roadmap-requirements.md)
- Related code: `README.md`
- Related code: `skills/start/SKILL.md`
- Related code: `skills/setup/SKILL.md`
- Related code: `skills/work/SKILL.md`
- Related code: `skills/review/SKILL.md`
- Related code: `skills/ship/SKILL.md`
- Related code: `skills/debug/SKILL.md`
- Related code: `scripts/flywheel-eval.js`
- Related code: `.flywheel/config.local.example.yaml`
