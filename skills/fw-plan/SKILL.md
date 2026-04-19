---
name: fw-plan
description: "Create structured implementation plans from a requirements document, bug report, feature idea, or rough description. Also deepen existing plans when the user explicitly asks. Use when a brainstorm or requirements doc is ready for planning, when the user says 'plan this', 'create a plan', 'write a tech plan', 'plan the implementation', 'how should we build this', or when agents or humans need a durable technical plan to work from."
metadata:
  argument-hint: "[optional: feature description, requirements doc path, plan path to deepen, or task to plan]"
---

# Create Technical Plan

Use the actual current date from runtime context when dating plans and
searching for recent documentation.

`/fw:brainstorm` defines **WHAT** to build. `/fw:plan` defines **HOW** to build
it. `/fw:work` executes the plan. A prior brainstorm is useful context but not
required — planning can start from a requirements doc, a bug report, a feature
idea, or a rough description.

**When directly invoked, always plan.** Never classify a direct invocation as
"not a planning task" and exit the workflow. If the input is unclear, ask
clarifying questions or use the planning bootstrap to establish enough context,
but stay in planning.

This workflow produces a durable implementation plan. It does **not** implement
code, run tests, or learn from execution-time results.

## Interaction Method

Use the platform's blocking question tool when available. Otherwise present
numbered options in chat and wait for the user's reply.

Ask one question at a time. Prefer concise single-select choices when natural
options exist.

When multiple implementation or reliability postures are viable, present a
short predicted option list with the recommended option first and a `Custom`
option last.

## Reference Loading Map

Do not load every reference file by default. Load only what the current phase
needs:

- Read `references/universal-planning.md` only when the task is clearly a
  non-software planning problem.
- Read `references/visual-communication.md` only when the plan structure would
  materially benefit from a dependency graph, interaction diagram, or
  comparison table.
- Read `references/unit-examples.md` only when drafting implementation units,
  choosing test posture, or repairing output that is drifting from the required
  unit schema.
- Read `references/deepening-workflow.md` only when Phase 5.3 determines the
  plan should be strengthened after the first draft is written.
- Read `references/plan-handoff.md` only after the plan file exists on disk and
  the confidence check is complete.
- Read `../observability/references/service-readiness-matrix.md` only when the
  work changes runtime behavior, contracts, retries, queues, migrations, or
  other blast-radius-sensitive service boundaries.

## Core Principles

1. **Use requirements as the source of truth** — if `/fw:brainstorm` produced a
   requirements document, planning should build from it rather than re-inventing
   behavior.
2. **Decisions, not code** — capture approach, boundaries, files, dependencies,
   risks, and test scenarios. Do not pre-write implementation code or shell
   choreography.
3. **Research before structuring** — explore the codebase, prior learnings, and
   external guidance when warranted before finalizing the plan.
4. **Right-size the artifact** — small work gets a compact plan. Large work gets
   more structure. The planning boundary stays the same.
5. **Separate planning from execution discovery** — resolve planning-time
   questions here. Explicitly defer execution-time unknowns to implementation.
6. **Keep the plan portable** — the plan should work as a durable document,
   review artifact, or issue body without embedding tool-specific executor
   instructions.
7. **Use TDD where it materially fits** — plans should prefer a test-first
   posture for meaningful feature work and for code paths that are already
   reasonably testable. Do not force TDD onto configuration-only changes,
   purely mechanical edits, or areas where the repo shape makes upfront tests
   disproportionate. When a different posture is better, state it briefly and
   explain why.
8. **Plan the testing strategy, not just the code changes** — every software
   plan should state how new or changed behavior will be tested, which existing
   test idioms to follow, whether to extend current tests or add new ones, and
   which public contracts must stay protected. Exact test or coverage commands
   belong to the host project's instructions or `/fw:work`, not the plan. When
   TDD fits, each material hypothesis should map to a concrete red signal and a
   green completion signal.
9. **Make runtime tradeoffs explicit** — when a plan changes retries,
   fallbacks, queue behavior, health checks, or other operationally meaningful
   boundaries, present the current repo truth, likely failure modes, blast
   radius, viable options, and the recommended posture.

## Plan Quality Bar

Every plan should contain:

- a clear problem frame and scope boundary
- concrete requirements traceability back to the request or origin document
- repo-relative file paths for the proposed work
- explicit test file paths for feature-bearing implementation units
- decisions with rationale, not just tasks
- existing patterns or code references to follow
- per implementation unit, an explicit test posture chosen from `tdd`,
  `characterization`, or `no-new-tests`, with a brief reason
- an explicit testing strategy that uses TDD where appropriate, aligns with
  `AGENTS.md`, `CLAUDE.md`, and local testing references when present, and
  assumes repo tooling exists even when command discovery is deferred
- for `tdd` units, 1-3 material hypotheses with explicit red and green proof
  points grounded in existing or new tests
- clear public-contract coverage for any changed user-facing, API, CLI, schema,
  event, or integration behavior
- enumerated test scenarios for each feature-bearing unit
- clear dependencies and sequencing
- for runtime-risky work, an explicit decision surface covering current
  behavior, top failure modes, blast radius, viable options, and the chosen
  recommendation
- for runtime-risky work, explicit coverage of the applicable service-readiness
  dimensions: contracts, state, failure modes, observability, rollout,
  recovery, and validation ownership
- enough detail that the next agent or human can start without rediscovering
  the project's testing posture or file-level patterns

A plan is ready when an implementer can start confidently without needing the
plan to write the code for them.

## Feature Description

<feature_description> #$ARGUMENTS </feature_description>

**If the feature description above is empty, ask the user:** "What would you
like to plan? Describe the task, goal, or project you have in mind."

If the input is present but unclear or underspecified, do not abandon the
workflow. Ask one or two clarifying questions, or use the planning bootstrap to
establish enough structure.

**IMPORTANT: All file references in the plan document must use repo-relative
paths** such as `src/models/user.rb`, never absolute paths.

## Workflow

### Phase 0: Resume, Source, and Scope

#### 0.1 Resume Existing Plan Work When Appropriate

If the user references an existing plan file or there is an obvious recent
matching plan in `docs/plans/`:

- read it
- confirm whether to update it in place or create a new plan
- if updating, preserve completed checkboxes and revise only the still-relevant
  sections

**Deepen intent:** The word "deepen" in reference to a plan is the primary
trigger for the deepening fast path. When the user says "deepen the plan",
"deepen my plan", or "run a deepening pass", the target document is a plan in
`docs/plans/`, not a requirements document.

Words like "strengthen", "confidence", "gaps", and "rigor" are **not** enough
on their own to trigger a holistic deepening pass. Prefer to confirm before
entering the fast path unless the user clearly targeted the plan as a whole.

Once the plan is identified and appears complete:

- if the plan lacks YAML frontmatter, route to
  `references/universal-planning.md` for editing or deepening instead of the
  software deepening flow
- otherwise short-circuit to Phase 5.3 in **interactive mode**

Normal editing requests should **not** trigger the fast path.

#### 0.1b Classify Task Domain

If the task involves building, modifying, or architecting software, continue.

If the task is a non-software multi-step goal worth planning, read
`references/universal-planning.md` and follow that workflow instead.

If the task is genuinely ambiguous, ask before routing.

For quick help, factual lookups, or single-step tasks, only skip the planning
workflow when this skill was auto-selected rather than directly invoked.

#### 0.2 Find Upstream Requirements Document

Before asking planning questions, search `docs/brainstorms/` for files matching
`*-requirements.md`.

Treat a requirements document as relevant when:

- the topic semantically matches the feature description
- it appears to cover the same user problem or scope
- it is recent enough to still be trustworthy, unless the content is obviously
  still current or obviously stale

If multiple source documents match, ask which one to use.

#### 0.3 Use the Source Document as Primary Input

If a relevant requirements document exists:

1. read it thoroughly
2. announce that it will serve as the origin document for planning
3. carry forward:
   - problem frame
   - requirements and success criteria
   - scope boundaries
   - key decisions and rationale
   - dependencies or assumptions
   - outstanding questions, preserving whether they are blocking or deferred
4. use it as the primary input to planning and research
5. reference important carried-forward decisions in the plan with
   `(see origin: <source-path>)`
6. do not silently omit source content

If no relevant requirements document exists, planning may proceed from the
user's request directly.

#### 0.4 Planning Bootstrap

If no relevant requirements document exists, or the input needs more structure:

- assess whether the request is already clear enough for direct technical
  planning
- if the ambiguity is mainly product framing, user behavior, or scope
  definition, recommend `/fw:brainstorm` as a suggestion — but still offer to
  continue planning here
- if the user wants to continue here, establish:
  - problem frame
  - intended behavior
  - scope boundaries and obvious non-goals
  - success criteria
  - blocking questions or assumptions

Keep the bootstrap brief.

If major product questions remain unresolved:

- recommend `/fw:brainstorm` again
- if the user still wants to continue, require explicit assumptions before
  proceeding

If the request turns out to be a symptom without a known root cause, say so
clearly and do a brief investigation first rather than pretending planning can
start responsibly. If the issue is already understood and the fix is obvious,
suggest `/fw:work` as a faster alternative while still allowing planning.

#### 0.5 Classify Outstanding Questions Before Planning

If the origin document contains `Resolve Before Planning` or similar blockers:

- review each one
- reclassify it into planning-owned work **only if** it is actually a
  technical, architectural, or research question
- keep it as a blocker if it would change product behavior, scope, or success
  criteria

If true product blockers remain:

- surface them clearly
- ask whether to:
  1. resume `/fw:brainstorm` to resolve them
  2. convert them into explicit assumptions or decisions and continue

Do not continue planning while true blockers remain unresolved.

#### 0.6 Assess Plan Depth

Classify the work into one of these depths:

- **Lightweight** — small, well-bounded, low ambiguity
- **Standard** — normal feature or bounded refactor with some technical
  decisions to document
- **Deep** — cross-cutting, strategic, high-risk, or highly ambiguous work

If depth is unclear, ask one targeted question and then continue.

### Phase 1: Gather Context

#### 1.1 Local Research (Always Runs)

Build a concise planning context summary:

- if an origin document exists, summarize its problem frame, requirements, and
  key decisions
- otherwise use the feature description directly

Always do local research:

- inspect relevant parts of the codebase
- identify technology, architecture, patterns, and likely touched files
- read `AGENTS.md` and `CLAUDE.md` guidance when present and when it materially
  affects the plan, especially testing methodology, workflow expectations, and
  project idioms
- inspect nearby tests, helpers, fixtures, and naming patterns for the target
  area so the plan can say whether to extend existing coverage or create new
  tests
- read relevant `docs/solutions/` or other durable learnings when they exist;
  search solution frontmatter by `files_touched`, `module`, `tags`,
  `problem_type`, `component`, and title before reading full docs. Prefer
  `doc_status: active` and follow `superseded_by` when present

When the platform supports delegated or parallel bounded research **and** policy
allows it, you may split local research into small focused passes, for example:

- repo patterns and touched files
- prior learnings or solutions
- architecture and blast radius

If such delegation is unavailable, do the equivalent work directly.

**Slack context** is opt-in. If Slack tools exist and the user asked for them,
gather organizational context. If tools exist but the user did not ask, note
that Slack context is available on request.

When the work is runtime-risky, read
`../observability/references/service-readiness-matrix.md` and capture only the
dimensions that materially apply to this change. Do not force a full matrix
when the change is local and low-blast-radius.

#### 1.1b Detect Execution Posture Signals

Decide whether the plan should carry a lightweight execution posture signal.
Prefer TDD for substantial feature work and for code that is already easy to
exercise. Use another posture when the change is config-only, mechanical, or
not reasonably testable at planning time.

For each implementation unit, choose exactly one test posture:

- `tdd` — use when the unit changes externally observable behavior, a public
  contract, or a regression-prone code path that is reasonably testable now.
  This posture requires explicit red and green proof points.
- `characterization` — use when the first planning need is to lock current
  behavior in a fragile, legacy, or poorly understood area before changing it.
  State what behavior must be pinned and why a test-first failing proof point is
  not the right first move for that unit.
- `no-new-tests` — use only for configuration-only, mechanical, generated,
  documentation-adjacent, or otherwise disproportionate work. State why new
  tests are not warranted and how completion will still be verified.

Look for:

- repo instructions already prescribing TDD or another testing flow
- explicit TDD or test-first requests
- feature work large enough that a red-green-refactor loop will improve quality
- characterization-first needs in fragile or legacy areas
- configuration-only or infrastructure-only edits with little direct behavioral
  surface
- repo instructions or durable references that prescribe testing methodology or
  test layering
- repo context showing the target area is historically brittle or weakly tested

When the signal is clear, carry it forward explicitly in relevant
implementation units and summarize the overall posture mix in
`## Testing Strategy`. Ask the user only if the posture would materially change
sequencing or risk and cannot be responsibly inferred.

Do not turn this into exact command choreography. If test or coverage tooling is
not already documented in repo instructions, assume it exists and let
`/fw:work` discover the concrete command path during execution.

When TDD fits, frame the work as a red -> green -> refactor loop at plan level:

- identify the existing or new test that should fail first
- identify the passing condition that proves the unit is complete
- keep the plan at the level of proof points, not literal coding steps
- usually capture **1-3** material hypotheses per unit, not every trivial
  assertion

A **material hypothesis** is one externally observable behavior, contract
change, or regression risk worth proving. Do not explode this into line-by-line
assertions or every branch-level detail.

#### 1.2 Decide on External Research

Based on the origin document, user signals, and local findings, decide whether
external research adds value.

Lean toward external research when:

- the topic is high-risk: security, payments, privacy, external APIs,
  migrations, compliance
- the codebase lacks relevant local patterns
- local patterns exist only in adjacent domains, not the exact one being
  planned
- the user is exploring unfamiliar territory

Skip external research when:

- the codebase already shows strong direct local patterns
- the user already knows the intended shape
- additional external context would add little practical value

Announce the decision briefly before continuing.

#### 1.3 External Research (Conditional)

If external research is useful, gather only the smallest set of sources that
materially improve the plan. Prefer official docs and primary sources for
technical questions. Parallelize independent research threads only when policy
and tools allow it.

#### 1.4 Consolidate Research

Summarize:

- relevant codebase patterns and file paths
- relevant testing idioms, fixtures, helpers, and contract-test patterns
- relevant institutional learnings
- organizational context from Slack, if gathered
- external references and best practices, if gathered
- related issues, PRs, or prior art
- constraints that materially shape the plan

#### 1.4b Reclassify Depth When Research Reveals External Contract Surfaces

If the current classification is **Lightweight** and research shows that the
work touches external contract surfaces, reclassify to **Standard**.

Examples:

- environment variables consumed externally
- exported public APIs or CLI flags
- CI/CD configuration files
- shared interfaces consumed downstream
- documentation or workflows linked externally

#### 1.5 Flow and Edge-Case Analysis (Conditional)

For **Standard** or **Deep** plans, or when flow completeness is still unclear:

- identify missing edge cases, state transitions, and handoff gaps
- tighten requirements trace and verification strategy
- add only the flow details that materially improve the plan

If the platform supports a specialist analysis pass and policy allows it, you
may use one. Otherwise perform the analysis directly.

### Phase 2: Resolve Planning Questions

Build a planning question list from:

- deferred questions in the origin document
- gaps discovered in repo or external research
- technical decisions required to produce a useful plan

For each question, decide whether it should be:

- **resolved during planning** — knowable from repo context, documentation, or
  user choice
- **deferred to implementation** — depends on code changes, runtime behavior,
  or execution-time discovery

Ask the user only when the answer materially affects architecture, scope,
sequencing, or risk and cannot be responsibly inferred.

Do **not** run tests, build the app, or probe runtime behavior in this phase.

### Phase 3: Structure the Plan

#### 3.1 Title and File Naming

- draft a clear, searchable title such as `feat: Add user authentication`
- determine the plan type: `feat`, `fix`, or `refactor`
- build the filename using:
  `docs/plans/YYYY-MM-DD-NNN-<type>-<descriptive-name>-plan.md`
- create `docs/plans/` if it does not exist
- determine the next sequence number for that date
- keep the descriptive name concise and kebab-cased

#### 3.2 Stakeholder and Impact Awareness

For **Standard** or **Deep** plans, briefly consider who is affected — end
users, developers, operations, or other teams — and reflect that where useful
in `System-Wide Impact`.

#### 3.3 Break Work into Implementation Units

Break the work into logical implementation units. Each unit should usually be a
meaningful change an implementer could land as an atomic commit.

Good units are:

- focused on one component, behavior, or integration seam
- usually touching a small related file cluster
- ordered by dependency
- concrete enough for execution without pre-writing code
- checkable with `- [ ]` syntax

Avoid:

- micro-steps
- units spanning unrelated concerns
- units so vague an implementer still has to invent the plan

#### 3.4 High-Level Technical Design (Optional)

Before detailing units, decide whether an overview would help a reviewer
validate the intended approach.

Use the medium that best fits the work:

| Work involves... | Best overview form |
|---|---|
| DSL or API surface design | Pseudo-code grammar or contract sketch |
| Multi-component integration | Mermaid sequence or component diagram |
| Data pipeline or transformation | Data flow sketch |
| State-heavy lifecycle | State diagram |
| Complex branching logic | Flowchart |
| Mode/flag combinations or multi-input behavior | Decision matrix |
| Single-component with non-obvious shape | Pseudo-code sketch |

Frame every sketch with:

> This illustrates the intended approach and is directional guidance for
> review, not implementation specification.

Keep sketches concise.

#### 3.4b Output Structure (Optional)

For greenfield plans that create a new directory structure, include an
`## Output Structure` section when the layout itself is a meaningful design
decision.

Skip it when:

- the plan only modifies existing files
- only 1-2 files are created in an existing directory

#### 3.5 Define Each Implementation Unit

For each unit, include:

- **Goal**
- **Requirements**
- **Dependencies**
- **Files** — repo-relative file paths to create, modify, or test
- **Test posture** — exactly one of `tdd`, `characterization`, or
  `no-new-tests`, with a brief reason
- **Approach**
- **Execution note** — optional sequencing or rollout note; do not use this to
  restate the test posture
- **Technical design** — optional when the unit's approach is non-obvious
- **Patterns to follow**
- **Test scenarios** — specific cases right-sized to complexity and risk
- **Red signal** — for TDD-appropriate work, the failing test or assertion that
  should go red before implementation
- **Green signal** — for TDD-appropriate work, the passing condition that gives
  the worker ground truth that the unit is complete
- **Verification** — observable outcomes, not shell scripts

Feature-bearing units and other materially testable code changes should include
test file paths in `**Files:**`.

For TDD-appropriate units, every meaningful hypothesis should be anchored to an
existing or new test that can fail before the code change and pass after it.
The goal is to give the worker a concrete truth source for completion, not just
generic coverage intent.

Use the testing fields distinctly:

- **Test scenarios** — the behaviors or cases the unit must cover
- for `no-new-tests` units with no behavioral surface, use `n/a -- [reason]`
- **Red signal** — the failing test or assertion that proves the work is not
  done yet; required for `tdd`, omitted or marked `n/a` otherwise
- **Green signal** — the passing condition that proves the primary hypothesis is
  satisfied; required for `tdd`, omitted or marked `n/a` otherwise
- **Verification** — only additional evidence beyond the main proof point; use
  `none` when the green signal is sufficient

Do not copy the same sentence into all four fields.

If the output starts drifting from this schema, stop and read
`references/unit-examples.md` before continuing.

When a unit changes a public contract, call that out explicitly in the
`**Approach:**`, `**Test scenarios:**`, or both. Public contracts include
user-facing behavior, request/response shapes, exported APIs, CLI flags,
event payloads, schema-visible behavior, and integration boundaries consumed by
other systems.

Use `Execution note` sparingly.

Do not turn units into verbose process theater. When TDD fits, capture the red
and green proof points without spelling out full coding choreography.

#### 3.6 Keep Planning-Time and Implementation-Time Unknowns Separate

If something matters but is not knowable yet, record it explicitly under
deferred implementation notes rather than pretending to resolve it now.

### Phase 4: Write the Plan

Use one planning philosophy across all depths. Change the amount of detail, not
the boundary between planning and execution.

#### 4.1 Plan Depth Guidance

**Lightweight**

- keep the plan compact
- usually 2-4 units
- omit optional sections that add little value

**Standard**

- use the full core template, omitting optional sections that add no value
- usually 3-6 units
- include risks, deferred questions, and system-wide impact when relevant

**Deep**

- use the full core template plus optional analysis sections where warranted
- usually 4-8 units
- group units into phases when that improves clarity

#### 4.1b Optional Deep Plan Extensions

For sufficiently large, risky, or cross-cutting work, add only the sections
that genuinely help:

- Alternative Approaches Considered
- Success Metrics
- Dependencies / Prerequisites
- Risk Analysis & Mitigation
- Phased Delivery
- Documentation Plan
- Operational / Rollout Notes
- Future Considerations only when they materially affect current design

#### 4.2 Core Plan Template

Omit clearly inapplicable optional sections, especially for Lightweight plans.

```markdown
---
title: [Plan Title]
type: [feat|fix|refactor]
status: active
date: YYYY-MM-DD
origin: docs/brainstorms/YYYY-MM-DD-<topic>-requirements.md  # include when planning from a requirements doc
deepened: YYYY-MM-DD  # optional, set when the confidence check substantively strengthens the plan
---

# [Plan Title]

## Overview

[What is changing and why]

## Problem Frame

[Summarize the user/business problem and context. Reference the origin doc when present.]

## Requirements Trace

- R1. [Requirement or success criterion this plan must satisfy]
- R2. [Requirement or success criterion this plan must satisfy]

## Scope Boundaries

- [Explicit non-goal or exclusion]

### Deferred to Separate Tasks

- [Work that will be done separately]: [Where or when]

## Context & Research

### Relevant Code and Patterns

- [Existing file, class, component, or pattern to follow]

### Institutional Learnings

- [Relevant `docs/solutions/` insight]

### External References

- [Relevant external docs or best-practice source, if used]

## Key Technical Decisions

- [Decision]: [Rationale]

## Testing Strategy

- **Project testing idioms:** [What `AGENTS.md`, `CLAUDE.md`, local tests, or
  durable refs say to follow]
- **Posture selection rule:** [Per unit choose exactly one of `tdd`,
  `characterization`, or `no-new-tests`, and use repo context to justify it]
- **Plan-level posture mix:** [Briefly summarize which units are expected to use
  `tdd`, `characterization`, and `no-new-tests`, and why that split fits this
  plan]
- **Material hypotheses:** [For each `tdd` unit, identify 1-3 externally
  observable behaviors, contract changes, or regression risks worth proving]
- **Red -> green proof points:** [For each TDD-appropriate unit, name the
  existing or new failing test to start from and the passing condition that
  proves the hypothesis]
- **Tooling assumption:** [Assume repo test and coverage tooling exists. Use
  documented project instructions when present; otherwise let `/fw:work`
  discover the concrete commands]
- **Public contracts to protect:** [User-facing flows, APIs, CLI flags, event
  payloads, schema-visible behavior, integrations]
- **Primary test surfaces:** [Which suites, layers, or file clusters should
  carry the coverage]
- **Test patterns to mirror:** [Existing tests, helpers, fixtures, factories,
  or support utilities to extend]

## Open Questions

### Resolved During Planning

- [Question]: [Resolution]

### Deferred to Implementation

- [Question or unknown]: [Why it is intentionally deferred]

## Output Structure

    [directory tree showing new directories and files]

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification.*

[Pseudo-code grammar, Mermaid diagram, data flow sketch, or state diagram]

## Implementation Units

- [ ] **Unit 1: [Name]**

**Goal:** [What this unit accomplishes]

**Requirements:** [R1, R2]

**Dependencies:** [None / Unit 1 / external prerequisite]

**Files:**
- Create: `path/to/new_file`
- Modify: `path/to/existing_file`
- Test: `path/to/test_file`

**Test posture:** [`tdd` | `characterization` | `no-new-tests`] -- [one-sentence reason]

**Approach:**
- [Key design or sequencing decision]

**Execution note:** [Optional sequencing or rollout note; do not repeat test posture]

**Technical design:** *(optional -- directional guidance, not implementation specification)*

**Patterns to follow:**
- [Existing file, class, or pattern]

**Test scenarios:**
- [Specific input/action -> expected outcome, or `n/a -- [reason]` for a true
  `no-new-tests` unit]

**Red signal:** [Required for `tdd`: existing or new test/assertion expected to
fail before implementation. Otherwise `n/a -- [reason]`]

**Green signal:** [Required for `tdd`: that same test/assertion or contract
check passes when this unit is implemented correctly. Otherwise `n/a -- [reason]`]

**Verification:**
- [Additional evidence beyond the main proof point, or `none` when the green
  signal is sufficient]

## System-Wide Impact

- **Interaction graph:** [What callbacks, middleware, observers, or entry points may be affected]
- **Error propagation:** [How failures should travel across layers]
- **State lifecycle risks:** [Partial-write, cache, duplicate, or cleanup concerns]
- **API surface parity:** [Other interfaces that may require the same change]
- **Integration coverage:** [Cross-layer scenarios unit tests alone will not prove]
- **Unchanged invariants:** [Existing behaviors this plan explicitly does not change]

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| [Meaningful risk] | [How it is addressed or accepted] |

## Documentation / Operational Notes

- [Docs, rollout, monitoring, or support impacts when relevant]

## Sources & References

- **Origin document:** [docs/brainstorms/YYYY-MM-DD-<topic>-requirements.md](path)
- Related code: [path or symbol]
- Related PRs/issues: #[number]
- External docs: [url]
```

#### 4.3 Planning Rules

- all file paths must be repo-relative
- prefer path plus class, component, or pattern references over brittle line
  numbers
- keep units checkable with `- [ ]`
- do not include implementation code
- pseudo-code sketches and Mermaid diagrams are allowed when they communicate
  design direction
- do not include git commands, commit messages, or exact test command recipes
- do not pretend execution-time questions are settled just to make the plan look
  complete

#### 4.4 Visual Communication in Plan Documents

When the plan contains:

- 4+ implementation units with non-linear dependencies
- 3+ interacting surfaces in `System-Wide Impact`
- 3+ behavioral modes or variants in `Overview` or `Problem Frame`
- 3+ interacting decisions or alternatives

read `references/visual-communication.md`.

### Phase 5: Final Review, Write File, and Handoff

#### 5.1 Review Before Writing

Before finalizing, check:

- the plan does not invent product behavior that should have been defined in
  `/fw:brainstorm`
- if there was no origin document, the planning bootstrap established enough
  product clarity to plan responsibly
- every major decision is grounded in the origin document or research
- the testing strategy reflects `AGENTS.md`, `CLAUDE.md`, local test patterns,
  and any durable testing references when present
- the testing strategy defines per-unit posture choices using exactly
  `tdd`, `characterization`, or `no-new-tests`
- the testing strategy uses TDD where it is proportionate and testable, and
  records explicit exceptions where it is not
- `tdd` units define 1-3 material hypotheses rather than a vague or bloated
  proof-point list
- TDD-appropriate units provide clear red and green proof points so the worker
  has a concrete completion signal
- `Test scenarios`, `Red signal`, `Green signal`, and `Verification` are
  distinct rather than duplicated
- each implementation unit is concrete, dependency-ordered, and ready for
  execution
- changed public contracts are matched to explicit coverage expectations
- test scenarios are specific and complete enough for the unit's risk profile
- the plan contains enough detail for the next implementer to start without
  re-deriving the project's testing approach
- the plan does not hardcode exact test or coverage command recipes that belong
  in repo instructions or `/fw:work`
- deferred items are explicit and not hidden as fake certainty
- any high-level technical design is directional rather than copy-paste-ready
- if the plan originated from a requirements document, every meaningful section
  of the origin document is addressed

#### 5.2 Write Plan File

**REQUIRED: Write the plan file to disk before presenting any options.**

Save the complete plan to:

```text
docs/plans/YYYY-MM-DD-NNN-<type>-<descriptive-name>-plan.md
```

Confirm:

```text
Plan written to docs/plans/[filename]
```

In automated or pipeline contexts, skip interactive questions and make the
needed choices automatically.

#### 5.3 Confidence Check and Deepening

After writing the plan file, automatically evaluate whether the plan needs
strengthening.

Two deepening modes exist:

- **Auto mode** — default during plan generation. Findings are synthesized
  directly into the plan without per-finding approval.
- **Interactive mode** — used when the user explicitly asked to deepen an
  existing plan. Findings are presented before integration.

The confidence check and `document-review` are different:

- `document-review` checks coherence, feasibility, scope alignment,
  simplification pressure, observability/supportability gaps, and role-specific
  document quality
- the confidence check strengthens rationale, sequencing, risk treatment, and
  system-wide thinking when the plan is structurally sound but still thin

Determine:

- plan depth
- topic risk profile
- whether local grounding is thin enough that a strengthening pass is warranted

If the plan already appears sufficiently grounded, report:

```text
Confidence check passed — no sections need strengthening.
```

and skip to document review.

When deepening is warranted, read `references/deepening-workflow.md` and execute
that flow.

#### 5.4 Document Review, Final Checks, and Post-Generation Options

After the confidence check, read `references/plan-handoff.md`. Document review
is mandatory — do not skip it even if the confidence check already ran.

NEVER CODE. Research, decide, and write the plan.
