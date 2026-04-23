---
title: Use a shared evidence bundle for cross-stage proof handoffs
date: 2026-04-19
last_updated: 2026-04-19
category: operational-guidance
module: flywheel-workflow
problem_type: operational_guidance
component: developer_workflow
severity: medium
doc_status: active
files_touched:
  - skills/browser-test/SKILL.md
  - skills/review/SKILL.md
  - skills/optimize/SKILL.md
  - skills/verify/SKILL.md
  - skills/commit/SKILL.md
  - skills/commit/references/evidence-bundle.md
applies_when:
  - browser proof, review, optimization, or verification output should feed a later Flywheel stage
  - a PR or commit step needs reusable proof without depending on chat history
symptoms:
  - later stages had to rediscover evidence from prior stages
  - proof reuse risked copying raw local artifacts or sensitive payloads into PR text
root_cause: workflow_gap
resolution_type: workflow_improvement
tags:
  - evidence-bundle
  - commit
  - review-handoff
  - browser-proof
  - verification
related_docs:
  - docs/solutions/operational-guidance/dedicated-rollout-and-incident-stages-for-runtime-risk-2026-04-19.md
  - docs/solutions/developer-experience/journey-evals-without-a-harness-redesign-2026-04-19.md
  - docs/solutions/developer-experience/keep-eval-suite-ids-separate-from-runtime-skill-names-2026-04-19.md
---

# Use a shared evidence bundle for cross-stage proof handoffs

## Context

Flywheel gained multiple proof-producing stages: browser proof, structured
review artifacts, optimization summaries, and verification checks. Without one
shared handoff contract, each later stage had to reconstruct proof from chat,
native artifact directories, or memory.

## Guidance

Keep one local-first evidence bundle under:

```text
.context/flywheel/evidence/<bundle-id>/
```

Use `summary.md` as the canonical reusable index. Keep raw artifacts in the
native stage directories and link to them from the bundle instead of copying
large or sensitive outputs around.

The bundle should carry only what downstream stages need:

- the claim supported by the evidence
- the proof source path
- whether the item is `clean`, `redacted`, or `local-only`
- whether the item is safe for PR reuse or summary-only

`$fw:commit` should read the bundle first when it exists and include only
sanitized, PR-safe items in the PR story.

## Why This Matters

This keeps proof reusable without making later stages depend on chat context.
It also preserves the 90%-confidence sensitive-data rule by separating the
reusable summary from raw local artifacts such as traces, payloads, and console
dumps.

## When to Apply

- when browser-visible work produces screenshots, snapshots, or trace notes
- when review produces a verdict that commit should cite
- when optimization or verification creates proof that must survive into commit
- when local raw artifacts are useful but not safe to paste into a PR

## Examples

Browser proof stays local:

```text
.context/flywheel/browser/<run-id>/
```

Reusable summary goes into:

```text
.context/flywheel/evidence/<bundle-id>/summary.md
```

A good bundle summary references:

- the browser screenshot or snapshot path
- the review artifact directory and verdict
- the verification command and fresh result
- any rollout-safe summary bullets a PR can reuse

## Related

- [Dedicated rollout and incident stages for runtime risk](docs/solutions/operational-guidance/dedicated-rollout-and-incident-stages-for-runtime-risk-2026-04-19.md)
- [Journey evals without a harness redesign](docs/solutions/developer-experience/journey-evals-without-a-harness-redesign-2026-04-19.md)
- [Keep eval suite IDs separate from runtime skill names](docs/solutions/developer-experience/keep-eval-suite-ids-separate-from-runtime-skill-names-2026-04-19.md)
