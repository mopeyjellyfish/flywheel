---
name: fw-ideate
description: "Generate and critically filter grounded ideas for a repo, subsystem, product area, or software topic before choosing one to brainstorm. Use when the user asks what to improve, wants proactive backlog shaping, requests idea generation, or wants the AI to surface the strongest next bets instead of refining a single chosen idea."
metadata:
  argument-hint: "[feature, focus area, path, or constraint]"
---

# Generate Strong Next Ideas

Use the actual current date from runtime context when dating ideation
documents.

`/fw:ideate` precedes `/fw:brainstorm`.

- `/fw:ideate` answers: "What are the strongest ideas worth exploring?"
- `/fw:brainstorm` answers: "What should one chosen idea mean?"
- `/fw:plan` answers: "How should it be built?"

This workflow produces a ranked ideation artifact in `docs/ideation/` when
persistence is requested. It does **not** write requirements, plans, or code.

**IMPORTANT: All file references in generated documents must use repo-relative
paths** such as `src/server/router.ts`, never absolute paths.

When directly invoked, always ideate. If the input already contains one clear
solution, still test adjacent possibilities unless the user explicitly says
they only want brainstorming or planning.

## Interaction Method

Use the platform's blocking question tool when available. Otherwise present
numbered options in chat and wait for the user's reply before proceeding.

Ask one question at a time. Prefer concise single-select choices when natural
options exist.

## Focus Hint

<focus_hint> #$ARGUMENTS </focus_hint>

Interpret any provided argument as optional context. It may be:

- a concept such as `DX improvements`
- a path such as `skills/fw-review/`
- a constraint such as `quick wins` or `low-risk`
- a volume hint such as `top 3`, `10 ideas`, or `raise the bar`

If no argument is provided, proceed with open-ended ideation.

## Reference Loading Map

Do not load every reference by default. Load only what the current phase needs:

- Read `references/universal-ideation.md` only when the ideation topic has no
  meaningful repo surface or no software implementation surface.
- Read `references/subagent-contract.md` only when you choose delegated
  grounding or delegated ideation.
- Read `references/post-ideation-workflow.md` only after the raw candidate list
  exists and you are ready to filter, present, save, or hand off the results.
- Read `references/shortlist-template.md` only when presenting the final
  shortlist or writing `docs/ideation/`.

## Working Tags

Use XML-style tags when passing dynamic content between phases or to delegated
subtasks. Keep tag names stable across the workflow.

Core tags:

- `<focus_hint>`
- `<grounding_summary>`
- `<generation_frame>`
- `<generation_requirements>`
- `<raw_candidates>`
- `<survivor_shortlist>`
- `<selected_idea>`

## Core Principles

1. **Ground before ideating** - Scan the codebase, instructions, docs, and
   nearby artifacts before proposing improvements.
2. **Generate many -> critique all -> explain survivors only** - Quality comes
   from rejection with reasons, not from optimistic ranking of the first few
   ideas.
3. **Prefer leverage over novelty** - Strong ideas make future work easier,
   safer, or faster.
4. **Route action into brainstorming** - Ideation finds promising directions;
   `/fw:brainstorm` defines one chosen direction precisely enough for planning.
5. **Persistence is opt-in** - The conversation loop is already useful. Save
   only when the user wants a durable artifact or a handoff.

## Execution Flow

### Phase 0: Resume, Classify, and Scope

#### 0.1 Resume Existing Ideation When Appropriate

If the user references an ideation document or there is an obvious recent
matching file in `docs/ideation/`:

- read it
- ask whether to continue from it or start fresh
- if continuing, preserve previous idea statuses and update the existing file
  instead of creating a duplicate

#### 0.2 Classify the Ideation Subject

Classify the **subject of ideation**, not just the current working directory.
Use three buckets:

- **Repo-grounded** - the topic is about this codebase, its workflows, its
  architecture, or its backlog
- **Outside this repo, still software** - the topic is about a product, app,
  page, feature, UX flow, API, SaaS, or software system not bounded by the
  current repo
- **Non-software or general ideation** - the topic has no meaningful software
  implementation surface

State the inferred approach in one sentence using plain language. If the mode
is ambiguous, ask one confirmation question before grounding.

When the topic lands in the non-software bucket, load
`references/universal-ideation.md` and use it in place of the software-specific
framing below.

#### 0.3 Interpret Focus, Volume, and Issue Intent

Infer:

- **focus context** - concept, path, constraint, or open-ended
- **volume override** - any hint that changes how many survivors to present
- **issue or feedback intent** - whether the user explicitly wants issue
  patterns, support themes, or bug-report signals included in grounding

Default volume:

- generate a broad raw list across multiple frames
- keep the top 5-7 survivors by default

Honor clear overrides such as `top 3`, `10 ideas`, `quick wins`, `go deep`, or
`raise the bar`.

#### 0.4 Light Context Intake for Outside-Repo Topics

Skip this step for repo-grounded ideation.

Apply the discrimination test before asking anything: would changing one piece
of the user's current context materially change which ideas survive? If yes,
proceed without questions. If no, ask 1-3 narrowly chosen questions and stop
as soon as the answer space is constrained enough.

When the user already provided rich context, confirm it briefly and move on.

### Phase 1: Ground the Topic

Gather grounding before generating ideas. Match the grounding to the mode:

#### Repo-Grounded

1. Read `AGENTS.md`. Read `CLAUDE.md` only if it is retained as compatibility
   context. Read `README.md` only when it adds useful shape.
2. Do a shallow repo scan:
   - top-level directories
   - directly relevant docs
   - nearby `docs/brainstorms/`, `docs/plans/`, or `docs/solutions/` artifacts
   - adjacent files or tests that reveal the current shape of the area
   - when `docs/solutions/` exists, search it by `files_touched`, `module`,
     `tags`, `problem_type`, `component`, and title before reading full docs
3. Verify any claim about current capabilities, missing pieces, or repo
   boundaries against actual files before using it as grounding.
4. If the user explicitly asked for issue, bug, or feedback themes, gather them
   from accessible local artifacts or issue tooling. If unavailable, say so and
   continue without blocking.
5. Use web research when the user explicitly asks for it or when current
   external signals materially affect the idea quality. Skip it when the user
   says `no external research` or equivalent.

#### Outside This Repo, Still Software

1. Synthesize the user's context into a short topic summary.
2. Ask only the questions that would materially change which ideas survive.
3. Use web research by default unless the user explicitly skips it.
4. Treat repo-specific learnings as optional, not authoritative.

#### Non-Software or General Topics

1. Treat the user's stated context as the primary grounding surface.
2. Ask only the questions that materially change which ideas survive.
3. Use web research when current external knowledge would materially improve
   the candidate set and the user has not opted out.
4. Do not run repo-specific scans or import repo conventions as if they were
   authoritative for the topic.

#### Consolidated Grounding Summary

Condense the results into a short grounding summary using only the sections
that produced signal:

- **Codebase context** or **Topic context**
- **Pain points / opportunity hooks**
- **Existing artifacts or prior learnings**
- **Issue / feedback themes**
- **External context**

Wrap the consolidated result in `<grounding_summary>` tags. Use child tags only
when they help clarity, such as `<context_mode>`, `<pain_points>`,
`<existing_artifacts>`, `<issue_themes>`, and `<external_context>`.

Grounding failures are warn-and-proceed, not blockers.

When parallel delegation is available and explicitly permitted by the host or
caller, grounding work may be dispatched in parallel. Otherwise do the same
work inline.

### Phase 2: Divergent Ideation

Generate the full raw candidate list before critiquing anything.

#### 2.1 Choose Execution Mode

Default to inline ideation.

Use delegated ideation only when all of the following are true:

- the host supports delegation and current policy permits it
- the topic is broad enough that multiple independent frames add real value
- the user asked for breadth, open-ended exploration, or a larger candidate set,
  or the topic is clearly standard/deep rather than narrow

Stay inline when any of the following are true:

- the topic is tightly scoped to one subsystem or one pain point
- the user wants a quick shortlist such as `top 3` or `quick wins`
- the current grounding already points to a compact obvious candidate set

If delegating, read `references/subagent-contract.md` first and follow it
exactly.

Dispatch guidance:

- use **4** ideation subtasks for standard breadth
- use **6** ideation subtasks only for deep or clearly open-ended ideation

#### 2.2 Generate Raw Candidates

Use these six frames as starting biases, not hard constraints:

1. **Pain and friction** - What is repeatedly slow, brittle, unclear, or
   annoying?
2. **Inversion, removal, or automation** - What can be removed, inverted, or
   automated away?
3. **Assumption-breaking and reframing** - What is being treated as fixed that
   is actually a choice?
4. **Leverage and compounding** - What makes many later tasks cheaper, safer,
   or faster once it lands?
5. **Cross-domain analogy** - How do structurally similar problems get solved
   elsewhere?
6. **Constraint-flipping** - What becomes visible if the obvious constraint is
   pushed to an extreme or inverted?

If issue or feedback themes were explicitly requested and strong themes were
found, those themes may replace some default frames.

For each raw idea, capture:

- title
- summary
- why it matters
- grounding hooks or evidence
- likely cost, risk, or complexity

When running inline, still think in terms of a tagged handoff shape:

```xml
<focus_hint>...</focus_hint>
<grounding_summary>...</grounding_summary>
<generation_frame>...</generation_frame>
<generation_requirements>
Generate raw candidates only. Do not critique yet. Prefer grounded, specific,
non-duplicative ideas.
</generation_requirements>
```

After generation:

1. merge and dedupe the raw list
2. synthesize only the strongest cross-cutting combinations
3. weight toward the focus hint without excluding stronger adjacent ideas

Wrap the merged result in `<raw_candidates>` tags before moving to critique.

Do not present the raw list yet.

After the raw candidate list exists, read
`references/post-ideation-workflow.md` and follow it for filtering,
presentation, persistence, and handoff.

## Quality Bar

Before finishing, check:

- ideas are grounded in repo truth or explicit user context
- the raw candidate list existed before filtering
- every rejected idea has a concrete reason
- survivors materially beat a naive "give me ideas" list
- chosen follow-up routes to `/fw:brainstorm`, not directly to implementation
- any saved artifact uses repo-relative paths and remains portable

## Example Prompts

- "Use $fw-ideate to find the highest-leverage improvements in this repo."
- "Use $fw-ideate on `skills/fw-review/` and give me the top 3 next bets."
- "Use $fw-ideate to propose quick wins for our onboarding flow."
- "Use $fw-ideate to surface what would make the next month of work easier."
