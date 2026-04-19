# Flywheel Eval Workspace

This workspace keeps live eval tooling out of the plugin runtime surface.

## Purpose

- run Flywheel prompt suites against local `codex` and `claude` CLIs
- keep `evals/` as the committed source of truth for cases and rubrics
- reuse the root `scripts/flywheel-eval.js` flow for validation and summary

## Commands

From the repo root:

```bash
npm --prefix tools/evals install
npm --prefix tools/evals run doctor
npm --prefix tools/evals run eval -- --suite flywheel --runner claude
npm --prefix tools/evals run eval -- --suite fw-work --runner codex --judge codex
npm --prefix tools/evals run eval -- --suite flywheel --case idea_to_brainstorm --runner codex --judge codex
npm --prefix tools/evals run eval -- --suite flywheel --case requirements_to_plan --runner codex --judge codex --subject-config reasoning_effort='low' --judge-config reasoning_effort='low'
npm --prefix tools/evals run compare -- --suite fw-ideate
npm --prefix tools/evals run compare -- --suite fw-review
npm --prefix tools/evals run compare -- --suite fw-optimize --subject-model gpt-5.4 --judge-model <pinned-judge-model>
```

Available suites: `flywheel`, `fw-ideate`, `fw-plan`, `fw-work`,
`fw-review`, `fw-debug`, `fw-ship`, and `fw-optimize`.

For model-specific comparisons, pin both the subject and judge model names or
snapshots and keep the harness configuration constant. Do not treat host
defaults as a stable comparison baseline.

## Runtime model

- Promptfoo is the execution matrix and caching layer.
- Flywheel-owned wrappers handle:
  - suite loading
  - local CLI invocation
  - score normalization
  - result artifacts

## Requirements

- `codex` installed for Codex runs
- `claude` installed for Claude runs
- local auth already configured in the relevant CLI
- Flywheel installed and enabled in local Codex for Codex subject runs

Claude runs load the repo directly with `--plugin-dir`. Codex runs use the
installed local plugin configuration. The harness will stop Codex subject runs
up front if that plugin enablement is missing.
