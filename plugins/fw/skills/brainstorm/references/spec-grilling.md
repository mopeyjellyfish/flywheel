# Spec Grilling

Load this file for software brainstorms that may produce a durable requirements
doc or spec packet. The goal is to make high-quality specs automatic without
turning every brainstorm into a long interview.

## Operating Rules

- Inspect repo truth before asking. Check existing context docs, decision
  records, specs, plans, source, tests, configs, APIs, and workflow docs that
  can answer the question.
- Walk decision dependencies in order: terminology, user outcome, scope
  boundary, workflow contract, success criteria, then downstream planning
  concerns.
- Ask one material question at a time. Include the recommended answer when the
  likely answer space is predictable.
- Challenge conflicts immediately. If existing context says one term means X
  but the brainstorm uses it as Y, stop and resolve that before writing the
  spec.
- Sharpen fuzzy language. Propose a canonical term for vague or overloaded
  wording and list avoided aliases only when the project should preserve that
  distinction.
- Stress-test concrete scenarios. Use edge cases and realistic workflows to
  force precise boundaries between concepts, actors, states, and failure paths.
- Cross-reference code and docs. If the user describes behavior that conflicts
  with current source, tests, API docs, configs, or prior decisions, surface the
  contradiction before accepting it into the spec.

## Context And Decision Capture

Use `decision` when resolved terminology or a material choice should be
preserved outside the brainstorm artifact:

- update context/glossary only for project-specific terms that future specs,
  plans, tests, or reviews would otherwise rediscover or misuse
- keep context domain-facing; do not turn it into a file map or implementation
  note
- offer a decision record only when all three are true:
  - hard to reverse
  - surprising without context
  - the result of a real tradeoff with meaningful alternatives

Skip ADR ceremony for obvious, reversible, local, or purely stylistic choices.

## Completion Check

Before handing off to planning, the brainstorm should be able to answer:

- What problem or opportunity is this actually solving?
- Which project terms are canonical, ambiguous, or deliberately avoided?
- Which concrete scenarios prove the scope boundary?
- What would planning otherwise have to invent?
- Which current docs, code, tests, or decisions support or contradict the spec?
- Is any remaining open question blocking planning, or can it be carried as an
  explicit assumption or planning question?
