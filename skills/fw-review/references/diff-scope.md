# Diff Scope Rules

These rules apply to every reviewer. They define what is in scope for the
review versus what is merely surrounding context.

## Scope Discovery

Determine the diff to review using this priority order:

1. User-specified scope. If the caller passed `BASE:`, `FILES:`, or `DIFF:`
   markers, use that scope exactly.
2. Working-copy changes. If there are unstaged or staged changes, review those.
3. Unpushed commits vs base branch. If the working copy is clean, review the
   diff between `HEAD` and the resolved merge-base against the base branch.

The scope step in `SKILL.md` handles discovery and passes the resolved diff to
reviewers. Reviewers do not need to rediscover scope.

## Finding Classification Tiers

Every finding falls into one of three tiers based on its relationship to the
diff.

### Primary

Lines added or modified in the diff. This is the main focus.

### Secondary

Unchanged code within the same function, method, block, or local interaction
surface as a changed line. If a change introduces a bug that is only visible by
reading the surrounding context, report it and note that the issue exists in
the interaction between new and existing code.

### Pre-Existing

Issues in unchanged code that the diff did not touch and does not meaningfully
interact with. Mark these as `"pre_existing": true`.

The rule:

- if you would flag the same issue on an identical diff that did not include
  the surrounding file, it is pre-existing
- if the diff makes the issue newly relevant, it is secondary rather than
  pre-existing
