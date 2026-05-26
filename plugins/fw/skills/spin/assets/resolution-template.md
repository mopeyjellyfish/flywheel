# Resolution Templates

Choose the template matching the problem_type track from
`references/schema.yaml`.

---

## Bug Track Template

Use for: `build_error`, `test_failure`, `runtime_error`, `performance_issue`,
`database_issue`, `security_issue`, `api_contract_issue`, `integration_issue`,
`logic_error`

```markdown
---
title: [Clear problem title]
date: [YYYY-MM-DD]
category: [category slug from schema, e.g. build-errors]
module: [Module or area]
problem_type: [schema enum]
component: [schema enum]
severity: [schema enum]
doc_status: active
files_touched:
  - [repo-relative path or directory]
symptoms:
  - [Observable symptom 1]
root_cause: [schema enum]
resolution_type: [schema enum]
tags:
  - [keyword-one]
  - [keyword-two]
supersedes:
  - [optional repo-relative doc path this entry replaces]
---

# [Clear problem title]

## Problem
[1-2 sentence description of the issue and user-visible or engineer-visible
impact]

## Symptoms
- [Observable symptom or error]

## What Didn't Work
- [Attempted fix, investigation step, or false lead worth remembering]

## Solution
[The fix that worked, including repo-relative paths and code examples when
useful]

## Why This Works
[Root cause explanation and why the chosen fix addresses it]

## Prevention
- [Concrete practice, test, or guardrail]

## Related
- [Related docs, issues, or follow-up work, if any]
```

---

## Knowledge Track Template

Use for: `best_practice`, `documentation_gap`, `workflow_issue`,
`developer_experience`, `operational_guidance`

```markdown
---
title: [Clear, descriptive title]
date: [YYYY-MM-DD]
category: [category slug from schema, e.g. workflow-issues]
module: [Module or area]
problem_type: [schema enum]
component: [schema enum]
severity: [schema enum]
doc_status: active
files_touched:
  - [repo-relative path or directory]
applies_when:
  - [Condition where this applies]
tags:
  - [keyword-one]
  - [keyword-two]
supersedes:
  - [optional repo-relative doc path this entry replaces]
---

# [Clear, descriptive title]

## Context
[What situation, gap, or friction prompted this guidance]

## Guidance
[The practice, pattern, or recommendation with code examples when useful]

## Why This Matters
[Rationale and impact of following or not following this guidance]

## When to Apply
- [Conditions or situations where this applies]

## Examples
[Concrete before/after or usage examples showing the practice in action]

## Related
- [Related docs, issues, or follow-up work, if any]
```
