# Post-Ideation Workflow

Read this file only after the raw candidate list exists. Do not load it during
initial grounding or generation.

## Phase 3: Adversarial Filtering

Review every candidate critically. The orchestrator performs this filtering
directly.

Do not generate replacement ideas in this phase unless the user explicitly asks
to refine or reopen generation.

For each rejected idea, write a one-line reason.

Reject when an idea is:

- too vague
- not actionable
- weakly grounded in the stated context
- a duplicate of a stronger idea
- too expensive for the likely value
- already covered by existing workflows, docs, or known plans
- interesting, but better handled as a brainstorm variant than as a standalone
  improvement bet

Score survivors with one consistent rubric weighing:

- groundedness
- expected value
- leverage on future work
- pragmatism
- novelty
- implementation burden
- overlap with stronger ideas

Target output:

- keep 5-7 survivors by default
- if too many survive, run a second stricter pass
- if fewer than 5 survive, report that honestly rather than lowering the bar

## Phase 4: Present the Survivors

Present only the surviving ideas, not the entire raw list.

Read `references/shortlist-template.md` before presenting or saving the final
shortlist. Follow its order and field names exactly unless the user explicitly
asks for a different format.

For each survivor, include:

- title
- description
- rationale
- downsides
- confidence
- estimated complexity
- recommended next step: `$flywheel:brainstorm`, `stay in ideation`, or `save for
  later`

Then include a brief rejection summary so the user can see what was considered
and cut.

Keep the presentation concise. The goal is a strong shortlist, not a dump of
every candidate.

## Phase 5: Persistence and Handoff

Persistence is opt-in. The ideation loop is already useful without writing
anything.

Use the exact host question tool named in the host interaction contract when
that tool is available. Otherwise present a short label-based choice surface in
chat instead of asking for raw numeric replies.

Before offering next steps, present a compact stage summary covering:

- the primary opportunity or problem Flywheel now believes matters most
- what changed from the user's starting frame
- what remains open or uncertain
- any decision-changing research takeaway that sharpened the shortlist
- what the recommended next stage would do
- what input Flywheel needs now, if any

Offer these next steps:

1. **Refine the ideation in conversation** — add ideas, re-evaluate, or go
   deeper on one survivor. No file write is required.
2. **Save the ideation doc** — write a durable artifact and stop, or leave it
   ready for later follow-up.
3. **Brainstorm a selected idea** — save first when a durable handoff will
   help, then load `$flywheel:brainstorm` using the chosen idea as the seed.
4. **Stop here without saving** — valid no-save exit.

### 5.1 File Save

When the user chooses to save locally:

1. ensure `docs/ideation/` exists
2. choose the path:
   - `docs/ideation/YYYY-MM-DD-NNN-<descriptive-name>-ideation.md`
   - use `open-ideation` when there is no strong topic slug
3. write or update the ideation doc

Use the same section order and field names from
`references/shortlist-template.md`, then expand into this saved-document shape:

```markdown
---
title: Ideation: <Title>
status: active
date: YYYY-MM-DD
focus: <optional focus hint>
mode: <repo-grounded | outside-repo-software | universal>
---

# Ideation: <Title>

Treating this as [repo-grounded ideation | outside-repo software ideation | universal ideation] about <topic>.

## Grounding

- <short context point>
- <short context point>

## Ranked Ideas

### 1. <Idea Title>
- Description: <concrete explanation>
- Why it matters now: <one line>
- Why it survives: <one line>
- Downsides: <one line>
- Confidence: <0-100%>
- Complexity: <Low | Medium | High>
- Status: <Unexplored | Selected | Explored>
- Next step: `$flywheel:brainstorm` | `stay in ideation` | `save for later`

## Rejection Summary

| # | Idea | Reason Rejected |
|---|------|-----------------|
| 1 | <Idea> | <Reason rejected> |

## Recommendation

- Best next move: <one line>
- Why: <one line>
```

If resuming an existing ideation file:

- update it in place
- preserve existing `Selected` or `Explored` markers

### 5.2 Document Review

When an ideation document was created or updated, run `document-review` in
`mode:headless` on it before presenting final handoff options if that skill is
available. If it is unavailable, manually review the doc for clarity,
grounding, portability, and whether the shortlist clearly beats the rejected
alternatives.

### 5.3 Brainstorm Handoff

When the user chooses **Brainstorm a selected idea**:

- prefer saving the ideation doc first when a durable handoff will help later
  planning or review
- mark the chosen idea as `Selected` or `Explored` in the saved artifact when
  one exists
- load `$flywheel:brainstorm` with the chosen idea as the seed

Do **not** skip straight from ideation to `$flywheel:plan` unless the user explicitly
overrides the normal workflow and the missing brainstorm step would add no real
value.

### 5.4 Optional Commit

Do not commit ideation docs by default.

If the user explicitly asks to commit a saved ideation document, load
`$flywheel:commit` first, stage only the ideation doc, and use a clean
conventional message. Ask before using a breaking-change marker.
