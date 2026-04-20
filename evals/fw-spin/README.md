# `fw-spin` Prompt Eval Pack

This directory contains a lightweight prompt-eval pack for
`skills/spin/SKILL.md`.

Use it to check whether `fw-spin` behaves like a living knowledge-store
maintainer rather than a one-shot markdown writer.

## What This Eval Measures

- capture only verified or clearly selected lessons
- write or refresh `docs/solutions/` entries with the retrieval contract intact
- prefer update or supersede over duplicate creation when overlap is strong
- run bounded housekeeping on neighboring docs instead of broad repo gardening
- preserve future reuse by ideate, brainstorm, plan, work, review, and debug

## Quick Use

```bash
node scripts/flywheel-eval.js prepare fw-spin
node scripts/flywheel-eval.js summarize fw-spin path/to/results.jsonl
```

## Notes

- The eval scores prompt behavior, not actual file edits.
- Strong performance means the model talks about canonicalization,
  supersession, tags, and bounded housekeeping in the right places.
