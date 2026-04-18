# `fw-ideate` Grading Rubric

Use this rubric for manual grading, OpenAI eval graders, or Claude Console
review.

## Scoring Scale

Score each dimension:

- `2` = clearly passes
- `1` = partially passes / weak
- `0` = fails

## Core Dimensions

### 1. Mode Classification

Does the response choose the right ideation mode?

- repo-grounded
- outside-repo software
- universal / non-software

Automatic fail if it confidently chooses the wrong mode.

### 2. Grounding Quality

Is the output grounded in the right evidence surface?

- repo cases: real repo shape, files, docs, or honest absence
- outside-repo software: user/product context without invented repo facts
- universal: topic-native context without software pollution

Automatic fail if it invents repo facts or issue data.

### 3. Structure Compliance

Does the final shortlist follow the canonical shape?

Expected sections:

1. framing sentence
2. `## Grounding`
3. `## Ranked Ideas`
4. `## Rejection Summary`
5. `## Recommendation`

Automatic fail if the response is an unstructured idea dump.

### 4. Candidate Quality

Are the surviving ideas:

- specific
- actionable
- meaningfully different from one another
- plausibly high leverage for the case

### 5. Filtering Quality

Does the response clearly show that ideas were filtered rather than merely
listed?

- rejected ideas are acknowledged
- weaker or duplicate ideas are cut
- the shortlist feels selected, not exhaustive

### 6. Workflow Routing

Does the response preserve the Flywheel workflow?

- ideation should route to `/fw:brainstorm` when action is selected
- it should not skip straight to `/fw:plan` or implementation by default

### 7. Constraint Obedience

Does it honor explicit prompt constraints?

Examples:

- `top 3`
- `quick wins`
- `no external research`
- path-specific scope

Automatic fail if an explicit constraint is ignored.

### 8. Restraint

Does it stay right-sized for the request?

- narrow prompt -> compact shortlist, no bloated platform agenda
- broad prompt -> still concise survivors, not a giant dump

## Pass Threshold

Recommended pass rule:

- no `0` on dimensions 1, 2, 3, 6, or 7
- average score at least `1.5`

Recommended “strong pass” rule:

- no `0` anywhere
- average score at least `1.75`

## Failure Notes

When a case fails, record:

- case ID
- failing dimension(s)
- one concrete reason
- one prompt change hypothesis, if obvious

Do not write vague failure notes like “felt weaker” or “not as good.”
