---
name: debug
description: "Investigate hard bugs, regressions, stack traces, or broken behavior with evidence, a repro loop, causal proof, and a fix path."
metadata:
  argument-hint: "[issue, stack trace, failing test, reproduction steps, or broken behavior]"
---

# Debug and Prove

`$fw:debug` is the Flywheel bug-investigation path.

Use it for failures, regressions, stack traces, broken behavior, nondeterministic
failures, and performance regressions where the first job is diagnosis. If the
work is live operational response and rollback versus patch is still undecided,
start with `$fw:incident`. If the goal is general latency, throughput, memory,
query, build, or cost improvement rather than a regression, use `$fw:optimize`.

The goal is not to guess a fix. The goal is to build the fastest faithful
feedback loop, prove the causal chain, fix through a red signal when a local fix
is responsible, and route deeper design or architecture problems before they
become the next bug.

**When directly invoked, always debug.** Do not skip to code changes just
because the failure looks obvious.

## Input

<bug_input> #$ARGUMENTS </bug_input>

Interpret the input as:

- a failing test or error message
- a bug report or issue reference
- a stack trace, crash, flaky failure, or performance regression
- a reproduction sequence
- unexpected behavior the user wants explained or fixed

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Call the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When the debug pass spans multiple material steps, use the host task-tracking
tool named in `../references/host-interaction-contract.md` to create and
maintain a short task list.

## Reference Loading Map

Do not preload every support file. Load only what the current investigation
needs:

- Load `../tdd/SKILL.md` before implementing a local bug fix unless the red
  signal is a non-test executable proof such as a CLI command, replay, or
  manual fixture.
- Load `$fw:incident` when a live or recently live issue still needs blast
  radius, mitigation, rollback, or patch framing.
- Load `$fw:observability` when the investigation exposes missing telemetry,
  trace, dashboard, metric, or supportability signals.
- Load `$fw:logging` when the main gap is log-event shape, field stability, or
  correlation.
- Load `$fw:architecture-strategy`, `$fw:maintainability`,
  `$fw:pattern-recognition`, or `$fw:simplify` when the proven root cause is a
  boundary, ownership, pattern, coupling, or accidental-complexity problem.
- Load `$fw:decision` when the fix contradicts a durable product, workflow,
  architecture, terminology, or compatibility decision.
- Load `$fw:verify` discipline before claiming the bug is fixed.

## Core Principles

1. **Feedback loop before cleverness** - a fast, faithful pass/fail loop turns
   debugging into evidence work. Without one, code reading easily becomes
   guessing.
2. **Match the user's symptom** - prove the loop reproduces the reported bug,
   not a nearby failure that happens to be easier to trigger.
3. **Evidence outranks ideas** - logs, traces, reproductions, tests, profiles,
   data state, and code paths beat intuition.
4. **Minimize without changing the bug** - shrink the reproduction until it is
   cheap to run, but keep the same failure mode and causal path.
5. **Rank falsifiable hypotheses** - generate several plausible causes, attach
   predictions, then test one variable at a time.
6. **A local bug fix needs a red signal** - when the bug is local enough to fix
   now, prove it with a failing test or equivalent failing reproducer before
   implementation.
7. **Architecture gaps are findings** - no correct test seam, hidden coupling,
   unclear ownership, or tangled boundaries are part of the root cause, not
   cleanup trivia.
8. **No completion claims without fresh verification** - rerun the original
   feedback loop and the regression proof before saying the bug is fixed.
9. **Clean up the investigation** - remove tagged debug instrumentation,
   temporary harnesses, throwaway fixtures, and local-only probes unless they
   become intentional repo artifacts.
10. **Preserve reusable lessons** - when the investigation teaches a
   non-obvious prevention pattern, offer `$fw:spin` after the fix is verified.

## Workflow

### Phase 0: Intake And Route

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
- environment notes
- labels, severity, or affected version hints
- prior discussion and already-failed fixes

If the input points at another tracker URL or identifier, use whatever local
tooling or available app surfaces can fetch it. If the issue cannot be fetched,
ask the user to paste the relevant content rather than pretending the report was
read.

Capture the bug frame before touching code:

- actual symptom and expected behavior
- environment, version, branch, config, dataset, tenant, browser, device, or
  runtime details when relevant
- recent change window: commits, deploys, dependency updates, migrations,
  config flips, data imports, or feature flags that may bound the regression
- attempts already tried and what they ruled out

Read `.flywheel/config.local.yaml` when present and carry forward local debug
gates such as `debug.require_reproducer_before_fix`.

If the issue is live, the blast radius is not bounded, or rollback versus patch
is still a decision, route to `$fw:incident` before local bug-fix work.

### Phase 1: Build The Feedback Loop

This is the center of the skill. Spend disproportionate effort here.

Search the active repo's `docs/solutions/` before deep investigation when it
exists:

- prefer frontmatter-first lookup by `files_touched`, `module`, `tags`,
  `problem_type`, `component`, and title
- prefer `doc_status: active`
- if a strong hit has `superseded_by`, follow that path first
- read only the strongest hits and use them to avoid repeating known dead ends
  or outdated fixes

Construct the fastest faithful loop that reproduces the user-visible failure.
Try these in roughly this order:

1. **Failing test** at the seam that reaches the bug: unit, integration, or
   end-to-end.
2. **HTTP script** against a running dev server, with stable request fixtures.
3. **CLI invocation** with fixture input, diffing stdout or artifacts against a
   known-good expectation.
4. **Headless browser script** with Playwright or Puppeteer, asserting on DOM,
   console, network, screenshots, or traces.
5. **Captured trace replay** from a real network request, payload, event log,
   queue message, or serialized state.
6. **Throwaway harness** that boots the smallest subset of the system and calls
   the bug path directly.
7. **Property or fuzz loop** when the symptom is intermittent wrong output over
   broad input space.
8. **Bisection harness** when the bug appeared between two known states; make
   the check suitable for `git bisect run` when practical.
9. **Differential loop** that runs the same input through old versus new code,
   two configs, or two data snapshots and diffs the output.
10. **Structured human-in-the-loop script** as a last resort when a human must
    click or operate external state; capture timestamps, commands, and observed
    output so the loop still feeds evidence back into the investigation.

Treat the loop itself as a product:

- make it faster by caching setup, narrowing scope, and skipping unrelated init
- make it sharper by asserting the specific symptom instead of "did not crash"
- make it more deterministic by pinning time, seeding randomness, isolating the
  filesystem, and freezing network or service dependencies

A 30-second flaky loop is weak. A two-second deterministic loop is leverage.

For nondeterministic bugs, the immediate goal is a higher reproduction rate.
Loop the trigger, parallelize when safe, add stress, narrow timing windows,
seed randomness, inject sleeps, or isolate scheduler and IO boundaries. A bug
that reproduces 50% of the time can be debugged; a 1% failure needs a stronger
loop before root-cause work starts.

For performance regressions, create a baseline measurement before changing code:
timing harness, profiler, query plan, flamegraph, allocation profile, browser
trace, or benchmark. Measure first, fix second.

If no credible loop can be built, stop and say so explicitly. List what was
tried and ask for the missing access or artifact: a reproducing environment,
HAR file, log dump, trace, core dump, database snapshot, screen recording with
timestamps, or permission to add temporary instrumentation. Do not proceed to
hypothesize a fix without a loop or a clearly bounded no-loop diagnostic.

### Phase 2: Reproduce And Minimize

Run the loop and watch the bug appear.

Confirm:

- the loop produces the failure mode the user described
- the failure is reproducible across multiple runs, or reproducible at a high
  enough rate to debug for nondeterministic bugs
- the exact symptom is captured: error text, wrong output, state transition,
  slow timing, profile shape, UI artifact, or runtime side effect
- the failure can be minimized without changing its nature

Read the relevant code path in both directions:

- from trigger to symptom
- from symptom back upstream to the first wrong assumption, state, boundary, or
  contract

For data or state bugs, preserve a redacted fixture or state summary that lets
the failure be replayed. Do not mutate production state to make diagnosis
easier.

### Phase 3: Rank Hypotheses

Generate **3-5 ranked hypotheses** before testing any of them. Single
hypotheses anchor too early on the first plausible idea.

Each hypothesis must be falsifiable:

```text
If <cause> is responsible, then <probe or change> will produce <specific result>.
```

Reject or sharpen any hypothesis that cannot state a prediction.

When interaction is useful, show the ranked list before testing so the user can
add domain facts, recent deploy knowledge, or already-ruled-out attempts. Do
not block indefinitely; proceed with the best ranking if the user is
unavailable.

### Phase 4: Probe And Instrument

Each probe must map to one prediction from Phase 3. Change one variable at a
time.

Prefer tools in this order:

1. debugger, REPL, trace viewer, profiler, or query analyzer when the
   environment supports it
2. targeted logs or counters at the boundaries that distinguish hypotheses
3. temporary assertions or invariant checks near the first suspected wrong
   state

Never "log everything and grep."

Tag every temporary debug log or probe with a unique prefix such as
`[DEBUG-a4f2]`. Cleanup must be a single search.

For distributed, async, queue, retry, cache, or concurrency bugs, probe
boundaries explicitly: correlation IDs, ordering, idempotency keys, lock state,
retry attempts, queue offsets, cache keys, clock assumptions, and timeout paths.

If the investigation turns into telemetry or instrumentation design, load
`$fw:observability` or `$fw:logging` instead of inventing a support strategy
from memory.

### Phase 5: State The Causal Chain

Before editing production code, state:

- root-cause hypothesis
- responsible file, module, component, or boundary
- trigger -> path -> symptom chain
- evidence that supports the chain
- hypotheses rejected and what falsified them
- red signal that should fail before the fix and pass after it
- whether a prior `docs/solutions/` entry was confirmed, rejected, or only
  partially applicable

If that chain cannot be stated yet, keep investigating.

### Phase 6: Fix Or Route

#### Route A: Local Bug Fix

Use this route when the bug is local enough to fix responsibly now.

If local policy requires a reproducer before implementation and no red failing
test or equivalent reproducer exists, do not implement. Keep investigating
until the red signal exists or route the work upstream.

Use this sequence:

1. Load `../tdd/SKILL.md` unless the reproducer is a non-test executable proof
   such as a CLI command, replay, or manual fixture.
2. Turn the minimized reproduction into a red failing test or stable executable
   reproducer at the correct seam.
3. Confirm the red signal fails for the reason the causal chain predicts.
4. Implement the minimal fix.
5. Rerun the red signal until it turns green.
6. Rerun the original feedback loop against the unminimized scenario.
7. Refactor only after green when cleanup is useful, then rerun the target
   proof.
8. Run broader relevant checks and apply `$fw:verify` discipline before
   claiming the bug is fixed.

A correct regression seam exercises the real bug pattern as it occurs at the
call site. If the only available seam is too shallow, over-mocked, or unable to
replicate the chain that triggered the bug, do not lock in false confidence.
Document that as an architecture finding.

#### Route B: Design, Architecture, Or Requirements Problem

Use this route when:

- the code is behaving as currently designed but the design is wrong
- the clean fix requires changing responsibilities, boundaries, interfaces, or
  ownership first
- no correct test seam exists because callers, state, or dependencies are too
  tangled
- every plausible code change looks like a workaround

In that case:

- summarize the root cause and why it is not a safe local bug fix
- preserve the failing loop or reproducer as the truth surface for later work
- route to `$fw:architecture-strategy` for boundary or service-shape issues
- route to `$fw:maintainability` for unclear ownership, cohesion, naming, or
  future edit cost
- route to `$fw:simplify` when accidental abstraction or orchestration is the
  core problem
- route to `$fw:brainstorm` when the desired behavior or scope is still unclear
- route to `$fw:plan` when the behavior is clear but execution needs redesign
- route to `$fw:decision` when a durable decision must be reopened

Do not paper over the bug with a local workaround when the causal proof says the
architecture is the problem.

### Phase 7: Cleanup And Prevention

Required before declaring done:

- rerun the original Phase 1 feedback loop and confirm the original symptom no
  longer reproduces
- rerun the regression test or executable red signal
- run the broader relevant checks for the changed surface
- remove all `[DEBUG-...]` instrumentation and search for the prefix
- delete throwaway harnesses and prototypes, or move them into a clearly marked
  debug or regression-test location
- state the correct hypothesis and the rejected alternatives in the final
  report, commit message, or PR body when applicable
- answer: what would have prevented this bug?

If the answer is durable and repo-specific, offer `$fw:spin` after verification
so the next debugging session can find the lesson in `docs/solutions/`.

## Output Contract

Return:

1. **Problem** - what is failing
2. **Feedback loop** - the command, script, trace, fixture, or manual loop used
3. **Evidence** - reproduction, measurements, logs, traces, profiles, or code
   evidence
4. **Hypotheses** - ranked causes, including what was falsified
5. **Causal chain** - trigger -> path -> symptom
6. **Red signal** - the failing test or reproducer that proves the hypothesis
7. **Fix or route** - local fix, or handoff to the right Flywheel stage
8. **Prevention** - architecture, maintainability, test-seam, observability, or
   process change that would prevent recurrence
9. **Verification** - fresh proof used before claiming success, or the exact
   gap that blocks that claim

If no credible feedback loop exists yet, return the attempted loops, the reason
each failed, and the specific artifact or access needed next.
