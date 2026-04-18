# `flywheel` Routing Rubric

Use this rubric for manual grading or future eval automation.

## Scoring

Score each dimension:

- `2` = clearly passes
- `1` = partially passes
- `0` = fails

## Dimensions

### 1. Stage Selection

Did the router choose the correct immediate Flywheel stage?

Automatic fail if it routes to the wrong stage.

### 2. Workflow Coherence

Does the answer preserve the Flywheel sequence instead of skipping necessary
steps?

- ideate before brainstorm when the problem is idea selection
- brainstorm before plan when behavior and scope are unclear
- plan before work when execution details still need structure
- review before merge when code is already changed
- spin after work or shipping when lessons should be preserved

### 3. Shortcut Discipline

Does it allow shortcuts only when the task is truly ready?

- direct-to-work is fine for small, clear, well-bounded tasks
- skipping straight to work is not fine for ambiguous product work

### 4. Handoff Quality

Does it explain what the selected stage should produce and what comes next?

Expected examples:

- brainstorming -> requirements doc -> planning
- planning -> technical plan -> work
- work -> implementation, review, shipping, optional spin

### 5. Repo Grounding

When the case is repo-bound, does it speak in repo workflow terms instead of
generic product advice?

### 6. End-State Awareness

Does it keep the overall path pointed toward a working PR and captured
learnings, not just the next single stage?

## Pass Threshold

Recommended pass rule:

- no `0` on dimensions 1, 2, or 4
- average score at least `1.5`

Strong pass:

- no `0` anywhere
- average score at least `1.75`
