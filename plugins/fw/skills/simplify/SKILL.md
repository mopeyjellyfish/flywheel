---
name: simplify
description: "Reduce accidental complexity in recent code. Use when wrappers, abstractions, or orchestration no longer earn their keep."
metadata:
  argument-hint: "[path, diff, recent changes, or simplification target]"
---

# Simplify

Use this helper after code has a concrete shape and the question becomes: what
can we remove, collapse, or localize without changing behavior?

`$fw:simplify` is not a whole-repo cleanup pass. It is a bounded
simplification pass over recent or changed work.

**When directly invoked, always do simplification work.** Stay scoped, name the
removable complexity, and protect behavior.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Call the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

## Input

<simplify_input> #$ARGUMENTS </simplify_input>

If blank, inspect the most recent changed area or the most obvious abstraction
cluster near the task.

## Reference Loading Map

- Read `../references/architecture-code-quality/activation-heuristics.md` when
  deciding whether simplification is the right helper.
- Read `../references/architecture-code-quality/output-contract.md` when
  preparing the final brief.

## Core Principles

1. **Scope stays local** - simplify the changed work, not the whole repo.
2. **Behavior stays stable** - remove layers, not correctness.
3. **Collapse before extracting** - extra helpers need proof, not optimism.
4. **Prefer obvious code over configurable code** - especially when there is
   only one concrete use.
5. **Defer broad cleanup** - if the simplification would sprawl beyond the
   active work, say so and leave it out.

## Workflow

### Phase 1: Define The Review Scope

State the files, diff, or recent work being simplified.

### Phase 2: Find Removable Complexity

Look for:

- wrappers around one call site
- one-use abstractions
- indirection that hides the main path
- local logic split across too many files
- generality added for hypothetical futures

### Phase 3: Rank The Simplifications

Prefer the smallest valuable moves first:

- remove
- collapse
- localize
- rename for clarity

Only recommend extraction when it reduces real duplication or boundary noise.

## Output Contract

Return a concise simplification brief:

1. **Scope reviewed** — which recent or changed area was examined
2. **Simplification candidates** — removable or collapsible complexity
3. **Recommended pass** — the best bounded cleanup to do now
4. **Deferred simplifications** — real ideas that should stay out of scope
5. **Verification hooks** — behavior checks or review angles
6. **Next move** — whether to simplify now, defer, or proceed to review
