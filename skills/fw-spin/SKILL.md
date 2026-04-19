---
name: fw-spin
description: "Capture solved problems and durable lessons into docs/solutions/ so future ideate, brainstorm, plan, and work runs can reuse them. Use at the end of completed work, after a verified fix, or when a repeated pattern should become searchable repo knowledge."
metadata:
  argument-hint: "[lesson, problem, file path, or blank to infer from the recent session]"
---

# Add Energy Back to the Flywheel

Use the actual current date from runtime context when dating solution documents or
refreshing older learnings.

`/fw:spin` is the Flywheel knowledge-capture stage. It turns verified session
learnings into searchable documentation under `docs/solutions/`.

This is where solved problems become stored energy. A non-obvious bug fix, a
durable workflow improvement, or a clarified project rule should not stay
trapped in one session if it will matter again.

`/fw:spin` may be called directly, or offered after `/fw:work` finishes.

**When directly invoked, always spin.** If the lesson is still vague or the
problem is not actually solved, clarify or defer. Do not silently skip the
workflow.

## Interaction Method

Use the platform's blocking question tool when available. Otherwise present
numbered options in chat and wait for the user's reply.

Ask one question at a time. Prefer concise single-select choices when natural
options exist.

## Reference Loading Map

Do not preload every support file. Load only what the current phase needs:

- Read `references/schema.yaml` when classifying the learning, validating YAML
  frontmatter, or checking allowed enum values.
- Read `references/yaml-schema.md` when mapping `problem_type` to
  `docs/solutions/` categories, deciding search strategy, or checking retrieval
  fields.
- Read `assets/resolution-template.md` only when assembling or refreshing the
  final solution document.

## Core Principles

1. **Capture only verified lessons** - spin is for solved or clearly decided
   problems, not in-progress guesses.
2. **One durable doc beats a chat recap** - the point is future retrieval by
   agents and humans, not a pretty summary in the current turn.
3. **Search before writing** - avoid duplicate docs when an existing solution
   already covers the same problem, root cause, and fix.
4. **Make retrieval cheap** - use stable frontmatter, predictable categories,
   and reusable section order so later stages can grep frontmatter before
   reading the full doc.
5. **Keep the knowledge store close to future use** - solution docs live in
   `docs/solutions/`, where `ideate`, `brainstorm`, `plan`, and `work` can
   consult them.
6. **Offer spin, do not force it** - when `spin` is merely being suggested at
   the end of another workflow, get the user's approval before writing docs.

## Input Hint

<spin_input> #$ARGUMENTS </spin_input>

Interpret the input as one of:

- a direct lesson to capture
- a solved problem description
- a file path to an existing doc to refresh
- a selected candidate summary passed from another Flywheel stage
- blank, meaning "infer the strongest candidates from the recent session"

## Upstream Handoff Contract

When another Flywheel stage launches `/fw:spin`, pass the already selected
lesson as the argument instead of calling `/fw:spin` blank.

Good upstream arguments look like:

- `Document the retry-timeout mismatch fix in the Kafka consumer`
- `Capture the Redis cache invalidation lesson from this session`
- `Refresh docs/solutions/workflow-issues/test-fixture-setup-2026-04-18.md`

If the input clearly names a selected candidate from `/fw:work` or another
stage, **skip candidate rediscovery in Phase 0** and move straight into capture.

## What It Writes

Primary output:

- a new or updated file under `docs/solutions/<category>/`

Default filename for new docs:

- `<sanitized-problem-slug>-<YYYY-MM-DD>.md`

The document must use YAML frontmatter and the stable section order from
`assets/resolution-template.md`.

`category` in frontmatter stores the **directory slug only**, for example
`build-errors` or `workflow-issues`. The write path is derived separately as
`docs/solutions/<category>/`.

## Search Contract

The Flywheel knowledge store is designed for cheap lookup. Future stages should
search `docs/solutions/` by frontmatter before reading full docs.

Search in this order when the current area may already be documented:

1. `files_touched` or path fragments
2. `module`
3. `tags`
4. `problem_type`
5. `component`
6. `title`

Read frontmatter first. Fully read only the strongest hits.

## Workflow

### Phase 0: Identify What Should Be Spun

If `<spin_input>` names one clear lesson, use it.

If `<spin_input>` contains a selected candidate summary passed from another
Flywheel stage, treat it as already chosen and skip candidate discovery.

If `<spin_input>` is blank:

1. inspect recent session artifacts that can reveal durable learnings, such as:
   - the current diff
   - the latest plan in `docs/plans/`
   - resolved review findings
   - the final implementation summary
   - the tests or validation work that proved the fix
2. identify at most **3** candidate learnings worth preserving
3. for each candidate, give:
   - a short title
   - why it is worth remembering
   - whether it looks like a bug-track or knowledge-track entry
4. ask the user which candidate to spin, or whether to spin all of them

Good spin candidates include:

- a bug with a non-obvious root cause
- a workflow or tooling improvement that removed friction
- a reusable testing or validation pattern
- a clarified repo rule that future planning or implementation should follow
- a repeated dead end that future work should avoid

If nothing non-trivial surfaced, say so and stop. Do not manufacture a lesson
just to complete the workflow.

### Phase 1: Choose Capture Depth

Present two capture modes unless the user already specified one:

1. **Full** (recommended) - duplicate-aware, cross-referenced, and tuned for
   durable retrieval.
2. **Lightweight** - one-pass capture for a simple fix or a context-tight
   session.

If the user explicitly asks for a quick pass, honor lightweight mode. If the
user explicitly asks for a thorough write-up, honor full mode.

### Phase 2: Classify and Search the Knowledge Store

Read `references/schema.yaml` and `references/yaml-schema.md`.

Then:

1. determine whether the learning is on the **bug** track or the
   **knowledge** track
2. choose `problem_type`, `component`, `severity`, and any track-specific
   fields using only schema values
3. choose the target category slug from the category mapping and derive the
   write path as `docs/solutions/<category>/`
4. search `docs/solutions/` for related or overlapping docs

For the overlap search:

- search frontmatter first using `title`, `module`, `files_touched`, `tags`,
  `problem_type`, and `component`
- if there are strong candidates, read full docs only for the strongest hits
- score overlap across:
  - problem statement
  - root cause or guidance theme
  - solution or recommendation
  - referenced files or module
  - prevention or applicability rules

Use this decision rule:

| Overlap | Action |
| --- | --- |
| **High** - same problem, same cause, same fix or guidance | Update the existing doc instead of creating a duplicate |
| **Moderate** - same area, different angle or remedy | Create a new doc and link the related one |
| **Low or none** | Create a new doc |

### Phase 3: Assemble the Solution Doc

Read `assets/resolution-template.md` and preserve its section order unless the
user explicitly asks for a different structure.

Use evidence from the recent session:

- verified fix details
- validation steps or tests
- failed attempts that are still worth recording
- decisions or tradeoffs that materially explain the result

When creating or refreshing a doc:

1. assemble YAML frontmatter that matches the schema
2. keep repo-relative paths in `files_touched` and examples
3. write only what will help future work
4. avoid vague retrospectives or process theatre

When updating an existing doc:

- preserve its file path
- preserve its overall framing unless the problem definition has materially
  changed
- refresh stale examples, prevention notes, and related references
- add `last_updated: YYYY-MM-DD` to frontmatter if it is not already present

### Phase 4: Mode-Specific Execution

#### Full Mode

Do the complete pass:

- classify carefully
- run the overlap search
- cross-link related docs when useful
- record failed approaches when they would save future time
- update instead of duplicating when overlap is high

#### Lightweight Mode

Do a compact single pass:

- classify using the schema
- perform only a narrow obvious-overlap scan
- write the doc with the minimum durable detail that would help next time
- skip broader cross-referencing unless a related doc is immediately obvious

Lightweight mode is allowed to miss a subtle overlap. That is acceptable when
speed matters more than exhaustive consolidation.

### Phase 5: Discoverability Check

After writing the solution doc, check whether a future agent would discover the
knowledge store from the repo's main discovery surfaces.

Assess whichever of these exist:

- `AGENTS.md`
- `CLAUDE.md`
- `README.md`

The goal is not to force imperative workflow instructions into those files. The
goal is simple discoverability:

- that `docs/solutions/` exists
- what kind of knowledge lives there
- enough about the frontmatter to search it effectively
- when it is likely relevant, such as ideating, planning, implementing, or
  debugging in a documented area

If the spirit is already satisfied, do nothing.

If not, propose the smallest natural addition and ask before editing when the
workflow is only offering spin. When the user explicitly asked to improve the
Flywheel knowledge flow itself, making that small discovery edit is in scope.

### Phase 6: Handoff

Summarize:

- the file created or updated
- whether a prior doc was refreshed instead of duplicated
- the lesson captured
- what future task should now be easier
- any additional candidate learnings still worth spinning

If multiple good candidates remain, offer to spin the next one.
