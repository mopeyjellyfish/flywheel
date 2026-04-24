---
name: docs
description: "Write or refresh Diataxis project docs. Use when setup, APIs, CLI flows, config, workflows, or behavior changed."
---

# Write Diataxis Docs

Use the actual current date from runtime context when dating newly created
documentation or updating dated docs.

`$fw:docs` is Flywheel's documentation stage. It turns repo truth into
clear project docs organized by Diataxis: tutorial, how-to, reference, and
explanation.

Use it directly when the user asks for docs work, or as an optional handoff
after `$fw:work` when implementation likely changed what users, operators,
or other developers need to read.

**When directly invoked, always do the docs work.** If the honest answer is
"no docs change is needed," explain why from repo truth and stop instead of
inventing filler docs.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Call the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When the workflow spans multiple material steps, use the host task-tracking
tool named in `../references/host-interaction-contract.md` to create and
maintain a short task list.

Ask one question at a time. Prefer narrow choices when deciding between a
change-scoped docs pass and a broader docs sweep. When the likely answer space
is predictable, keep the choice labels recommended-first and rely on the
host's native freeform final path when it exists.

When the stage is being *offered* from another workflow, get the user's approval
before writing docs. When the user invoked `$fw:docs` directly, proceed
unless a broad rewrite needs explicit scope confirmation.

## Reference Loading Map

Do not preload every support file. Load only what the current phase needs:

- Read `references/diataxis-map.md` when classifying documentation work across
  tutorial, how-to, reference, and explanation, or when deciding where a new
  doc should live.

## Core Principles

1. **Prefer change-scoped docs first** - update the docs touched by the recent
   change before proposing a repo-wide documentation rewrite.
2. **Ground every claim in repo truth** - commands, flags, config keys, API
   shapes, and setup steps must come from the codebase or existing validated
   docs, not memory.
3. **Respect Diataxis boundaries** - do not blur tutorial, how-to, reference,
   and explanation into one catch-all page.
4. **Update before duplicating** - refresh the strongest existing doc before
   creating a competing one.
5. **Keep docs reviewable with the code** - when docs work follows
   implementation, keep it in the same branch before review and commit.
6. **Ask before broad rewrites** - a large docs sweep changes product surface
   area and should not be smuggled in through a small feature handoff.

## Input Hint

<docs_input> #$ARGUMENTS </docs_input>

Interpret the input as one of:

- a change summary to document
- a file path or doc path to refresh
- a repo-wide documentation request
- blank, meaning "infer the likely docs work from the current branch, recent
  diff, or latest plan"

## Upstream Handoff Contract

When another Flywheel stage offers `$fw:docs`, it should ask first:

- "Do you want a Diataxis docs pass before review?"

If the user agrees, pass a change-scoped argument instead of calling
`$fw:docs` blank when possible.

Good upstream arguments look like:

- `Document the new auth CLI flow before review`
- `Update docs for the webhook retry-policy config change`
- `Refresh project docs after the checkout workflow rewrite`

If the user declines, continue through the normal review and commit path and note
that docs were consciously deferred.

## Workflow

### Phase 0: Determine The Documentation Scope

If `<docs_input>` is blank:

1. inspect the current diff, recent commits, and the latest plausible plan in
   `docs/plans/` when it clearly matches the current branch
2. infer the likely user-facing surfaces that changed
3. classify the request as:
   - **change-scoped update** - recent implementation changed one or a few
     user-visible contracts
   - **targeted doc refresh** - a named doc or doc set should be updated
   - **broader docs pass** - the user wants a larger Diataxis sweep across the
     project

If the scope is obviously broader than the current branch and the user did not
ask for that breadth explicitly, ask one focused question before writing:

- **Change-scoped docs pass** (recommended)
- **Broader project docs sweep**
- Freeform path when neither predicted label fits

### Phase 1: Touch Grass On The Doc Surface

Before writing anything, build a short ground-truth ledger for the docs work:

- read the repo-root `AGENTS.md` when present
- inspect the existing documentation surface, including the nearest relevant
  files under `docs/`, `README.md`, CLI help text, config docs, runbooks, or
  other user-facing documentation
- read the changed implementation files, tests, manifests, or command
  definitions that actually prove the behavior to be documented
- search for the affected topic across the repo's docs before assuming a gap
- identify the real audience for this change: newcomer, everyday user,
  operator, integrator, or maintainer
- note the repo's current docs structure and terminology so new docs fit the
  existing shape instead of inventing a parallel one

If you cannot verify a command, option, config key, or behavior from repo
truth, do not state it as fact. Either verify it or leave it out.

### Phase 2: Map The Work To Diataxis

Read `references/diataxis-map.md`.

Then decide the minimum doc set needed:

- **Tutorial** when a newcomer needs one guided path to a successful outcome
- **How-to** when a reader needs steps for a concrete task or problem
- **Reference** when the change affects commands, flags, config, API shape,
  fields, defaults, or behavior that people look up
- **Explanation** when the change affects rationale, mental model, architecture,
  or tradeoffs

For each planned doc update, capture:

1. the Diataxis type
2. the user goal
3. the source-of-truth files
4. the target doc path

Prefer the smallest honest set. A config-key rename often needs only reference.
A new setup flow may need tutorial plus reference. An internal refactor with no
reader-visible behavior may need no docs change at all.

### Phase 3: Write Or Refresh The Docs

Apply these rules while editing:

- update existing docs first when they already own the topic
- create new files only when the current docs structure has no good home for
  the change
- if the repo has no established docs layout and multiple new docs are justified,
  use `docs/tutorials/`, `docs/how-to/`, `docs/reference/`, and
  `docs/explanation/`
- keep each document in one Diataxis lane instead of mixing teaching, recipes,
  lookup tables, and rationale on the same page
- keep commands and snippets runnable or obviously adapted from real repo truth
- add concise cross-links when a tutorial should point to reference, or a
  how-to should point to explanation

Quality bar per doc type:

- **Tutorial** - one happy path, learning-oriented, minimal branching
- **How-to** - problem-oriented steps, assumptions allowed, fast to scan
- **Reference** - factual, complete enough to look up, light on narrative
- **Explanation** - why-focused, clarifies tradeoffs and mental model

### Phase 4: Close The Handoff

When the docs pass is complete:

1. summarize what changed and which Diataxis quadrants were touched
2. call out any intentionally deferred docs work
3. if code changes are still waiting, hand back to `$fw:review` and then
   `$fw:commit`
4. if the work is otherwise complete and the docs pass surfaced a durable repo
   lesson, offer `$fw:spin`

If no docs update was needed, say so plainly and cite the repo evidence behind
that decision.
