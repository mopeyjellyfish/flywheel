# `fw-spin` Grading Rubric

Score each dimension `0`, `1`, or `2`.

## Dimensions

### Capture Discipline

Does the response behave like spin for solved or clearly selected lessons?

- direct solved lesson -> capture immediately
- blank input -> bounded candidate discovery first
- no invented unsolved lesson

### Retrieval Contract

Does it preserve the retrieval shape of the knowledge store?

- `docs/solutions/`
- YAML frontmatter or metadata awareness
- strong discoverability fields such as `files_touched`, `tags`, `module`,
  `doc_status`

### Canonicalization

Does it prefer a coherent store over duplicate docs?

- update existing when overlap is high
- supersede stale guidance when a new answer replaces it
- cross-link only when both remain valid

### Housekeeping Discipline

Does it include bounded housekeeping on neighboring docs?

- strongest overlaps only
- bounded scope
- no broad whole-store gardening by default

### Workflow Fit

Does it explain how the captured lesson helps future Flywheel stages?

- ideate
- brainstorm
- plan
- work
- review
- debug
