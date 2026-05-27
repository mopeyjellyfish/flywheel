# Persona Loading Guide

This file defines the reviewer-loading contract for `document-review`. The goal
is to keep persona selection deterministic for frontier models and cheap to
extend over time.

## Required Loading Order

Always follow this sequence:

1. Read `references/reviewer-registry.yaml`.
2. Read this file, `references/persona-loading.md`.
3. Determine the selected reviewer IDs:
   - start with every reviewer in the registry's `always_on` group
   - add any relevant reviewers from the `conditionals` group
4. Load only the persona files referenced by those selected reviewer IDs.
5. Dispatch reviewers using the selected persona files plus the shared
   subagent template and findings schema.

Do not bulk-load every file under `references/personas/`.

## Selection Principles

- The registry is the source of truth for reviewer IDs and persona paths.
- Always-on reviewers are not optional.
- Conditional reviewers are selected by document content and review intent, not
  by habit.
- If a reviewer is not in the registry, do not dispatch it.

## Extension Contract

When adding a new document-review persona:

1. add a persona file under `references/personas/`
2. add the reviewer ID and path to `references/reviewer-registry.yaml`
3. keep `SKILL.md` orchestration generic; do not hardcode every new reviewer
   into the main workflow body

This keeps `document-review` stable while the reviewer library grows.
