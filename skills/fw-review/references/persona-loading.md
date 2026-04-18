# Persona Loading Guide

This file defines the loading order for `fw-review`. The goal is to make review
selection deterministic for frontier models and cheap to extend over time.

The ordering is deliberate:

- a stable, repeated prefix helps OpenAI prompt caching
- registry-first loading keeps Codex and Claude Code from over-reading
- selected persona files stay compact enough for host-specific subagent prompts

## Required Loading Order

Always follow this sequence:

1. Read `references/reviewer-registry.yaml`.
2. Read this file, `references/persona-loading.md`.
3. Determine the selected reviewer IDs:
   - start with every `always_on_structured` and `always_on_agents` reviewer in
     the registry
   - add any relevant `cross_cutting_conditionals`
   - if stack extensions are enabled, read `references/stack-packs/index.yaml`,
     then only the matching pack files, then only the reference files named by
     those packs, then add the persona IDs named by those packs
   - add any relevant `flywheel_conditionals`
4. Union and deduplicate the selected reviewer IDs across all matching packs and
   conditional sources.
5. Load only the persona files referenced by the selected reviewer IDs.
6. Dispatch reviewers using the selected persona files plus the shared diff
   scope, schema, and template references.

Do not bulk-load every file under `references/personas/` or
`references/stack-packs/`.

## Selection Principles

- The registry is the source of truth for reviewer IDs and paths.
- Always-on reviewers are not optional.
- Conditional reviewers are selected by diff evidence and intent, not by file
  extensions alone.
- Selected persona files are authoritative. Do not supplement them by mentally
  importing older catalog text or unrelated reviewer prompts.
- Stack packs are additive. They can add reviewers but do not replace the core
  review set.
- If a reviewer is not in the registry, do not dispatch it.

## Stack-Pack Rules

- Treat `references/stack-packs/index.yaml` as the only stack-pack entrypoint.
- Activate a pack only when repo evidence supports it, for example changed
  files, nearby manifests, tool configs, or explicit project instructions.
- When multiple packs match, load only the pack files that actually apply to
  the current diff.
- Pack files may name stack-specific reference files. Load only the references
  listed by packs that actually matched.
- When multiple packs match, their reviewers are additive. Deduplicate reviewer
  IDs, then dispatch the final reviewer set in one batch where the host allows
  parallel review work.
- Stack packs should point back to reviewer IDs already defined in the
  registry, or add new reviewer IDs to the registry first.

## Extension Contract

When adding a new reviewer:

1. add a persona file under `references/personas/`
2. add the reviewer ID and path to `references/reviewer-registry.yaml`
3. if it is stack-specific, add or update a pack file under
   `references/stack-packs/`
4. keep `SKILL.md` orchestration generic; do not hardcode every new reviewer
   into the main workflow body

This keeps `fw-review` stable while the reviewer library grows.
