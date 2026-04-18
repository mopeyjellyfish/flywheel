# `flywheel` End-to-End Eval Pack

This directory contains a compact prompt-eval pack for the top-level
`skills/flywheel/SKILL.md` routing flow.

Use it to verify that Flywheel feels coherent from idea to working PR:

1. the router chooses the right next stage
2. the handoff does not skip necessary workflow steps
3. the flow stays grounded in repo artifacts when they exist
4. the terminal path still reaches review, shipping, and spin

## Files

- `manifest.json` — machine-readable suite contract for the eval harness
- `cases.jsonl` — end-to-end routing and handoff cases
- `rubric.md` — grading criteria for stage selection and workflow coherence

## What This Eval Measures

This pack focuses on top-level workflow behavior:

- correct first-stage selection
- correct handoff target
- respect for the Flywheel order of operations
- sensible direct-to-work shortcuts only when the task is truly ready
- awareness of review and spin as part of the final path to a PR

It does **not** fully verify hidden orchestration details like actual tool
calls, actual branch creation, or PR creation mechanics. Those still need
manual or integration testing in a live repo.

## Manual Use

1. Open `skills/flywheel/SKILL.md`.
2. Run `$flywheel` with each `item.arguments` value from `cases.jsonl`.
3. Grade the result with `rubric.md`.

For a repeatable harness-driven run, use:

```bash
node scripts/flywheel-eval.js prepare flywheel
node scripts/flywheel-eval.js summarize flywheel path/to/results.jsonl
```

## Suggested First Pass

Run these first:

- `idea_to_brainstorm`
- `requirements_to_plan`
- `plan_to_work`
- `code_to_review`
- `done_to_spin`

If those pass, run the full set.
