---
name: spin
description: "Capture solved problems and durable lessons into the active repo's docs/solutions/ so future ideate, brainstorm, plan, and work runs in that repo can reuse them. Use at the end of completed work, after a verified fix, or when a repeated pattern should become searchable repo knowledge."
metadata:
  argument-hint: "[lesson, problem, file path, or blank to infer from the recent session]"
---

# Add Energy Back to the Flywheel

Use the actual current date from runtime context when dating solution documents or
refreshing older learnings.

`$flywheel:spin` is the Flywheel knowledge-capture stage. It turns verified
session learnings into searchable documentation under the active repo's
`docs/solutions/`.

This is where solved problems become stored energy. A non-obvious bug fix, a
durable workflow improvement, a clarified repo rule, or a user correction that
changed how Flywheel should behave on project work should not stay trapped in
one session if it will matter again.

`$flywheel:spin` may be called directly, or offered after `$flywheel:commit`
finishes when the completed project work exposed a durable lesson worth
keeping.

**When directly invoked, always spin.** If the lesson is still vague or the
problem is not actually solved, clarify or defer. Do not silently skip the
workflow.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Use the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

Ask one question at a time. Prefer concise single-select choices when natural
options exist. Keep predictable labels recommended-first and rely on the
host's native freeform final path when it exists.

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
5. **Keep the knowledge store close to future use** - solution docs live in the
   active repo's `docs/solutions/`, where `ideate`, `brainstorm`, `plan`, and
   `work` can consult them in that same repo.
6. **Prefer project-specific guidance over abstract reflection** - capture what
   will help future repo work, not generic commentary about agents.
7. **Offer spin, do not force it** - when `spin` is merely being suggested at
   the end of another workflow, get the user's approval before writing docs.
8. **Every spin includes bounded housekeeping** - refresh nearby discoverability
   and contradiction markers while the context is fresh.
9. **Prefer one canonical answer per lesson family** - update, supersede, or
   cross-link explicitly instead of letting overlapping docs silently compete.

## Input Hint

<spin_input> #$ARGUMENTS </spin_input>

Interpret the input as one of:

- a direct lesson to capture
- a solved problem description
- a file path to an existing doc to refresh
- a selected candidate summary passed from another Flywheel stage
- blank, meaning "infer the strongest candidates from the recent session"

## Upstream Handoff Contract

When another Flywheel stage launches `$flywheel:spin`, pass the already selected
lesson as the argument instead of calling `$flywheel:spin` blank.

Good upstream arguments look like:

- `Document the retry-timeout mismatch fix in the Kafka consumer`
- `Capture the Redis cache invalidation lesson from this session`
- `Capture the compact plan-work-commit correction for Flywheel's project workflow`
- `Refresh docs/solutions/workflow-issues/test-fixture-setup-2026-04-18.md`

If the input clearly names a selected candidate from `$flywheel:work` or another
stage, **skip candidate rediscovery in Phase 0** and move straight into capture.

## What It Writes

Primary output:

- a new or updated file under the active repo's `docs/solutions/<category>/`
- optional bounded housekeeping on the strongest neighboring docs when tags,
  discoverability, or supersession markers need repair

Default filename for new docs:

- `<sanitized-problem-slug>-<YYYY-MM-DD>.md`

The document must use YAML frontmatter and the stable section order from
`assets/resolution-template.md`.

`category` in frontmatter stores the **directory slug only**, for example
`build-errors` or `workflow-issues`. The write path is derived separately as
`docs/solutions/<category>/`.

## Search Contract

The active repo's Flywheel knowledge store is designed for cheap lookup.
Future stages in that repo should search `docs/solutions/` by frontmatter
before reading full docs.

Filter rules before ranking:

1. prefer docs with `doc_status: active`
2. if a strong hit has `superseded_by`, follow that path first and treat the
   current doc as historical context only

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
   - the commit summary or PR story
   - the final implementation summary
   - the tests or validation work that proved the fix
   - answers and preferences surfaced during `ideate`, `brainstorm`, or `plan`
   - explicit user corrections that changed the repo's workflow contract
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
- a chosen or rejected architecture or pattern decision that future work in the
  repo should reuse
- a simplification or maintainability heuristic that reduced durable complexity
- a clarified repo rule that future planning or implementation should follow
- a repeated preference or constraint revealed during `ideate`, `brainstorm`,
  or `plan` that future project work should inherit
- a user correction that changed Flywheel's project-workflow contract in a way
  future repo work should inherit
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

Both modes still perform the bounded housekeeping pass. Lightweight mode only
shrinks how far that housekeeping reaches.

### Phase 2: Classify and Search the Knowledge Store

Read `references/schema.yaml` and `references/yaml-schema.md`.

Then:

1. determine whether the learning is on the **bug** track or the
   **knowledge** track
2. choose `problem_type`, `component`, `severity`, and any track-specific
   fields using only schema values
3. choose the target category slug from the category mapping and derive the
   write path as `docs/solutions/<category>/`
4. search the active repo's `docs/solutions/` for related or overlapping docs

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
| **Replacement** - newer lesson materially replaces older guidance | Write or refresh the new canonical doc, mark the older doc `doc_status: superseded`, and set `superseded_by` |
| **Moderate** - same area, different angle or remedy | Create a new doc and link the related one |
| **Low or none** | Create a new doc |

When classifying the target doc, assume:

- new or refreshed canonical docs should use `doc_status: active`
- docs kept only as historical context should use `doc_status: superseded`
- knowledge-track docs should always say **when** the guidance applies
- every doc should have strong `files_touched` and `tags`, since later stages
  search those first

### Phase 3: Canonicalize and Housekeep the Neighborhood

Every spin includes a bounded housekeeping pass.

This pass is intentionally local:

- inspect only the strongest overlapping docs from Phase 2
- touch the selected doc plus at most **2** neighboring docs unless the user
  explicitly asks for deeper cleanup
- prefer metadata and short-note refreshes over full rewrites of neighboring
  docs

For each neighboring overlap, choose exactly one action:

1. **Leave alone** - still accurate and discoverable
2. **Refresh discoverability** - improve `tags`, `files_touched`, `module`, or
   `last_updated`
3. **Cross-link** - add `related_docs` or Related notes because both docs stay
   valid
4. **Supersede** - mark the older doc `doc_status: superseded`, set
   `superseded_by`, and record the replaced path in the canonical doc's
   `supersedes`

Do not leave silent contradiction behind. If two docs appear to answer the same
question differently, resolve that during the spin by updating one, superseding
one, or narrowing their applicability explicitly.

### Phase 4: Assemble the Solution Doc

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
3. make `tags` and `module` strong enough that a later agent can find the doc
   cheaply
4. write only what will help future work
5. avoid vague retrospectives or process theatre

When updating an existing doc:

- preserve its file path
- preserve its overall framing unless the problem definition has materially
  changed
- refresh stale examples, prevention notes, and related references
- add `last_updated: YYYY-MM-DD` to frontmatter if it is not already present
- add or tighten `related_docs`, `supersedes`, or `superseded_by` when the
  neighborhood analysis says this doc should now carry that relationship

### Phase 5: Mode-Specific Execution

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
speed matters more than exhaustive consolidation, but it must still:

- avoid obvious duplicates
- refresh the target doc's own tags and `files_touched`
- mark clear replacements as superseded when they are encountered

### Phase 6: Discoverability Check

After writing the solution doc, check whether a future agent would discover the
knowledge store from the repo's main discovery surfaces.

Assess whichever of these exist:

- `AGENTS.md`
- `CLAUDE.md`
- `README.md`

The goal is not to force imperative workflow instructions into those files. The
goal is simple discoverability:

- that the active repo's `docs/solutions/` exists
- what kind of knowledge lives there
- enough about the frontmatter to search it effectively
- when it is likely relevant, such as ideating, planning, implementing, or
  debugging in a documented area

If the spirit is already satisfied, do nothing.

If not, propose the smallest natural addition and ask before editing when the
workflow is only offering spin. When the user explicitly asked to improve the
Flywheel knowledge flow itself, making that small discovery edit is in scope.

### Phase 7: Handoff

Summarize:

- the file created or updated
- whether a prior doc was refreshed instead of duplicated
- any neighboring docs refreshed, cross-linked, or marked superseded
- the lesson captured
- what future task should now be easier
- any additional candidate learnings still worth spinning

If multiple good candidates remain, offer to spin the next one.
