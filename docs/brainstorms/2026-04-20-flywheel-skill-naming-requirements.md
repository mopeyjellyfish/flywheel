---
date: 2026-04-20
topic: flywheel-skill-naming
---

# Flywheel Skill Naming

## Problem Frame

Flywheel's command surface is now functionally consistent, but the skill names
still mix short single-word commands with long helper-style compounds. That
makes the list harder to scan and weakens the product's verbal rhythm.

The immediate goal is not to rename everything for novelty. The goal is to
settle one naming policy, define the canonical command set, and separate
obvious near-term renames from higher-risk changes that should wait.

## Requirements

- R1. Prefer single-word skill names when they remain clear at the call site.
- R2. Preserve the `flywheel` plugin namespace in Codex.
- R3. Keep the core loop especially short and legible:
  `start`, `brainstorm`, `plan`, `work`, `review`, `ship`, `spin`.
- R4. Keep names aligned with the user's mental model of the job, not the
  implementation detail behind it.
- R5. Avoid renames that materially increase ambiguity just to satisfy the
  single-word preference.
- R6. Treat user-facing renames as contract sweeps across prompts, docs,
  manifests, evals, and helper text.

## Success Criteria

- The full Flywheel command set reads as one coherent vocabulary rather than a
  mix of branded stages and technical helper labels.
- The core loop stays easy to memorize.
- The obvious long outliers get a clear rename decision.
- Any deferred names are deferred because clarity is still unresolved, not
  because the repo lacks a direction.

## Scope Boundaries

- Do not rename the plugin namespace from `flywheel`.
- Do not add alias surfaces just to bridge old and new names.
- Do not force every helper into a worse single-word command when the current
  compound is more honest.
- Do not implement the renames in this brainstorm; planning should own the
  contract sweep.

## Key Decisions

- **Single words by default**: brevity is the default style.
- **Clarity beats purity**: compounds are acceptable when the single-word
  alternatives are vague, overloaded, or misleading.
- **Keep native tool terms**: `worktree`, `rollout`, and `incident` are already
  strong workflow nouns and do not need synthetic replacements.
- **Rename only the obvious long outliers now**: change the names whose shorter
  replacements are already clear and low-risk.

## Canonical Command Set

### Keep Now

- `start`
- `ideate`
- `brainstorm`
- `plan`
- `work`
- `debug`
- `review`
- `rollout`
- `ship`
- `spin`
- `setup`
- `run`
- `incident`
- `optimize`
- `observability`
- `logging`
- `polish`
- `worktree`

### Rename Now

- `deepen-plan` -> `deepen`
- `verification-before-completion` -> `verify`
- `conventional-commit` -> `commit`

### Defer

- `browser-test`
- `document-review`

## Why The Deferred Names Stay Deferred

### `browser-test`

The current name is long, but the obvious single-word replacements are worse:

- `test` is too broad and collides with ordinary test execution
- `browse` sounds exploratory instead of proof-oriented
- `accept` is concise but not self-explanatory without learning Flywheel first

Keep `browser-test` until a clearer single-word term emerges.

### `document-review`

The current name is explicit, but the obvious replacements are not yet good
enough:

- `review` is already taken by code review
- `critique` changes the product tone and is less standard
- `audit` implies a different style of inspection than the skill actually does

Keep `document-review` until a replacement is clearly better than the current
literal form.

## Recommended Near-Term Surface

```text
$flywheel:start
$flywheel:ideate
$flywheel:brainstorm
$flywheel:plan
$flywheel:deepen
$flywheel:work
$flywheel:debug
$flywheel:review
$flywheel:rollout
$flywheel:ship
$flywheel:spin
$flywheel:setup
$flywheel:run
$flywheel:incident
$flywheel:optimize
$flywheel:observability
$flywheel:logging
$flywheel:polish
$flywheel:worktree
$flywheel:verify
$flywheel:commit
$flywheel:browser-test
$flywheel:document-review
```

## Outstanding Questions

### Resolve Before Planning

- None.

### Deferred To Planning

- Which repo files and eval prompts need to change for `deepen`, `verify`, and
  `commit`?
- Should the UI display layer show friendly labels like `Browser Test` and
  `Document Review` while keeping the callable command strings unchanged for
  those two deferred skills?

## Next Steps

-> `$flywheel:plan` for a contract-sweep rename plan covering `deepen`,
`verify`, and `commit`, with explicit deferral of `browser-test` and
`document-review`.
