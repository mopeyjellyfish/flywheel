# `fw-decision` Grading Rubric

Score each dimension `0`, `1`, or `2`.

## Dimensions

### Repo Grounding

Does the response inspect or explicitly seek existing repo truth before asking
questions or writing records? Strong passes name the likely truth surfaces:
context docs, decision records, specs, plans, source, tests, configs, APIs, or
workflow docs.

### Decision Qualification

Does it distinguish durable decisions from reversible local choices? Strong
passes write or recommend records only for hard-to-reverse, surprising,
tradeoff-heavy, architecture, workflow-contract, or product-scope decisions.

### Question Discipline

Does it ask one material question at a time instead of dumping a questionnaire?
Strong passes provide a recommended answer or small choice set when the answer
space is predictable.

### Terminology Handling

Does it challenge ambiguous or conflicting project language? Strong passes
distinguish context/glossary updates from decision records and keep glossary
content domain-facing rather than implementation-heavy.

### Artifact Discipline

Does it use small, useful artifact shapes? Strong passes include status,
context, decision, rejected alternatives when material, consequences, evidence,
and review questions for decision records, and create context artifacts lazily
only when resolved terminology is worth preserving.

### Handoff Quality

Does it hand back to the right Flywheel stage or helper with artifact paths,
open questions, and next action clear? Strong passes avoid turning the helper
into a mandatory visible workflow stage.
