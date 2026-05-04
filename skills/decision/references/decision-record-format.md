# Decision Record Format

Load this file only when creating, updating, or reviewing a durable decision
record.

Use the active repo's existing ADR or decision-record convention when one
exists. If no convention exists, prefer `docs/decisions/`.

## File Naming

Use a sortable, descriptive filename:

```text
docs/decisions/YYYY-MM-DD-short-decision-title.md
```

If the repo already numbers ADRs, follow that numbering instead.

## Required Shape

```markdown
---
status: proposed | accepted | superseded
date: YYYY-MM-DD
scope: <project area, workflow, boundary, or system-wide>
---

# <Decision Title>

## Context

<Facts, constraints, and repo truth that make this choice necessary.>

## Decision

<The chosen direction in one short section.>

## Rejected Alternatives

- <Alternative> — <why it was rejected>

## Consequences

- <What becomes easier>
- <What becomes harder or must be watched>

## Evidence

- <repo-relative path, command, prior doc, user input, or source>

## Review Questions

- <Question that should be revisited if conditions change>
```

Omit optional sections only when they add no value. Do not omit `Context`,
`Decision`, or `Evidence`.

## Quality Bar

- State repo truth before preference.
- Capture material alternatives, not every discarded idea.
- Keep consequences concrete enough for planning, review, and commit.
- Link or name superseding records when status changes.
- Use downstream-project language, not Flywheel-internal examples, unless the
  active repo is Flywheel itself.
