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

For root-invocation cases, `$fw` and bare `$flywheel` must behave as aliases
for the start router rather than as separate stages or legacy stage namespaces.

### 2. Workflow Coherence

Does the answer preserve the Flywheel sequence instead of skipping necessary
steps?

- shape before work when the request still needs idea selection, requirements
  shaping, planning, or plan deepening
- inside shape, ideate before brainstorm when the problem is idea selection
- inside shape, brainstorm before plan when behavior and scope are unclear
- inside shape, requirements/spec review can happen before planning when the
  source artifact may need simplification or feasibility checks; planning runs
  document review before the user chooses whether to address findings, deepen,
  or work
- shape -> work -> review -> optional spin -> commit as the compact backbone for software-project work
- `$fw:start` is the router, not a backbone stage; `$fw:run` is an explicit
  optional orchestration wrapper, not a default critical-path stage
- helper surfaces such as research, architecture strategy, pattern
  recognition, maintainability, or simplify can be selected when they are the
  most direct fit, without turning them into mandatory visible stages
- review before merge when code changed or when work completes on the current branch
- spin after review and before commit when lessons should be preserved in the
  same branch changes

### 3. Shortcut Discipline

Does it allow shortcuts only when the task is truly ready?

- direct-to-work is fine for small, clear, well-bounded tasks
- skipping straight to work is not fine for ambiguous product work

### 4. Handoff Quality

Does it explain what the selected stage should produce and what comes next?

For fuzzy or workflow-shaping requests, strong handoff quality also makes the
next user input explicit instead of acting as if routing alone resolved the
ambiguity.

Strong handoffs use the canonical Flywheel handoff shape when closing a stage:
Stage, Artifact, Ready, Open decisions, Evidence, and Next.

Expected examples:

- shape -> ranked shortlist, requirements doc, reviewed technical plan, or
  strengthened plan -> work
- work -> implementation, helper checks as needed, review, optional spin, commit

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

When asking, strong passes call the host's structured question tool if it is
available and reserve markdown or numbered chat menus for fallback only.

## Pass Threshold

Recommended pass rule:

- no `0` on dimensions 1, 2, 4, or 7
- average score at least `1.5`

Strong pass:

- no `0` anywhere
- average score at least `1.75`
