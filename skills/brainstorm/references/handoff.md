# Handoff

This content is loaded when Phase 4 begins — after the requirements document is
written and reviewed.

---

#### 4.1 Present Next-Step Options

Present the options using the platform's blocking question tool if one exists.
If no question tool is available, present the numbered options in chat and wait
for the user's reply before proceeding.

Before presenting the menu, summarize:

- what Flywheel now believes the problem or opportunity is
- what changed from the user's starting frame
- what remains open, if anything
- what `$flywheel:plan` would work on first

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

Present only the options that apply, keeping the total at 4 or fewer:

- **Proceed to planning (Recommended)** - Move to `$flywheel:plan` for structured
  implementation planning. Shown only when `Resolve Before Planning` is empty.
- **Continue the brainstorm** - Answer more clarifying questions to tighten
  scope, edge cases, and preferences. Always shown.
- **Open in Proof (web app) — review and comment to iterate with the agent** -
  Open the doc in Proof, iterate with the agent via comments, or copy a link
  to share with others. Shown only when a requirements document exists and the
  `proof` skill or an equivalent
  HITL review tool exists.
- **Done for now** - Pause; the requirements doc is saved and can be resumed
  later. Always shown.

**Surface additional document review contextually, not as a menu fixture:**
When the prior document-review pass surfaced residual P0 or P1 findings that
the user has not addressed, mention them adjacent to the menu and offer another
review pass in prose. Do not add it to the option list.

#### 4.2 Handle the Selected Option

**If user selects "Proceed to planning (Recommended)":**

Immediately run `$flywheel:plan` in the current session. Pass the requirements
document path when one exists; otherwise pass a concise summary of the finalized
brainstorm decisions using the synthesis block format above. Do not print the
closing summary first.

**If user selects "Continue the brainstorm":**

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
- **recommended next step:** `$flywheel:plan`

Follow the proof skill's review workflow and then re-render the Phase 4 options
using the updated document state.

**If the user asks to run another document review** (either from the contextual
prompt when P0/P1 findings remain, or by free-form request):

Load the `document-review` skill and apply it to the requirements document for
another pass if that skill exists. If not, run a careful manual review against
the requirements-capture guidance. When review is complete, return to the normal
Phase 4 options and present only the options that still apply. Do not show the
closing summary yet.

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

Recommended next step: `$flywheel:plan`
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

Resume with `$flywheel:brainstorm` when ready to resolve these before planning.
```
