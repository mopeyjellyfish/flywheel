---
name: logging
description: "Design or review structured application logging with wide-event patterns, stable field names, correlation IDs, and useful context. Use when a change affects runtime behavior and the logs need to help humans and agents understand what actually happened."
metadata:
  argument-hint: "[feature, path, request flow, or blank to inspect existing logging]"
---

# Logging

Good logging is not "more lines." Good logging makes live behavior legible.

This skill is for:

- designing new log events
- auditing an existing logging approach
- reviewing whether a change extends the repo's logging usefully
- migrating from scattered log lines toward more usable structured events

**When directly invoked, always do logging work.** Produce a design, audit, or
gap report grounded in the repo's existing logging truth.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

When more than one logging posture is viable:

- present 2-4 predicted options at most
- put the recommended option first
- keep the differences operational, not stylistic
- rely on the host's native freeform final path when it exists

Do not start with an open-ended question when adjacent code and runtime needs
already suggest the likely choices.

## Input

<logging_input> #$ARGUMENTS </logging_input>

If blank, inspect the current repo's logger setup and logging patterns first.

## Reference Loading Map

Do not load every reference by default. Load only what the current phase needs:

- Read `references/wide-events.md` when shaping event strategy.
- Read `references/schema-contract.md` when defining required fields and naming.
- Read `references/operability-patterns.md` when the path involves retries,
  queues, degraded modes, dependency failures, or hot-path production behavior.
- Read `references/review-checklist.md` when auditing an existing diff or code
  path.

## Core Principles

1. **Log what happened, not what your code is thinking** - prefer outcome
   events over scattered narration.
2. **Use one canonical event per request, job, or service hop when practical**
   - enrich context throughout the flow, then emit once on completion.
3. **Structured fields beat string search** - use consistent names and machine-
   queryable values.
4. **Correlation is mandatory** - request IDs, trace IDs, job IDs, message IDs,
   and tenant IDs make distributed behavior reconstructable.
5. **Business and deployment context matter** - environment, version, feature
   flags, and actor or object identifiers often decide whether a failure is
   understandable.
6. **One logger configuration per app surface** - do not spawn ad hoc logger
   shapes in random modules.
7. **Do not leak secrets or sensitive data** - debug value is not a license to
   dump credentials, tokens, or unsafe payloads.
8. **Logs should help operators act** - include the fields that explain retries,
   degraded modes, backlog, dependency failures, or next state when those
   behaviors are in play.
9. **Distill, do not lecture** - present condensed Flywheel logging guidance,
   not a source summary.

## Workflow

### Phase 1: Ground the Existing Shape

Inspect:

- logger wrappers, helpers, and configuration
- middleware, interceptors, or request hooks
- adjacent event names and field conventions
- any observability docs or search examples

Prefer extending what exists over introducing a second logging idiom.

### Phase 2: Define the Event Model

For the relevant request, job, or message flow:

- decide the canonical event name
- define required identifiers and stable context fields
- define outcome, status, duration, and error fields
- decide where the event is enriched and where it is emitted
- choose whether the best shape is:
  - one canonical outcome event
  - one canonical outcome event plus a few explicit state-transition events
  - a narrower additive event that extends an existing repo pattern

When tradeoffs are real, present the likely choices with a recommended option
and a host-native freeform path rather than improvising silently.

### Phase 3: Audit for Logging Quality

Call out:

- scattered low-context log lines
- missing correlation fields
- inconsistent field names
- missing business or deployment context
- string-only logs where structured output is already normal in the repo
- logger duplication or ad hoc configuration

## Output Contract

Return a concise logging brief in this order:

1. **Current logging truth** — what the repo already does on this path
2. **Relevant flow** — request, job, message, dependency call, or other runtime
   surface being shaped or reviewed
3. **Recommended logging shape** — event names, key fields, and emission points
4. **Choice surface** — predicted options plus recommendation when tradeoffs are
   real; otherwise say no material tradeoff
5. **Gap report** — concrete weaknesses, inconsistencies, or missing signals
6. **Next move** — direct implementation guidance or phased migration steps

---

## Included References

@./references/wide-events.md
@./references/schema-contract.md
@./references/operability-patterns.md
@./references/review-checklist.md
