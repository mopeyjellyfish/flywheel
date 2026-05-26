# Issue Slice Export

Load this file only when the user asks to create, export, or prepare
issue-ready slices from a spec, requirements doc, or implementation plan.

This reference does not publish issues. It produces portable issue-ready text
that can later be copied into GitHub, GitLab, Linear, Jira, or local markdown.

## Principle

Issues should be vertical tracer bullets. Each issue should deliver one
observable behavior, workflow contract, API contract, CLI behavior, support
path, or verification outcome end to end.

Avoid horizontal issues such as:

- "write all tests"
- "edit all services"
- "update docs"
- "wire all config"
- "run generated artifacts"

Use horizontal issues only for true prerequisites, mechanical sweeps, or final
reconciliation, and mark the exception.

## Issue Shape

```markdown
## <Issue Title>

Type: AFK | HITL
Depends on: <none | issue title>

### Outcome

<The behavior or contract this issue delivers.>

### User Stories Or Requirements

- <Requirement or story covered>

### Build Scope

- <Source, tests, docs, config, migration, generated artifact, or proof work
  needed for this one slice>

### Acceptance Criteria

- <Checkable criterion>

### TDD / Verification

- Red signal: <expected failing test or reproducer, or n/a with reason>
- Green signal: <passing proof>

### Human Interaction

- <None | decision, review, credentials, data, rollout approval>
```

## Type Guidance

- `AFK` means an agent or engineer can execute from the issue without waiting
  for new user decisions.
- `HITL` means the issue includes a human decision, credential, product
  judgment, review, rollout approval, or other input that should not be guessed.

## Export Handoff

End with:

- dependency order
- first issue to start
- which issues can run in parallel after dependencies resolve
- any issue that needs human input before implementation
