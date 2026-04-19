# Eval Harness

Flywheel eval packs are structured so you can run the same checks repeatedly
without inventing a one-off grading flow each time.

For live local CLI runs against Codex and Claude Code, use the isolated
workspace under `tools/evals/`. This directory remains the committed source of
truth for manifests, cases, and rubrics.

## Harness Commands

From the repo root:

```bash
node scripts/flywheel-eval.js list
node scripts/flywheel-eval.js validate
node scripts/flywheel-eval.js prepare flywheel
node scripts/flywheel-eval.js prepare fw-work
node scripts/flywheel-eval.js prepare fw-review
node scripts/flywheel-eval.js summarize flywheel path/to/results.jsonl
```

When making model-specific claims, pin the compared models explicitly in the
live harness runs rather than relying on host defaults.

Current suites:

- `flywheel`
- `fw-ideate`
- `fw-plan`
- `fw-work`
- `fw-review`
- `fw-debug`
- `fw-ship`
- `fw-optimize`

## Suite Contract

Each suite directory contains:

- `manifest.json` — machine-readable scoring dimensions and pass thresholds
- `cases.jsonl` — case inputs
- `rubric.md` — human grading guidance

The harness validates the suite shape before it prepares or summarizes runs.

## Prepare Flow

`prepare` creates a timestamped run directory, by default under
`.context/flywheel-evals/`, containing:

- `metadata.json`
- `cases.jsonl`
- `results.template.jsonl`
- `RUNBOOK.md`

Use `--out <dir>` if you want the run artifacts somewhere else.

## Results Format

Each line in `results.jsonl` or `results.template.jsonl` is one graded case:

```json
{
  "id": "idea_to_brainstorm",
  "scores": {
    "Stage Selection": 2,
    "Workflow Coherence": 2,
    "Shortcut Discipline": 1,
    "Handoff Quality": 2,
    "Repo Grounding": 2,
    "End-State Awareness": 2
  },
  "notes": "Clear routing and downstream handoff."
}
```

Scores must be `0`, `1`, or `2`.

## Pass Rules

The harness reads pass thresholds from each suite manifest:

- `pass`: no `0` on critical dimensions and average score meets `passAverage`
- `strong-pass`: no `0` anywhere and average score meets `strongPassAverage`
- `fail`: anything else

The summarize command exits non-zero when any case fails or is missing, which
makes it suitable for a lightweight CI or local regression loop.
