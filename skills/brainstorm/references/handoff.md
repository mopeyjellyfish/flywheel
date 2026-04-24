# Handoff

This content is loaded when Phase 4 begins — after the requirements document is
written and reviewed.

---

#### 4.1 Present Next-Step Options

Present the options by calling the exact host question tool named in the host
interaction contract when that tool is available. A markdown menu is only the
fallback after the tool is unavailable or errors. If no such tool is available,
present a short label-based choice surface in chat instead of asking for raw
numeric replies, then wait for the user's answer.

Before presenting the menu, summarize:

- what Flywheel now believes the problem or opportunity is
- what changed from the user's starting frame
- what remains open, if anything
- what `$fw:plan` would work on first

If no requirements document exists, present that summary as a compact synthesis
block in chat that also includes:

- key decisions
- scope boundaries
- success criteria

If `Resolve Before Planning` contains any items:

- Ask the blocking questions now, one at a time, by default.
- If the user explicitly wants to proceed anyway, first convert each remaining
  item into an explicit decision, assumption, or `Deferred to Planning`
  question.
- If the user chooses to pause instead, present the handoff as paused or
  blocked rather than complete.
- Do not offer `Proceed to planning` or `Proceed directly to work` while
  `Resolve Before Planning` remains non-empty.

**Question when no blocking questions remain:** "Brainstorm complete. What
would you like to do next?"

**Question when blocking questions remain and user wants to pause:** "Brainstorm
paused. Planning is blocked until the remaining questions are resolved. What
would you like to do next?"

Present a portable `2-3` option menu by default. Use a fourth explicit option
only when the active host question schema supports it.

If `Resolve Before Planning` still contains items, use:

1. **Resolve questions first (Recommended)** - Continue the brainstorm and ask
   the remaining planning blockers one at a time.
2. **Review current requirements** - Run or rerun `document-review` to find
   simplification, feasibility, scope, or supportability issues before deciding
   whether the blockers are complete.
3. **Done for now** - Pause; the requirements doc is saved and can be resumed
   later.

If no blocking questions remain and the prior document-review pass found no
material residual findings, use:

1. **Proceed to planning (Recommended)** - Move to `$fw:plan` for structured
   implementation planning.
2. **Review requirements first** - Run or rerun `document-review` before
   planning.
3. **Done for now** - Pause; the requirements doc is saved and can be resumed
   later.

If document-review surfaced residual `P0` or `P1` findings, a clearly worthwhile
top-ranked item, or the user asked for extra rigor, use:

1. **Address review findings first (Recommended)** - Continue the brainstorm or
   rerun `document-review` until feasibility, simplification, scope, and
   supportability issues are resolved enough for planning.
2. **Proceed to planning with assumptions** - Convert the remaining findings
   into explicit assumptions, decisions, or `Deferred to Planning` questions
   before invoking `$fw:plan`.
3. **Done for now** - Pause; the requirements doc is saved and can be resumed
   later.

If the `proof` skill or an equivalent HITL review tool exists, mention that
review path in prose alongside the menu. On hosts that support a fourth explicit
choice, it may be offered as **Open in Proof**; otherwise rely on the host's
freeform path.

#### 4.2 Handle the Selected Option

**If user selects "Proceed to planning (Recommended)" or "Proceed to planning
with assumptions":**

Immediately run `$fw:plan` in the current session. Pass the requirements
document path when one exists; otherwise pass a concise summary of the finalized
brainstorm decisions using the synthesis block format above. Do not print the
closing summary first.

Before invoking `$fw:plan`, convert any accepted residual review items into
explicit assumptions, decisions, or `Deferred to Planning` questions so planning
does not inherit hidden uncertainty.

**If user selects "Continue the brainstorm", "Resolve questions first", or asks
to refine requirements before planning:**

Return to Phase 1.3 (Collaborative Dialogue) and continue asking the user
clarifying questions one at a time to further refine scope, edge cases,
constraints, and preferences. Continue until the user is satisfied, then return
to Phase 4. Do not show the closing summary yet.

**If user selects "Open in Proof (web app) — review and comment to iterate with
the agent":**

Only offer this path when the `proof` skill or an equivalent review tool exists.
If the tool is unexpectedly unavailable at selection time, explain that briefly
and return to the Phase 4 options.

When available, load the `proof` skill in HITL-review mode with:

- **source file:** `docs/brainstorms/YYYY-MM-DD-<topic>-requirements.md`
- **doc title:** `Requirements: <topic title>`
- **identity:** `ai:flywheel` / `Flywheel`
- **recommended next step:** `$fw:plan`

Follow the proof skill's review workflow and then re-render the Phase 4 options
using the updated document state.

**If user selects "Review current requirements", "Address review findings
first", or asks to run another document review:**

Load the `document-review` skill and apply it to the requirements document for
another pass if that skill exists. If not, run a careful manual review against
the requirements-capture guidance. When review is complete, return to the normal
Phase 4 options and present only the options that still apply. Do not show the
closing summary yet.

If the review finds issues that would change product behavior, scope, success
criteria, or the definition of done, route back to Phase 1.3 and ask the needed
questions before planning. If the review findings are technical execution
questions that planning can own, carry them into `$fw:plan` as explicit planning
inputs instead of treating them as blockers.

**If user selects "Done for now":** Display the closing summary (see 4.3) and
end the turn.

#### 4.3 Closing Summary

Use the closing summary only when this run of the workflow is ending or handing
off, not when returning to the Phase 4 options.

When complete and ready for planning, display:

```text
Brainstorm complete!

Requirements doc: docs/brainstorms/YYYY-MM-DD-<topic>-requirements.md  # if one was created

Key decisions:
- [Decision 1]
- [Decision 2]

What changed:
- [Clarification or correction 1]
- [Clarification or correction 2]

Recommended next step: `$fw:plan`
```

If the user pauses with `Resolve Before Planning` still populated, display:

```text
Brainstorm paused.

Requirements doc: docs/brainstorms/YYYY-MM-DD-<topic>-requirements.md  # if one was created

Planning is blocked by:
- [Blocking question 1]
- [Blocking question 2]

What changed so far:
- [Clarification or correction 1]
- [Clarification or correction 2]

Resume with `$fw:brainstorm` when ready to resolve these before planning.
```
