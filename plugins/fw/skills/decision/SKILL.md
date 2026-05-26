---
name: decision
description: "Grill and capture durable decisions. Use for ADRs, terminology conflicts, tradeoffs, or spec decision review."
metadata:
  argument-hint: "[decision, plan, spec, ADR path, or terminology question]"
---

# Decision

`$fw:decision` is Flywheel's helper for durable decision quality. Use it
directly for ADR-style decisions, spec grilling, terminology conflicts, or
reviewing whether a plan needs a decision record before work starts.

This is a helper surface, not a visible backbone stage. It supports `shape`,
`plan`, `deepen`, architecture helpers, and document review when a material
choice needs sharper grounding.

**When directly invoked, always do decision work.** Inspect repo context,
challenge ambiguity, ask only the next material question, and decide whether a
durable record or context update is warranted.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Call the exact host question tool named in the host interaction contract when
that tool is available. Ask one question at a time. When the answer space is
predictable, provide 2-3 portable options with the recommended option first
and rely on the host's native freeform path when it exists.

## Input

<decision_input> #$ARGUMENTS </decision_input>

If blank, inspect the current shaping artifact, plan, or active conversation
for the most likely unresolved decision. If no material decision is visible,
say that no durable decision record is needed.

## Reference Loading Map

Do not load every reference by default:

- Read `references/decision-record-format.md` only when creating, updating, or
  reviewing a durable decision record.
- Read `references/context-format.md` only when reading, creating, or updating
  project context, glossary, terminology, or bounded-context artifacts.
- Read `../references/architecture-code-quality/activation-heuristics.md` only
  when deciding whether the issue is architecture-bearing enough to need a
  focused architecture helper as input.

## Core Principles

1. **Repo truth before user questions** - inspect existing code, tests, docs,
   configs, specs, plans, context docs, and prior decisions before asking for
   information that can be discovered.
2. **Decision records are conditional** - write a durable record only when the
   choice is hard to reverse, surprising without context, and the result of a
   real tradeoff. Architecture, workflow-contract, and product-scope choices
   often qualify, but still test all three conditions.
3. **Context is separate from decisions** - context/glossary artifacts define
   project language and relationships. Decision records explain why a choice
   was made and what alternatives were rejected.
4. **Terminology conflicts are first-class** - surface conflicts between user
   language, existing docs, code behavior, and tests before preserving a spec,
   plan, or decision.
5. **Walk dependencies in order** - resolve upstream framing and language
   choices before asking downstream implementation or rollout questions.
6. **Stress-test concrete scenarios** - when relationships, scope boundaries,
   or workflow states are unclear, use a specific scenario or edge case to
   force precise language before recording the choice.
7. **Prefer recommended questions** - ask one material question at a time with
   a recommended answer when possible.
8. **Keep records small** - capture enough context for future work without
   turning an ADR or glossary into a long design essay.

## Workflow

### Phase 1: Ground The Decision

Inspect the smallest relevant repo surface:

- active spec, requirements doc, plan, or review artifact
- `AGENTS.md` and nearby project guidance
- existing context or glossary files such as `CONTEXT.md`, `CONTEXT-MAP.md`,
  `docs/context/`, or area-local docs
- existing decision records under `docs/decisions/`, `docs/adr/`, or the
  active repo's established convention
- source, tests, configs, migrations, API docs, workflow docs, or generated
  artifacts that define the behavior under discussion

Use existing project conventions first. If no convention exists, prefer
`docs/decisions/` for decision records and `docs/context/` for reusable
project context.

### Phase 2: Classify The Need

Choose the smallest useful output:

- **No durable record** - the choice is obvious, reversible, local, or already
  captured by the spec/plan.
- **Context update** - the main value is resolved project language, aliases,
  relationships, or bounded-context terminology.
- **Decision record** - the choice has meaningful alternatives, consequences,
  or future surprise risk.
- **Decision review** - an existing ADR, context doc, spec, or plan conflicts
  with repo truth or needs a reopen decision.

If a decision is really an architecture or pattern question, use the relevant
helper first, then capture the decision only if the outcome should persist.

### Phase 3: Grill The Gaps

Compare:

- user wording
- existing project terms
- code and test behavior
- relevant docs and prior decisions
- the proposed spec or plan

Call out conflicts immediately. If the code, tests, context docs, or prior
decisions contradict the proposed wording, resolve that contradiction before
writing or accepting the decision.

Ask one material question only when repo truth cannot answer it. Put upstream
questions first:

1. term meaning or bounded context
2. user outcome or workflow contract
3. boundary or ownership choice
4. rejected alternative and consequence
5. validation or review question

Use a concrete scenario when the ambiguity is about actors, states, boundaries,
cardinality, ownership, or failure behavior.

### Phase 4: Capture Or Decline

If no record is needed, say why in one or two sentences and hand back to the
calling stage.

If context needs capture, read `references/context-format.md`, update or create
the smallest useful context artifact, and keep implementation mechanics out of
the glossary.

If a decision record is needed, read `references/decision-record-format.md`,
write or update the record, and keep the fields small enough for future
planning, review, and commit context.

### Phase 5: Handoff

Return:

1. **Decision result** - no record, context updated, decision recorded, or
   reopen needed
2. **Artifacts** - repo-relative paths changed or reviewed
3. **Key choice** - chosen direction and why
4. **Rejected alternatives** - only material alternatives
5. **Open questions** - only blockers for the next stage
6. **Next move** - the Flywheel stage or helper that should continue

When called from `shape`, return control to the original shaping mode unless a
blocking decision remains unresolved.
