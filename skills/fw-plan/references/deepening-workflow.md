# Deepening Workflow

This file contains the confidence-check execution path for strengthening a plan
after the first draft exists on disk. Load it only when the deepening gate in
the main skill determines that strengthening is warranted.

## 5.3.3 Score Confidence Gaps

Use a checklist-first, risk-weighted scoring pass.

For each section, compute:

- **Trigger count** — number of checklist problems that apply
- **Risk bonus** — add 1 if the topic is high-risk and the section is materially
  relevant to that risk
- **Critical-section bonus** — add 1 for `Key Technical Decisions`,
  `Testing Strategy`, `Implementation Units`, `System-Wide Impact`,
  `Risks & Dependencies`, or `Open Questions` in `Standard` or `Deep` plans

Treat a section as a candidate if:

- it hits **2+ total points**, or
- it hits **1+ point** in a high-risk domain and the section is materially
  important

Choose only the top **2-5** sections by score. If deepening a lightweight plan
under the high-risk exception, cap at **1-2** sections.

If the plan already has a `deepened:` date:

- prefer sections that have not yet been substantially strengthened when scores
  are comparable
- revisit an already-deepened section only when it still scores clearly higher
  than alternatives

### Section Checklists

**Requirements Trace**

- requirements are vague or disconnected from implementation units
- success criteria are missing or not reflected downstream
- units do not clearly advance the traced requirements
- origin requirements are not clearly carried forward

**Context & Research / Sources & References**

- relevant repo patterns are named but never used in decisions or units
- cited learnings or references do not materially shape the plan
- high-risk work lacks appropriate internal or external grounding
- research is generic instead of tied to this repo or this plan

**Key Technical Decisions**

- a decision is stated without rationale
- rationale does not explain tradeoffs or rejected alternatives
- the decision does not connect back to scope, requirements, or origin context
- an obvious design fork exists but the plan never explains why one path won
- runtime-risky decisions do not state what adjacent code currently does before
  recommending a new posture
- the plan names a reliability-sensitive decision but never compares the viable
  options or explains the recommendation

**Testing Strategy**

- the section does not define the allowed per-unit posture choices as
  `tdd`, `characterization`, and `no-new-tests`
- the section does not distinguish between work that should use TDD and work
  that should not
- substantial feature work or readily testable code paths are missing a
  test-first posture without explanation
- the posture selection rule does not state when to choose `tdd`,
  `characterization`, or `no-new-tests`
- TDD-suitable work does not define the red failing test and the green passing
  condition that prove the hypothesis
- `tdd` units define no material hypotheses, define more than 3, or describe
  hypotheses that are not externally observable behaviors, contract changes, or
  regression risks
- project testing idioms from `AGENTS.md`, `CLAUDE.md`, local tests, or durable
  references are missing or ignored
- the plan hardcodes exact test or coverage commands instead of deferring that
  detail to repo instructions or `/fw:work`
- config-only, mechanical, or weakly testable work is being forced into
  unnecessary TDD language instead of recording a proportionate exception
- changed public contracts are not named or not matched to coverage strategy
- primary test surfaces, helpers, fixtures, or pattern files are absent even
  though the repo likely has them
- test strategy is too generic for the repo or too thin for the risk

**Open Questions**

- product blockers are hidden as assumptions
- planning-owned questions are incorrectly deferred to implementation
- resolved questions have no clear basis in repo context, research, or origin
  decisions
- deferred items are too vague to be useful later

**High-Level Technical Design**

- the sketch uses the wrong medium for the work
- the sketch contains implementation code rather than pseudo-code or a
  directional diagram
- the non-prescriptive framing is missing or weak
- the sketch does not connect to key technical decisions or implementation units

**High-Level Technical Design (when absent)** for `Standard` or `Deep` plans

- the work involves DSL design, API surface design, multi-component
  integration, complex data flow, or state-heavy lifecycle
- key technical decisions would be easier to validate with a visual or
  pseudo-code representation
- implementation unit approach sections are thin and would benefit from higher
  level context

**Implementation Units**

- dependency order is unclear or likely wrong
- file paths or test file paths are missing where they should be explicit
- units are too large, too vague, or broken into micro-steps
- units do not declare an explicit test posture with a reason
- approach notes are thin or do not name patterns to follow
- units change public contracts without making the contract coverage explicit
- TDD-appropriate units do not give the worker a concrete red signal and green
  completion signal
- `Test scenarios` does not name the behaviors or cases to cover, `Red signal`
  does not name the failing test or assertion, `Green signal` does not name the
  passing completion condition, or `Verification` does not add distinct
  evidence beyond the main proof point
- test scenarios are vague, skip applicable categories, or are disproportionate
  to the unit's complexity
- feature-bearing units have blank or missing test scenarios
- verification outcomes are vague or not expressed as observable results

**System-Wide Impact**

- affected interfaces, callbacks, middleware, entry points, or parity surfaces
  are missing
- failure propagation is underexplored
- state lifecycle, caching, or data integrity risks are absent where relevant
- integration coverage is weak for cross-layer work

**Risks & Dependencies / Documentation / Operational Notes**

- risks are listed without mitigation
- rollout, monitoring, migration, or support implications are missing when
  warranted
- runtime-facing work names risks but not their likely blast radius
- runtime-facing work does not name the logs, metrics, traces, dashboards, or
  search terms that would validate health after release
- async, queue, retry, or integration changes do not name the correlation or
  debugging signals needed once the code is live
- retries, fallbacks, degraded modes, health checks, or backlog behavior are in
  scope but the plan never presents the user with grounded options
- external dependency assumptions are weak or unstated
- security, privacy, performance, or data risks are absent where they obviously
  apply

Use the plan's own `Context & Research`, `Testing Strategy`, and
`Sources & References` as evidence.

## 5.3.4 Report and Gather Targeted Strengthening Inputs

Before running any strengthening pass, report what sections are being
strengthened and why:

```text
Strengthening [section names] — [brief reason for each]
```

For each selected section, choose the smallest useful input set. Do **not** run
every possible research or review pass.

When the platform supports delegated specialist passes **and** policy allows,
use at most **1-3** bounded passes per section and usually no more than **8**
total.

Typical section-to-pass mapping:

- **Requirements Trace / Open Questions** — repo-grounded pattern or flow
  checks
- **Context & Research / Sources & References** — repo learnings, prior art,
  or official documentation
- **Key Technical Decisions** — architecture or tradeoff analysis
- **Testing Strategy** — test posture fit, public-contract protection, and
  project idiom alignment
- **High-Level Technical Design** — architecture validation and pattern grounding
- **Implementation Units / Verification** — pattern consistency, sequencing, and
  test coverage realism
- **System-Wide Impact** — cross-boundary effect analysis
- **Risks & Dependencies / Operational Notes** — specialist review aligned to the
  actual risk
- **Operational Notes with runtime impact** — `observability` for telemetry,
  validation surfaces, and post-deploy signal design

If delegated passes are unavailable, do the equivalent reasoning directly.

For each selected section, gather:

- a short plan summary
- the exact section text
- why the section was selected, including which checklist triggers fired
- the plan depth and risk profile
- the specific question the strengthening pass must answer

## 5.3.5 Choose Research Execution Mode

Use the lightest mode that works:

- **Direct mode** — default, when the selected section set is small
- **Artifact-backed mode** — only when the research scope is large enough that
  inline returns would create unnecessary context pressure

Artifact-backed mode is justified when:

- more than 5 specialist passes are likely to return meaningful findings
- selected sections are long enough that repeating them in multiple outputs
  would be wasteful
- the topic is high-risk and likely to attract bulky, source-backed analysis

If artifact-backed mode is used, create a per-run temp scratch directory and
pass the resolved absolute path to each delegated pass.

## 5.3.6 Run Targeted Strengthening

Launch the selected strengthening passes in parallel only when the platform and
policy allow it. Otherwise run them sequentially.

Prefer local repo and institutional evidence first. Use external research only
when the gap cannot be closed responsibly from repo context or already-cited
sources.

If a selected section can be improved by rereading the origin document more
carefully, do that before external research.

If outputs conflict:

- prefer repo-grounded and origin-grounded evidence over generic advice
- prefer official framework docs over secondary best-practice summaries when the
  conflict is about library behavior
- if a real tradeoff remains, record it explicitly in the plan

### 5.3.6b Interactive Finding Review (Interactive Mode Only)

Skip this step in auto mode.

In interactive mode, present each strengthening pass's findings before
integration. For each pass that returned findings:

1. summarize the reviewer or analysis target and the section it covered
2. present the findings concisely
3. ask whether to:
   - **Accept**
   - **Reject**
   - **Discuss**

If the user chooses `Discuss`, talk through the findings briefly and then re-ask
with only accept or reject.

When presenting findings from multiple passes targeting the same section,
present them one at a time so the user can make independent decisions.

If the user accepts no findings, report:

```text
No findings accepted — plan unchanged.
```

Then proceed directly to post-generation options. If findings were accepted and
the plan changed, continue to synthesis and document review.

## 5.3.7 Synthesize and Update the Plan

Strengthen only the selected sections. Keep the plan coherent and preserve its
overall structure.

Allowed changes:

- clarify or strengthen decision rationale
- tighten requirements trace or origin fidelity
- strengthen testing strategy, public-contract coverage, or project-idiom
  alignment
- reorder or split units when sequencing is weak
- add missing pattern references, file paths, test file paths, or verification
  outcomes
- expand system-wide impact, risks, or rollout treatment where justified
- reclassify open questions between `Resolved During Planning` and
  `Deferred to Implementation` when evidence supports the change
- strengthen, replace, or add a `High-Level Technical Design` section when the
  work warrants it
- add or update `deepened: YYYY-MM-DD` in frontmatter when the plan was
  substantively improved

Do **not**:

- add implementation code
- add git commands, commit choreography, or exact test command recipes
- add generic research filler sections everywhere
- rewrite the entire plan from scratch
- invent new product requirements, scope changes, or success criteria without
  surfacing them explicitly

If strengthening reveals a product-level ambiguity that should change behavior
or scope:

- do not silently decide it here
- record it under `Open Questions`
- recommend `/fw:brainstorm` if the gap is truly product-defining
