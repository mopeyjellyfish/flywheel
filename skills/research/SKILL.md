---
name: research
description: "Investigate a topic with repo grounding plus current published sources, rank the evidence, and condense it into guidance that sharpens ideation, brainstorming, review, or planning. Use when the immediate job is topic research, current-practice discovery, or targeted evidence gathering."
metadata:
  argument-hint: "[topic, question, feature, or problem to research]"
---

# Research A Topic

Use the actual current date from runtime context when dating saved research
briefs and freshness notes.

`$flywheel:research` is a helper skill first. Prefer pulling it into
`ideate`, `brainstorm`, `review`, or `plan` when better evidence would sharpen
that stage's real artifact. Use it directly when the user explicitly asks for
research or when the main artifact should be a reusable research brief.

Do not force a separate visible research stage when the real job is choosing a
direction, sharpening ideas, or reviewing changed code. Research exists to
improve that stage's output, not replace it.

**When directly invoked, always research.** Do not stop at suggesting search
terms or offering to browse later. Gather the evidence, rank what matters, and
return a concise research brief.

**IMPORTANT: All file references in saved research briefs must use repo-relative
paths** such as `skills/plan/SKILL.md`, never absolute paths.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Use the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

Ask only the smallest number of questions needed to sharpen topic framing,
source priority, or output usefulness. If the topic is already clear enough to
research responsibly, proceed without asking for permission to search.

## Input

<research_topic> #$ARGUMENTS </research_topic>

If the topic is blank:

- infer it from the active requirements doc, plan, or current repo task only
  when one obvious topic is already in focus
- otherwise ask what topic or question needs research

## Reference Loading Map

Do not load every reference by default. Load only what the current phase needs:

- Read `../references/research/activation-heuristics.md` when deciding whether
  this should stay a direct research pass, stay repo-local, or persist a
  durable brief.
- Read `../references/research/source-ranking-and-synthesis.md` when selecting
  sources, decomposing threads, ranking evidence, or deciding whether bounded
  parallel research is justified.
- Read `../references/research/research-brief-contract.md` when preparing the
  final brief or saving a durable artifact under `docs/research/`.

## Core Principles

1. **Clarify only when it changes the result** - default to researching on the
   user's behalf when the topic is already clear enough.
2. **Ground locally before claiming externally** - for repo-grounded topics,
   inspect repo truth and durable local learnings before relying on published
   sources.
3. **Prefer primary and official sources** - use official docs, original
   papers, or first-party material when they exist.
4. **Rank evidence instead of dumping sources** - relevance, source quality,
   freshness, and confidence matter more than link count.
5. **Keep uncertainty visible** - distinguish established facts, model
   inferences, conflicts, and open questions.
6. **Break broad topics into threads** - use explicit subquestions for large or
   fuzzy topics instead of one undifferentiated search pass.
7. **Use bounded parallelism only when it earns its keep** - independent
   threads may run in parallel when the host and policy allow it; tightly
   coupled research stays serial.
8. **Persist only when reuse is likely** - durable briefs should exist when
   later `ideate`, `brainstorm`, or `plan` work will likely benefit.
9. **Choose the simplest viable research mode** - stay inline for narrow work,
   delegate to a dedicated researcher when shaping is the main workflow, and
   orchestrate bounded parallel workers only for broad independent threads.
10. **Start wide, then narrow** - begin with broad queries or scans that map
    the decision surface, then refine into targeted follow-up searches.

## Workflow

### Phase 1: Frame The Topic

Classify the topic:

- **Repo-grounded** - this checkout, its workflow, its architecture, or its
  backlog is the authority surface
- **Outside this repo, still software** - current best practices, products,
  APIs, or engineering approaches matter more than local repo patterns
- **General or non-software** - the user's context and current published
  information are the main grounding surfaces

If the topic is broad, decompose it into 2-5 explicit research threads, such
as:

- definitions and decision surface
- current best practices
- competing approaches and tradeoffs
- risks or failure modes
- examples or precedents

#### Choose Research Execution Strategy

Pick exactly one mode before gathering broad evidence:

- **Inline** - default for narrow or moderately scoped questions with one main
  source family, one repo area, or one obvious research thread. This is the
  fastest and cheapest mode and should stay mostly serial.
- **Delegated** - use when `ideate`, `brainstorm`, or `plan` remains the main
  workflow artifact, but the evidence gap is non-trivial enough that a
  dedicated researcher should return a brief first. The shaping agent should
  hand off a bounded research task and keep the shaping artifact primary.
- **Orchestrated** - use only when the topic is broad, breadth-first, and
  decomposes into 2-5 independent threads whose merge cost is lower than the
  latency savings. A lead researcher should define the threads, effort budget,
  and output contract, then synthesize the worker findings serially.

Default to the simplest mode that can answer responsibly. If the host does not
support delegation or parallel workers, keep the chosen strategy visible but do
the equivalent work serially.

### Phase 2: Gather Evidence

For repo-grounded topics, inspect:

- relevant skills, refs, docs, plans, and solution entries
- nearby evals and scorer files when the topic changes workflow behavior
- plugin manifests or command-surface docs when discovery or packaging is in
  scope

For external research:

- gather only the smallest source set that materially improves the answer
- start with broad discovery queries, then narrow once the source landscape is
  visible
- prefer specialized connectors or tools over generic web search when they
  match the source family
- prefer official docs and primary sources for technical questions
- honor explicit `no external research` or source-restriction constraints

When bounded parallel research is available and justified, split only into
independent threads. Each worker should return a compact finding note or
artifact reference, not its full trace. Otherwise gather the same evidence
inline or serially.

### Phase 3: Rank And Synthesize

For each material finding, identify:

- what changed the decision surface
- whether it is a **Fact**, **Inference**, or **Open Question**
- which sources support it
- why it ranks above lower-value findings

Surface disagreements explicitly. If sources conflict, say which source looks
stronger and why, rather than flattening the conflict into false certainty.

### Phase 4: Decide Whether To Persist

Write a durable brief under `docs/research/` when:

- the topic is broad or likely to recur
- later shaping work should reuse the findings
- the user asked for a saved artifact
- the synthesis captures current best practices worth preserving for this repo

For narrow one-off questions, return the brief inline and skip file creation.
When the research happened in service of `ideate`, `brainstorm`, or `review`,
fold the findings back into that stage instead of turning the response into a
standalone report unless the user explicitly asked for one.

When saving, ensure `docs/research/` exists first and use the brief contract in
`../references/research/research-brief-contract.md`.

## Output Contract

Return a concise research brief in this order:

```markdown
## Topic Frame
[What is being researched and why]

## Execution Strategy
- **Mode:** `inline` | `delegated` | `orchestrated`
- **Why this mode:** [Complexity, latency, or independence rationale]
- **Effort budget:** [Small serial pass / one dedicated researcher / bounded parallel threads]

## Research Threads
- [Subquestion or dimension]

## Ranked Findings
1. **<Short finding title>** — [Fact | Inference | Open Question]
   - Why it matters: ...
   - Confidence: ...
   - Sources: ...

## Source Notes
- [Key sources with URLs or repo-relative paths and why they were trusted]

## Conflicts And Uncertainty
- [Disagreements, stale edges, or missing proof]

## Reuse Guidance
- [Whether this should be saved or reused by `ideate`, `brainstorm`, or `plan`]

## Next Move
- [Which Flywheel stage should consume the result next]
```

If a durable brief was written, include the repo-relative path in `Reuse
guidance`.
