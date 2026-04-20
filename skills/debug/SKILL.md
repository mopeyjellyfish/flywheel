---
name: debug
description: "Investigate bugs systematically, prove the causal hypothesis, and either fix them with a red failing test or route the design problem back into brainstorming or planning. Use for test failures, regressions, production bugs, stack traces, and 'why is this broken?' work."
metadata:
  argument-hint: "[issue, stack trace, failing test, reproduction steps, or broken behavior]"
---

# Debug and Prove

`$flywheel:debug` is the Flywheel bug-investigation path.

If the work starts from live operational evidence and the immediate job is to
choose mitigation, rollback, or patch posture, start with `$flywheel:incident`
instead. Use `$flywheel:debug` after the incident frame is clear enough to pursue a
causal proof.

The goal is not to guess a fix. The goal is to:

1. reproduce the problem
2. trace the causal chain
3. prove the hypothesis
4. either fix it with a red failing test or route the deeper design problem
   into `$flywheel:brainstorm` or `$flywheel:plan`

**When directly invoked, always debug.** Do not skip to code changes just
because the failure "looks obvious."

## Input

<bug_input> #$ARGUMENTS </bug_input>

Interpret the input as:

- a failing test or error message
- a bug report or issue reference
- a reproduction sequence
- unexpected behavior the user wants explained or fixed

## Core Principles

1. **No fix without a causal chain** - explain how the trigger reaches the
   symptom with no hand-waving.
2. **Use evidence before ideas** - logs, traces, reproductions, and code paths
   outrank intuition.
3. **One hypothesis at a time** - if you are changing multiple things to "see
   what helps," stop.
4. **A bug fix needs a red signal** - when the bug is local enough to fix now,
   prove it with a failing test or equivalent failing reproducer before the
   implementation.
5. **Design problems route upstream** - if the root cause reveals the design is
   wrong or underspecified, capture that and route into `$flywheel:brainstorm` or
   `$flywheel:plan` instead of papering over it.
6. **No completion claims without fresh verification** - use
   `$flywheel:verify` discipline before saying the bug is fixed.
7. **Reuse prior lessons without trusting them blindly** - when the active
   repo's `docs/solutions/` contains a closely related failure or workaround,
   use it to avoid repeating dead ends, then verify that the current bug is
   actually the same shape before acting on it.
8. **Honor repo-local bug-fix gates when present** - if
   `.flywheel/config.local.yaml` requires a reproducer before implementation,
   do not skip that gate just because the fix looks obvious.

## Workflow

### Phase 0: Intake The Bug Report

If the input includes an issue reference, fetch it before investigating.

GitHub forms to recognize:

- `#123`
- `owner/repo#123`
- `https://github.com/<owner>/<repo>/issues/<number>`

When GitHub CLI is available, use `gh issue view` with structured output and
extract:

- reported symptoms
- expected behavior
- reproduction steps
- labels or severity hints
- environment notes
- prior discussion that rules out already-failed ideas

If the input points at another tracker URL or identifier, use whatever local
tooling or available app surfaces can fetch it. If the issue cannot be fetched,
ask the user to paste the relevant content rather than pretending the report was
read.

If the user already says they tried fixes that failed, capture those attempts up
front so the investigation does not repeat them blindly.

If `.flywheel/config.local.yaml` exists, read
`debug.require_reproducer_before_fix` before choosing a local bug-fix path.

### Phase 1: Reproduce and Gather Evidence

- when the active repo has `docs/solutions/`, search that local store before
  deep investigation:
  - prefer frontmatter-first lookup by `files_touched`, `module`, `tags`,
    `problem_type`, `component`, and title
  - prefer `doc_status: active`
  - if a strong hit has `superseded_by`, follow that path first
  - read only the strongest hits and use them to avoid repeating known dead
    ends or outdated fixes
- reproduce the bug with the real failing test, command, or runtime path when
  possible
- read the relevant code path in both directions: from trigger to symptom and
  from symptom back upstream
- use the project's actual observability surfaces when present:
  - logs
  - traces
  - error trackers
  - dashboards
  - database or queue state

If the system crosses multiple components, add targeted diagnostic
instrumentation at boundaries before proposing a fix.

If the investigation turns into telemetry or instrumentation design, load
`$flywheel:observability` instead of improvising a support strategy from memory. If the
main gap is log-event shape or logging quality, load `$flywheel:logging`.

If the issue is still live, the blast radius is not yet bounded, or rollback
vs patch is still an open decision, route to `$flywheel:incident` before continuing
with local bug-fix work.

### Phase 2: State the Causal Hypothesis

Before editing:

- name the root-cause hypothesis
- cite the responsible file or boundary
- explain the step-by-step causal chain
- state what failing test or reproducer should prove the hypothesis
- note whether any prior active-repo `docs/solutions/` entry looks relevant and
  whether it was confirmed, rejected, or only partially applicable

If you cannot do that yet, keep investigating.

### Phase 3: Choose the Right Route

#### Route A: Local Bug Fix

Use this route when the bug is local enough to fix responsibly now.

If local policy requires a reproducer before fix and no red failing test or
equivalent reproducer exists yet, do not implement. Keep investigating until
the red signal exists or route the work upstream.

Required sequence:

1. create or isolate the red failing test or reproducer
2. confirm it fails for the reason your hypothesis predicts
3. implement the minimal fix
4. rerun the red test until it turns green
5. run the broader relevant checks

#### Route B: Design or Requirements Problem

Use this route when:

- the code is behaving as designed but the design is wrong
- the clean fix requires changing responsibilities or interfaces first
- every plausible code change looks like a workaround instead of the right fix

In that case:

- summarize the root cause and why it is a design problem
- route to `$flywheel:brainstorm` if the behavior or scope is still unclear
- route to `$flywheel:plan` if the desired behavior is clear but the execution shape
  needs redesign
- carry forward the failing test or reproducer that the later implementation
  must satisfy

## Output Contract

Return:

1. **Problem** — what is failing
2. **Evidence** — reproduction and supporting runtime or code evidence
3. **Causal chain** — trigger -> path -> symptom
4. **Red signal** — the failing test or reproducer that proves the hypothesis
5. **Next move** — fix now, or route into brainstorming or planning

If you fix the bug in this invocation, close with the verification evidence used
to prove the fix.
