# Context And Glossary Format

Load this file only when reading, creating, or updating project context,
glossary, terminology, or bounded-context artifacts.

Use the active repo's existing convention when one exists. If no convention
exists, prefer `docs/context/`.

## Purpose

Context artifacts capture project language. They are not implementation plans.
Use them when terminology, bounded contexts, aliases, or relationships would
otherwise be rediscovered or misunderstood in later specs, plans, tests, or
reviews.

## File Naming

Use one context file for a small project:

```text
docs/context/project-context.md
```

Use bounded files when the same term has different meanings in different
areas:

```text
docs/context/billing.md
docs/context/identity.md
```

## Suggested Shape

```markdown
# <Area> Context

## Canonical Terms

| Term | Meaning | Notes |
| --- | --- | --- |
| <term> | <domain meaning> | <relationship or source> |

## Avoided Aliases

| Avoid | Use | Why |
| --- | --- | --- |
| <alias> | <canonical term> | <reason> |

## Relationships

- <Term A> owns or relates to <Term B> because ...

## Example Dialogue

- "When support says <phrase>, they mean <canonical term>."

## Flagged Ambiguities

- <Term> means different things in <context A> and <context B>.

## Evidence

- <repo-relative path, user input, source, or prior doc>
```

## What Belongs Here

- domain terms and project-specific workflow terms
- aliases the project should avoid
- relationships between concepts
- bounded-context differences
- examples that clarify real project language
- unresolved ambiguity that future specs or decisions must not hide

## What Does Not Belong Here

- general programming concepts
- implementation file maps
- code-level design notes
- test plans
- migration steps
- speculative terminology that the project has not accepted
