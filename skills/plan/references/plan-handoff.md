# Plan Handoff

This file contains post-plan-writing instructions: document review, final
checks, post-generation options, and issue creation. Load it only after the
plan file exists on disk and the confidence check is complete.

## 5.3.8 Document Review

After the confidence check, run `document-review` on the plan file. This step is
mandatory — do not skip it because the confidence check already ran. The two
workflows catch different classes of issues.

The confidence check and document-review are complementary:

- the confidence check strengthens rationale, sequencing, risk treatment, and
  grounding
- document-review checks coherence, feasibility, scope alignment,
  simplification pressure, observability/supportability gaps, and returns a
  confidence-aware, stack-ranked fix queue

If document-review auto-applied fixes, note them briefly when presenting handoff
options.

If residual `P0` or `P1` findings remain, or a clearly blocking top-ranked item
remains in the queue, mention that so the user can decide whether to address it
before proceeding.

If document-review flags architecture or implementation shape that appears
heavier than the plan's stated goal requires, call that out explicitly when
presenting handoff so the user can choose whether to proceed with that carrying
cost or simplify first.

If document-review flags runtime observability or operational validation blind
spots, call that out explicitly when presenting handoff so the user can decide
whether to tighten the rollout and support story before implementation.

If document-review flags unresolved runtime tradeoffs such as retries,
fallbacks, degraded modes, queue handling, or blast-radius concerns, call that
out explicitly when presenting handoff so the user can decide whether to lock
that posture down before implementation.

When document-review returns `Review complete`, proceed to final checks.

**Pipeline mode:** In automated or non-interactive pipeline contexts, run
`document-review` with `mode:headless` and the plan path. Address any residual
`P0` or `P1` findings before returning control to the caller.

## 5.3.9 Final Checks and Cleanup

Before proceeding to post-generation options:

- confirm the plan is stronger in specific ways, not merely longer
- confirm the planning boundary is intact
- confirm origin decisions were preserved when an origin document exists
- confirm the testing strategy is aligned with repo idioms and explicit enough
  for the next implementer to start

If artifact-backed mode was used for deepening:

- clean up the temp scratch directory after the plan is safely updated
- if cleanup is not practical on the current platform, note where the artifacts
  were left

## 5.4 Post-Generation Options

**Pipeline mode:** In automated or non-interactive contexts, skip the
interactive menu and return control immediately. The plan file already exists,
the confidence check already ran, and document-review already ran.

After document-review completes, present the options by calling the exact host
question tool named in the host interaction contract when that tool is
available. This is the plan-to-work approval gate. Do not call `fw:work`, edit
implementation files, or otherwise begin execution until the user selects a
work-start option or gives an explicit same-turn implementation instruction.

A markdown menu is only the fallback after the tool is unavailable or errors.
Otherwise present a short label-based choice surface in chat instead of asking
for raw numeric replies, then wait for the user's answer.

Before presenting options, summarize:

- what the plan now covers
- what changed or sharpened during planning
- the most important decisions or tradeoffs that were locked in
- any architecture or pattern decisions that later stages must preserve
- what still needs user confirmation or is intentionally deferred
- what execution would work on first, including the first serial unit or first
  eligible parallel-ready batch when the plan defines both
- the Flywheel handoff card from `../../references/workflow-gates.md`, with
  `Ready` set to `conditional` until the user chooses the next action

**Question:** "Plan ready at `docs/plans/YYYY-MM-DD-NNN-<type>-<name>-plan.md`.
Are you happy with this plan as the basis for implementation?"

Present a portable `2-3` option menu with the recommended choice first. Use a
fourth explicit option only when the active host question schema supports it.

If the review pass surfaced material findings, unresolved tradeoffs, or the
user asked for more rigor, use:

1. **Address review findings first (Recommended)** — revise, deepen, or route
   back to questions before execution, then rerun `document-review`
2. **Start `$fw:work` with assumptions** — begin implementation only after
   accepted residual findings are captured as explicit risks or assumptions
3. **Done for now** — pause; the plan file is saved and can be resumed later

If the reviewed plan is clean and the remaining uncertainty is low, use:

1. **Start `$fw:work` now** (recommended) — confirms the plan is accepted as
   the basis for implementation in the current session
2. **Deepen first** — run `$fw:deepen` before execution
3. **Done for now** — pause; the plan file is saved and can be resumed later

If the `proof` skill or an equivalent HITL review tool exists, mention that
option in prose alongside the menu instead of replacing the explicit review
and downstream-stage choice above.

If issue creation is useful, mention that **Create Issue** is available through
the host's freeform path. On hosts that support a fourth explicit choice, it may
be shown as **Create Issue**.

Based on selection:

- **Address review findings first** → choose the upstream action from the
  findings: route product or scope blockers to `$fw:brainstorm`; call
  `$fw:deepen` for plan-strengthening findings; revise the plan in place for
  direct corrections; then rerun `document-review`
- **Deepen first** → call `$fw:deepen` when the plan needs more repo research,
  test posture, rollout posture, or architecture detail
- **Start `$fw:work` now** → call `$fw:work` with the plan path
- **Start `$fw:work` with assumptions** → capture accepted residual findings as
  explicit risks or assumptions in the plan handoff, then call `$fw:work` with
  the plan path
- **Create Issue** → follow the issue creation section below
- **Done for now** → confirm the plan file is saved and end the turn
- **If the user asks for another document review** → rerun `document-review`
  with the plan path, then return to the options
- **Other free-form revisions** → revise the plan in place, rerun
  `document-review` on the updated plan, then return to the options

## Issue Creation

When the user selects `Create Issue`, detect the project tracker:

1. read `AGENTS.md` at the repo root when present and look for
   `project_tracker: github` or `project_tracker: linear`
2. if `project_tracker: github`, use `gh issue create`
3. if `project_tracker: linear`, use the Linear CLI if installed
4. if no tracker is configured, ask the user which tracker to use, then offer
   to persist the choice in `AGENTS.md`
5. if the tracker's CLI is unavailable or unauthenticated, surface a clear
   error and return to the options

After issue creation:

- display the issue URL
- ask whether to proceed to `$fw:work`
