# `fw-ideate` Prompt Eval Pack

This directory contains a lightweight prompt-eval pack for
`skills/fw-ideate/SKILL.md`.

It is designed for three use cases:

1. **Manual regression checks** inside Codex or Claude Code
2. **OpenAI Evals** using the current `fw-ideate` prompt as the prompt under
   test
3. **Claude Console Evaluate** using the same case set and rubric

## Files

- `manifest.json` — machine-readable suite contract for the eval harness
- `cases.jsonl` — prompt-eval cases
- `rubric.md` — scoring criteria and pass thresholds

## What This Eval Measures

The eval focuses on the behavior we most recently tightened:

- correct mode selection
- repo grounding vs. outside-repo grounding
- output structure consistency
- shortlist quality
- routing to `/fw:brainstorm` instead of skipping the workflow
- restraint on narrow prompts and quick-shortlist prompts
- honoring explicit constraints such as `no external research`

It does **not** fully measure hidden orchestration behavior like actual
subagent counts unless your host exposes traces or tool-call logs.

## Case Format

Each line in `cases.jsonl` is a JSON object with one `item` payload. At
minimum, use:

- `item.id` as the stable case identifier
- `item.arguments` as the user-facing prompt or skill arguments
- `item.expected_mode` as the expected ideation mode
- `item.special_constraints` and `item.success_definition` as grader context

`item.case_id` is retained as a compatibility alias for tools or notes that
already expect that field.

## Manual Use

For a quick regression pass:

1. Open `skills/fw-ideate/SKILL.md`
2. Run the skill against each `item.arguments` case
3. Grade the output using `rubric.md`

Keep the grading notes next to the case ID so you can compare revisions over
time.

For a repeatable harness-driven run, use:

```bash
node scripts/flywheel-eval.js prepare fw-ideate
node scripts/flywheel-eval.js summarize fw-ideate path/to/results.jsonl
```

## OpenAI Evals Use

This pack is compatible with the Evals workflow conceptually:

1. Upload `cases.jsonl` as an eval dataset.
2. Use the current `fw-ideate` prompt as the prompt under test.
3. Template in `{{item.arguments}}`.
4. Add graders based on `rubric.md`.
5. Re-run the same eval after each prompt revision.

Recommended grader style:

- one narrow grader per property
- detailed textual feedback on failures
- human review on open-ended quality dimensions

OpenAI guidance currently recommends using datasets with detailed critiques and
re-running linked evals on every prompt revision.

## Claude Console Evaluate Use

In Claude Console:

1. Put the prompt under test into the prompt editor.
2. Add at least one dynamic variable using `{{arguments}}`.
3. Mirror each case row from `cases.jsonl`.
4. Grade responses with `rubric.md`.

Claude's docs currently recommend using multiple test cases, comparing versions
side by side, and using a consistent quality rubric.

## Suggested First Pass

Run these first:

- `repo_quick_shortlist`
- `outside_repo_software`
- `universal_non_software`
- `no_external_research`

If those pass cleanly, run the full set.
