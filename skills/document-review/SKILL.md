---
name: document-review
description: "Review requirements or plan docs. Use to surface severity, confidence, and a ranked fix queue before planning or work."
metadata:
  argument-hint: "[mode:headless] [path/to/document.md]"
---

# Document Review

Review requirements or plan documents through multi-persona analysis. Surface
role-specific issues, auto-fix clear issues, and return a confidence-scored,
stack-ranked queue for the remaining work.

This skill is for document quality, not code implementation.

Use it before planning from requirements or spec documents and before execution
from plan documents. Findings that change product behavior, scope, success
criteria, or the definition of done should route back to questions or
brainstorming before planning or work continues.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Call the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When the workflow spans multiple material steps, use the host task-tracking
tool named in `../references/host-interaction-contract.md` to create and
maintain a short task list.

Ask one question at a time. In `mode:headless`, skip user questions entirely
and return the required failure or review output directly.

## Reference Loading Map

Do not preload every reference. Load only what the current phase needs:

- Always read `references/reviewer-registry.yaml` and
  `references/persona-loading.md` first when reviewer selection begins.
- Read only the selected persona files under `references/personas/` after the
  registry and loading guide identify them.
- Read `references/subagent-template.md` and
  `references/findings-schema.json` immediately before reviewer dispatch or
  serial persona execution.
- Read `references/synthesis-and-presentation.md` only after raw reviewer
  outputs exist.
- Read `references/review-output-template.md` only when you are presenting
  interactive results.

## Phase 0: Detect Mode

Check the skill arguments for `mode:headless`. Arguments may contain a document
path, `mode:headless`, or both. Tokens starting with `mode:` are flags, not
file paths. Strip them from the arguments and use the remaining token, if any,
as the document path for Phase 1.

If `mode:headless` is present, set **headless mode** for the rest of the
workflow.

**Headless mode** changes the interaction model, not the classification
boundaries. Document-review still applies the same judgment about what has one
clear correct fix versus what needs user judgment. The only differences are:

- `auto` fixes are applied silently, same as interactive mode.
- `present` findings are returned as structured text for the caller to handle.
- Phase 5 returns immediately with `Review complete`.

If `mode:headless` is not present, the skill runs in its default interactive
mode.

## Phase 1: Get and Analyze Document

**If a document path is provided:** Read it, then proceed.

**If no document is specified (interactive mode):** Ask which document to
review, or find the most recent document in `docs/brainstorms/` or
`docs/plans/`.

**If no document is specified (headless mode):** Output:

```text
Review failed: headless mode requires a document path.
Re-invoke with: $fw:document-review mode:headless <path>
```

Do not dispatch reviewers.

### Classify Document Type

After reading, classify the document:

- **requirements** — typically from `docs/brainstorms/`, focused on what to
  build and why
- **plan** — typically from `docs/plans/`, focused on how to build it with
  implementation detail

### Select Conditional Personas

Read `references/reviewer-registry.yaml` and
`references/persona-loading.md` before selecting reviewers. The registry is the
source of truth for reviewer IDs and persona paths. Do not invent reviewer
categories during execution.

Always include:

- `coherence`
- `feasibility`

Activate conditional personas when relevant:

- `product-lens` when the document makes challengeable claims about
  what to build, why it matters, prioritization, or user outcomes
- `design-lens` when the document includes UI, UX, flows, visual
  behavior, accessibility, or interaction design
- `security-lens` when the document touches auth, permissions, tokens,
  PII, public APIs, trust boundaries, payments, or third-party integrations
- `observability-lens` when the document changes runtime behavior, jobs,
  integrations, migrations, or other operationally meaningful paths and needs
  explicit support or validation signals
- `document-simplicity` when the document introduces architecture layers,
  abstractions, extensibility points, orchestration, or verification shape
  that may be heavier than the current goal requires
- `scope-guardian` when the document has multiple priority tiers,
  substantial scope, stretch goals, fuzzy boundaries, or weak alignment between
  goals and work
- `adversarial-document` when the document is large, strategic,
  technically consequential, or high-risk enough to justify an intentionally
  skeptical pass

This loading order is mandatory. Do not bulk-load every file under
`references/personas/`.

## Phase 2: Announce and Dispatch Reviewers

### Announce the Review Team

Tell the user which reviewers will analyze the document and why. Always include
the justification for conditional reviewers.

### Dispatch Strategy

Read `references/subagent-template.md` and
`references/findings-schema.json`.

If the platform supports subagents or tasks **and** the active host policy
permits delegated review work, dispatch reviewers in parallel.
When the host requires explicit delegation approval, only delegate after that
approval is already present.
Give each reviewer:

- the selected persona definition from its file under `references/personas/`
- the subagent template
- the findings schema
- the full document path
- the full document text
- the document type

Pass the **full document** to every reviewer. Do not split it into sections.

If delegated execution is unavailable, disallowed by policy, or not worth the
overhead, run the same reviewer passes serially yourself using the persona
definitions and the same JSON output contract. Preserve the persona boundaries
instead of collapsing them into one undifferentiated review.

### Optional Confidence Calibration Pass

When the platform supports fast or small agent runs, the active host policy
permits delegation, and doing so is cheap, dispatch one or two lightweight
**scorer** passes after the raw reviewer outputs return.

Scorers do **not** create new findings. They only rescore candidate findings
for:

- confidence calibration
- impact scoring sanity checks
- effort-to-fix sanity checks

Bound any confidence adjustment from the scorer pass to a small delta. The
purpose is calibration, not replacing the original reviewer judgment.

If no scorer pass is available, continue with the raw reviewer scores.

**Error handling:** If a reviewer fails or times out, proceed with the reviewers
that completed. Note failures in Coverage. Do not block the entire review on one
reviewer failure.

## Phases 3-5: Synthesis, Presentation, and Next Action

After all raw reviewer outputs return, read
`references/synthesis-and-presentation.md`.

Follow that pipeline for:

- schema validation
- confidence gating and discounting
- deduplication and contradiction handling
- auto-fix routing
- stack-ranking present findings
- interactive or headless presentation
- refine loop guidance

---

## Included References

### Reviewer Registry

@./references/reviewer-registry.yaml

### Persona Loading Guide

@./references/persona-loading.md

### Subagent Template

@./references/subagent-template.md

### Findings Schema

@./references/findings-schema.json
