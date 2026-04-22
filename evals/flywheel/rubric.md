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
- plan before work when execution details still need structure, and planning
  runs document review before the user chooses deepen or work
- shape -> work -> review -> commit as the compact backbone for software-project work
- helper surfaces such as research, architecture strategy, pattern
  recognition, maintainability, or simplify can be selected when they are the
  most direct fit, without turning them into mandatory visible stages
- review before merge when code changed or when work completes on the current branch
- spin after work or commit when lessons should be preserved

### 3. Shortcut Discipline

Does it allow shortcuts only when the task is truly ready?

- direct-to-work is fine for small, clear, well-bounded tasks
- skipping straight to work is not fine for ambiguous product work

### 4. Handoff Quality

Does it explain what the selected stage should produce and what comes next?

For fuzzy or workflow-shaping requests, strong handoff quality also makes the
next user input explicit instead of acting as if routing alone resolved the
ambiguity.

Expected examples:

- brainstorming -> requirements doc -> planning
- planning -> reviewed technical plan -> deepen or work
- work -> implementation, helper checks as needed, review, commit, optional spin

### 5. Repo Grounding

When the case is repo-bound, does it speak in repo workflow terms instead of
generic product advice?

### 6. End-State Awareness

Does it keep the overall path pointed toward a working PR and captured
learnings, not just the next single stage?

### 7. Interactive Routing

For fuzzy or early-stage requests, does it ask one material question or state
the next needed user input instead of silently assuming the framing is already
correct?

## Pass Threshold

Recommended pass rule:

- no `0` on dimensions 1, 2, 4, or 7
- average score at least `1.5`

Strong pass:

- no `0` anywhere
- average score at least `1.75`
