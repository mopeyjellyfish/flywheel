---
name: fw-brainstorm
description: "Explore requirements and approaches through collaborative dialogue before writing a right-sized requirements document and planning implementation. Use for feature ideas, problem framing, when the user says 'let's brainstorm', or when they want to think through options before deciding what to build. Also use when a user describes a vague or ambitious feature request, asks 'what should we build', 'help me think through X', presents a problem with multiple valid solutions, or seems unsure about scope or direction."
metadata:
  argument-hint: "[feature idea or problem to explore]"
---

# Brainstorm a Feature or Improvement

**Note: The current year is 2026.** Use this when dating requirements documents.

Brainstorming helps answer **WHAT** to build through collaborative dialogue. It
precedes `/fw:plan`, which answers **HOW** to build it.

The durable output of this workflow is a **requirements document**. In other
workflows this might be called a lightweight PRD or feature brief. In Flywheel,
keep the workflow name `brainstorm`, but make the written artifact strong
enough that planning does not need to invent product behavior, scope
boundaries, or success criteria.

This skill does not implement code. It explores, clarifies, and documents
decisions for later planning or execution.

**IMPORTANT: All file references in generated documents must use repo-relative
paths** such as `src/models/user.rb`, never absolute paths. Absolute paths
break portability across machines, worktrees, and teammates.

Do not preload every reference file. Load only the one needed for the current
phase so the working context stays tight.

## Reference Loading Map

- Read `references/universal-brainstorming.md` only when Phase 0 routes the
  task into non-software brainstorming.
- Read `references/requirements-capture.md` when Phase 3 begins and a durable
  requirements document should be created or updated.
- Read `references/brainstorm-examples.md` when taking the clear-requirements
  fast path, preparing the synthesis checkpoint, structuring approach
  comparisons, drafting the requirements document, or repairing output that is
  drifting from the expected shape.
- Read `references/visual-communication.md` when deciding whether a diagram,
  table, or other visual aid would make the requirements or approach
  comparison easier to understand.
- Read `references/handoff.md` when Phase 4 begins and the brainstorm is ready
  to hand off, pause, or continue.

## Frontier Model Posture

Keep the static scaffold stable, keep the feature input later in the prompt,
load references only at the phase that needs them, and ask one question at a
time. Verify repo-grounded claims before writing them into the requirements
document.

## Core Principles

1. **Assess scope first** - Match the amount of ceremony to the size and
   ambiguity of the work.
2. **Be a thinking partner** - Suggest alternatives, challenge assumptions,
   and explore what-ifs instead of only extracting requirements.
3. **Resolve product decisions here** - User-facing behavior, scope
   boundaries, and success criteria belong in this workflow. Detailed
   implementation belongs in planning.
4. **Keep implementation out of the requirements doc by default** - Do not
   include libraries, schemas, endpoints, file layouts, or code-level design
   unless the brainstorm itself is inherently about a technical or
   architectural change.
5. **Right-size the artifact** - Simple work gets a compact requirements
   document or brief alignment. Larger work gets a fuller document. Do not add
   ceremony that does not help planning.
6. **Apply YAGNI to carrying cost, not coding effort** - Prefer the simplest
   approach that delivers meaningful value. Avoid speculative complexity and
   hypothetical future-proofing, but low-cost polish or delight is worth
   including when its ongoing cost is small and easy to maintain.

## Interaction Rules

1. **Ask one question at a time** - Do not batch several unrelated questions
   into one message.
2. **Prefer single-select multiple choice** - Use single-select when choosing
   one direction, one priority, or one next step.
3. **Use multi-select rarely and intentionally** - Use it only for compatible
   sets such as goals, constraints, non-goals, or success criteria that can
   all coexist. If prioritization matters, follow up by asking which selected
   item is primary.
4. **Use the platform's question tool when available** - When asking the user
   a question, prefer the platform's blocking question tool if one exists.
   Otherwise, present numbered options in chat and wait for the user's reply
   before proceeding.
5. **Keep explicit options narrow** - When presenting answer choices, keep them
   to 2-4 options. Default to 3 unless the task clearly needs fewer or more.

## Output Guidance

- **Keep outputs concise** - Prefer short sections, brief bullets, and only
  enough detail to support the next decision.
- **Use repo-relative paths** - When referencing files, use paths relative to
  the repo root such as `src/models/user.rb`, never absolute paths.

## Feature Description

<feature_description> #$ARGUMENTS </feature_description>

**If the feature description above is empty, ask the user:** "What would you
like to explore? Please describe the feature, problem, or improvement you're
thinking about."

Do not proceed until you have a feature description from the user.

## Execution Flow

### Phase 0: Resume, Assess, and Route

#### 0.1 Resume Existing Work When Appropriate

If the user references an existing brainstorm topic or document, or there is
an obvious recent matching `*-requirements.md` file in `docs/brainstorms/`:

- Read the document.
- Confirm with the user before resuming: "Found an existing requirements doc
  for [topic]. Should I continue from this, or start fresh?"
- If resuming, summarize the current state briefly, continue from its existing
  decisions and outstanding questions, and update the existing document
  instead of creating a duplicate.

#### 0.1b Classify Task Domain

Before proceeding to Phase 0.2, classify whether this is a software task. The
key question is: **does the task involve building, modifying, or architecting
software?** -- not whether the task *mentions* software topics.

**Software** (continue to Phase 0.2) -- the task references code,
repositories, APIs, databases, or asks to build, modify, debug, or deploy
software.

**Non-software brainstorming** (route to universal brainstorming) -- BOTH
conditions must be true:

- None of the software signals above are present.
- The task describes something the user wants to explore, decide, or think
  through in a non-software domain.

**Neither** (respond directly, skip all brainstorming phases) -- the input is
a quick-help request, error message, factual question, or single-step task
that does not need a brainstorm.

**If non-software brainstorming is detected:** Read
`references/universal-brainstorming.md` and use those facilitation principles
to brainstorm with the user naturally. Do not follow the software
brainstorming phases below.

#### 0.2 Assess Whether Brainstorming Is Needed

**Clear requirements indicators:**

- Specific acceptance criteria provided.
- Referenced existing patterns to follow.
- Described exact expected behavior.
- Constrained, well-defined scope.

**If requirements are already clear:**

Keep the interaction brief. Confirm understanding and present concise
next-step options rather than forcing a long brainstorm. Only write a short
requirements document when a durable handoff to planning or later review would
be valuable. Skip Phase 1.1 and 1.2 entirely and choose exactly one fast path:

- **Alignment only** -- use when no material product decision remains and no
  durable artifact is needed. Give a compact synthesis and proceed to Phase 4.
- **Confirm then capture** -- use when only 1-2 product decisions still need
  confirmation before writing. Ask those questions in Phase 1.3, then go to
  Phase 3.
- **Capture now** -- use when requirements are already clear and a durable
  requirements document would be valuable. Go straight to Phase 3.

Even on this fast path, verify any checkable claim about existing repo
infrastructure before writing it into a requirements document. If not verified,
label it as an unverified assumption.

#### 0.3 Assess Scope

Use the feature description plus a light repo scan to classify the work:

- **Lightweight** - small, well-bounded, low ambiguity
- **Standard** - normal feature or bounded refactor with some decisions to make
- **Deep** - cross-cutting, strategic, or highly ambiguous

If the scope is unclear, ask one targeted question to disambiguate and then
proceed.

### Phase 1: Understand the Idea

#### 1.1 Existing Context Scan

Scan the repo before substantive brainstorming. Match depth to scope:

**Lightweight** -- Search for the topic, check if something similar already
exists, and move on.

**Standard and Deep** -- Two passes:

**Constraint Check** -- Check project instruction files (`AGENTS.md`, and
`CLAUDE.md` only if retained as compatibility context) for workflow, product,
or scope constraints that affect the brainstorm. If these add nothing, move
on.

**Topic Scan** -- Search for relevant terms. Read the most relevant existing
artifact if one exists (brainstorm, plan, spec, skill, feature doc, or
`docs/solutions/` entry). When `docs/solutions/` exists, search frontmatter by
`files_touched`, `module`, `tags`, `problem_type`, `component`, and title
before opening full docs. Skim adjacent examples covering similar behavior.

If nothing obvious appears after a short scan, say so and continue. Two rules
govern technical depth during the scan:

1. **Verify before claiming** -- When the brainstorm touches checkable
   infrastructure (database tables, routes, config files, dependencies, model
   definitions), read the relevant source files to confirm what actually
   exists. Any claim that something is absent -- a missing table, an endpoint
   that does not exist, a dependency not in the manifest, a config option with
   no current support -- must be verified against the codebase first; if not
   verified, label it as an unverified assumption. This applies to every
   brainstorm regardless of topic.
2. **Defer design decisions to planning** -- Implementation details like
   schemas, migration strategies, endpoint structure, or deployment topology
   belong in planning, not here -- unless the brainstorm is itself about a
   technical or architectural decision, in which case those details are the
   subject of the brainstorm and should be explored.

**Slack context** (opt-in, Standard and Deep only) -- never auto-dispatch.
Route by condition:

- **Tools available + user asked**: Dispatch the available Slack research
  skill or tool with a brief summary of the brainstorm topic alongside Phase
  1.1 work. Incorporate findings into constraint and context awareness.
- **Tools available + user did not ask**: Note in output: "Slack tools
  detected. Ask me to search Slack for organizational context at any point, or
  include it in your next prompt."
- **No tools + user asked**: Note in output: "Slack context was requested but
  no Slack tools are available. Install and authenticate the Slack plugin to
  enable organizational context search."

#### 1.2 Product Pressure Test

Before generating approaches, challenge the request to catch misframing. Match
depth to scope:

**Lightweight:**

- Is this solving the real user problem?
- Are we duplicating something that already covers this?
- Is there a clearly better framing with near-zero extra cost?

**Standard:**

- Is this the right problem, or a proxy for a more important one?
- What user or business outcome actually matters here?
- What happens if we do nothing?
- Is there a nearby framing that creates more user value without more carrying
  cost? If so, what complexity does it add?
- Given the current project state, user goal, and constraints, what is the
  single highest-leverage move right now: the request as framed, a reframing,
  one adjacent addition, a simplification, or doing nothing?
- Favor moves that compound value, reduce future carrying cost, or make the
  product meaningfully more useful or compelling.
- Use the result to sharpen the conversation, not to bulldoze the user's
  intent.

**Deep** -- Standard questions plus:

- What durable capability should this create in 6-12 months?
- Does this move the product toward that, or is it only a local patch?

#### 1.3 Collaborative Dialogue

Follow the Interaction Rules above. Use the platform's blocking question tool
when available.

**Guidelines:**

- Ask what the user is already thinking before offering your own ideas. This
  surfaces hidden context and prevents fixation on AI-generated framings.
- Start broad (problem, users, value) then narrow (constraints, exclusions,
  edge cases).
- Clarify the problem frame, validate assumptions, and ask about success
  criteria.
- Make requirements concrete enough that planning will not need to invent
  behavior.
- Surface dependencies or prerequisites only when they materially affect
  scope.
- Resolve product decisions here; leave technical implementation choices for
  planning.
- Bring ideas, alternatives, and challenges instead of only interviewing.

**Exit condition:** Continue until the idea is clear OR the user explicitly
wants to proceed.

#### 1.3b Synthesis Checkpoint

Before moving to Phase 2 or Phase 3, summarize the current understanding in a
compact checkpoint. Cover:

- problem frame
- target user or stakeholder
- in-scope behavior
- out-of-scope boundary or non-goal
- success criteria
- unresolved product decisions, if any

If any of those cannot be stated concretely, ask one more targeted question
before proceeding.

If the checkpoint or later structured output starts drifting, read
`references/brainstorm-examples.md` before continuing.

### Phase 2: Explore Approaches

If multiple plausible directions remain, propose **2-3 concrete approaches**
based on research and conversation. Otherwise state the recommended direction
directly.

Use at least one non-obvious angle -- inversion (what if we did the opposite?),
constraint removal (what if X were not a limitation?), or analogy from how
another domain solves this. The first approaches that come to mind are usually
variations on the same axis.

Present approaches first, then evaluate. Let the user see all options before
hearing which one is recommended -- leading with a recommendation before the
user has seen alternatives anchors the conversation prematurely.

When useful, include one deliberately higher-upside alternative:

- Identify what adjacent addition or reframing would most increase usefulness,
  compounding value, or durability without disproportionate carrying cost.
  Present it as a challenger option alongside the baseline, not as the
  default. Omit it when the work is already obviously over-scoped or the
  baseline request is clearly the right move.

For each approach, provide:

- **Approach:** [short name]
- **Shape:** [2-3 sentence description]
- **Optimizes for:** [primary benefit]
- **Main risk:** [largest downside or uncertainty]
- **Best when:** [situation where this is the right fit]

Keep the format and order consistent across all approaches. Do not exceed 3
approaches. If the user needs to choose between them, keep the choice set to 2-4
options total.

After presenting all approaches, state your recommendation and explain why.
Prefer simpler solutions when added complexity creates real carrying cost, but
do not reject low-cost, high-value polish just because it is not strictly
necessary.

If one approach is clearly best and alternatives are not meaningful, skip the
menu and state the recommendation directly.

If relevant, call out whether the choice is:

- Reuse an existing pattern
- Extend an existing capability
- Build something net new

### Phase 3: Capture the Requirements

Write or update a requirements document only when the conversation produced
durable decisions worth preserving. Read `references/requirements-capture.md`
for the document template, formatting rules, and completeness checks. If a
visual aid may materially improve comprehension, also read
`references/visual-communication.md`.

For **Lightweight** brainstorms, keep the document compact. Skip document
creation when the user only needs brief alignment and no durable decisions
need to be preserved.

### Phase 3.5: Document Review

When a requirements document was created or updated, run `document-review` in
`mode:headless` on it before presenting handoff options. Pass the document path.
If the skill is somehow unavailable in the current environment, manually review
the document for clarity, scope, simplification opportunities, portability, and
completeness.

If document-review auto-applied fixes, note them briefly when presenting handoff
options. If it surfaces residual P0 or P1 findings, or a clearly blocking
top-ranked item, mention that so the user can decide whether to address it
before proceeding.

When document-review surfaces architectural or scope-shaping complexity that
looks heavier than the stated goal requires, call that out explicitly before
offering handoff options so the user can choose whether to keep or simplify the
documented shape.

When document-review surfaces runtime observability or validation blind spots,
call that out explicitly before offering handoff options so the user can decide
whether to sharpen the support story before planning.

When document review is complete, proceed to Phase 4.

### Phase 4: Handoff

Present next-step options and execute the user's selection. Read
`references/handoff.md` for the option logic, dispatch instructions, and
closing summary format.
