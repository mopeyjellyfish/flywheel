# Spec Packet

Load this file only when the user asks for a spec, PRD, product requirements,
issue-ready requirements, or a synthesis of the current conversation into a
planning-ready artifact.

Use **spec** as the canonical Flywheel term. Treat PRD as a product-facing
synonym when the user uses it, but do not make PRD the default label for
infrastructure, workflow, bugfix, refactor, CLI, API, observability, or
architecture work.

## Purpose

A spec packet captures the agreed "what should be true" before technical
planning. It should be clear enough that `fw:plan` can create vertical
implementation slices without inventing scope, behavior, or acceptance.

## When To Ask More Questions

Do not interview by habit. If enough context exists, synthesize the spec
packet directly.

Ask one material question only when the missing answer would change:

- user outcome or workflow
- scope boundary
- success criteria
- terminology
- rollout or compatibility expectation
- whether a durable decision record is needed

## Suggested Shape

```markdown
---
date: YYYY-MM-DD
topic: <short-topic>
type: spec
---

# <Spec Title>

## Problem

<What problem or opportunity this addresses.>

## Outcome

<What should be true when this is done.>

## Users Or Actors

- <Actor and why they care>

## Workflows Or Behavior

- <Observable behavior, workflow, CLI/API contract, or support path>

## Decisions And Constraints

- <Accepted product, workflow, architecture, terminology, or compatibility decision>

## Acceptance Criteria

- <Checkable criterion>

## Out Of Scope

- <Explicit non-goal>

## Open Questions

### Resolve Before Planning

- <Question that blocks a technical plan>

### Deferred To Planning

- <Question planning can answer>
```

## Quality Bar

- Apply `spec-grilling.md` before handoff: challenge terminology, fuzzy
  language, scenarios, repo/code contradictions, and ADR/context needs.
- Keep implementation mechanics out unless the spec is explicitly technical.
- Use domain terms consistently; route terminology conflicts to `decision`.
- Mark decision-record needs explicitly instead of hiding tradeoffs in prose.
- Keep acceptance criteria checkable by tests, evals, docs review, browser
  proof, runtime validation, or another project-appropriate signal.
