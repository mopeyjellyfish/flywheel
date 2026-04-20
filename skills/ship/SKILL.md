---
name: ship
description: "Finish the current branch cleanly: validate readiness, commit with conventional messages, push safely, and create or refresh a PR with testing and operational validation notes. Use when the work is done and the next job is to ship it without dropping evidence, monitoring, or branch-safety discipline."
metadata:
  argument-hint: "[blank to ship current branch, or pass plan:<path>, pr:<url>, or refresh-description]"
---

# Ship The Work

`$flywheel:ship` closes the Flywheel loop between "code exists" and "a clean PR or
published branch exists."

It is the finishing workflow for:

- staged or unstaged work that needs commits
- committed work that needs pushing
- a feature branch that needs a PR
- an existing PR whose description should be refreshed

Use it after `$flywheel:work` or after `$flywheel:review` reaches a clean enough verdict.
For runtime-risky changes, use it after `$flywheel:rollout` sets the activation,
validation, and rollback posture.

## Interaction Method

Use the platform's blocking question tool when available. Otherwise present
numbered options in chat and wait for the user's reply.

Ask one question at a time. When multiple shipping paths are viable, present a
short predicted option list with the recommended option first and `Custom`
last.

## Input

<shipping_input> #$ARGUMENTS </shipping_input>

Parse optional tokens before interpreting any remainder:

- `plan:<path>` - use this plan as shipping context and update it to
  `status: completed` when appropriate
- `pr:<url>` - target this existing PR explicitly
- `refresh-description` - update the current PR description without changing
  branch or commit state

## Reference Loading Map

Do not preload every support file. Load only what the current phase needs:

- read `references/pr-body-template.md` only when composing or refreshing the
  PR body
- read `references/evidence-bundle.md` when a shared evidence bundle exists or
  when a proof-producing stage already created reusable evidence for this
  branch
- read `../rollout/references/rollout-template.md` only when a rollout
  artifact already exists and its staged-release summary should be reflected in
  the PR story
- read `../observability/references/service-readiness-matrix.md` only when the
  change is runtime-risky and the monitoring or validation section needs a
  grounded readiness frame
- read `.flywheel/config.local.yaml` when present for repo-local ship gates
  such as browser proof, review-before-ship, and runtime validation

## Core Principles

1. **Ship from repo truth** - branch status, open PR state, test evidence, and
   review outcomes outrank memory or optimism.
2. **Commit honestly** - prefer `$flywheel:commit` for each logical unit
   being committed. If the helper is unavailable, draft the conventional header
   directly and ask before marking breaking changes.
3. **Operational validation is mandatory** - every PR gets a
   `Post-Deploy Monitoring & Validation` section, even if the answer is a
   no-impact rationale.
4. **Preserve branch safety** - do not commit directly to the default branch
   without explicit user approval.
5. **Prefer one coherent story** - the PR description should summarize what
   changed, how it was tested, and how to know it is healthy.

## Workflow

### Phase 1: Gather Shipping Context

Collect the smallest useful context in one pass:

```bash
printf '=== STATUS ===\n'; git status --short --branch
printf '\n=== BRANCH ===\n'; git branch --show-current
printf '\n=== DIFF ===\n'; git diff HEAD
printf '\n=== LOG ===\n'; git log --oneline -10
printf '\n=== DEFAULT_BRANCH ===\n'; git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null || echo 'DEFAULT_BRANCH_UNRESOLVED'
printf '\n=== PR_CHECK ===\n'; gh pr view --json url,title,state,baseRefName,headRefName 2>/dev/null || echo 'NO_OPEN_PR'
```

If GitHub CLI is unavailable or unauthenticated, continue with local git
shipping only and report that PR creation or refresh is blocked.

If `.flywheel/config.local.yaml` exists, read only the shipping-relevant keys
before classifying the path:

- `review.require_review_before_ship`
- `browser.require_proof_for_browser_visible_changes`
- `shipping.require_browser_proof_for_browser_visible_changes`
- `runtime.require_operational_validation_for_runtime_changes`

If `.context/flywheel/evidence/` exists, inspect only the newest `summary.md`
that clearly matches the current branch, plan, or task. Treat the shared
bundle as the primary reusable proof source for shipping.

If `.context/flywheel/rollout/` exists, inspect only the newest `rollout.md`
that clearly matches the current branch, plan, or task. Treat it as the source
of truth for activation sequence, validation window, and rollback trigger.

### Phase 2: Classify The Shipping Path

Choose the path from branch truth:

- **Description refresh** - user asked for `refresh-description` or only wants
  to update the existing PR text
- **Full ship** - branch has uncommitted work, unpushed commits, or no open PR
- **Push only** - branch is committed but not published
- **PR creation** - branch is published and no open PR exists
- **PR refresh** - branch already has an open PR and the user wants the
  description updated after new work landed

If the current branch is the default branch and shipping would create commits,
create a feature branch first unless the user explicitly approves committing on
the default branch.

If a clean isolated checkout is preferable before shipping, use `$flywheel:worktree`
instead of switching the shared checkout ad hoc.

### Phase 3: Readiness Gate

Before committing or creating a PR, confirm:

- tests and linting were addressed, using the repo-grounded commands already
  discovered during `$flywheel:work` or local setup
- `$flywheel:review` already ran, or the user explicitly wants to ship without it
- if local policy requires review before ship, stop instead of bypassing that
  gate when `$flywheel:review` has not run
- if `$flywheel:review` ran, the latest verdict is `Ready to merge` or the remaining
  findings were explicitly accepted by the user
- if unresolved `P0` or `P1` gated or manual findings remain, stop instead of
  continuing into commit or PR creation
- browser-visible changes have fresh acceptance proof from `$flywheel:browser-test`,
  repo-native browser tests, or an explicit user decision to ship without that
  proof
- if the change is runtime-risky and activation sequence, validation window, or
  rollback trigger are still unresolved, stop and route through `$flywheel:rollout`
  before continuing
- the change's runtime impact has either:
  - concrete monitoring and validation notes, or
  - a clear no-impact rationale
- if local policy requires explicit operational validation for runtime changes,
  that validation is present before continuing

If the branch is not actually ready, stop and say what remains.

### Phase 4: Build The Shipping Payload

Assemble the payload for commit, push, and PR steps from:

- current diff and recent commits
- plan summary and key decisions when `plan:<path>` is available
- testing notes
- review outcomes and residual caveats
- rollout artifact contents when present
- shared evidence bundle contents when present
- operational validation notes

When the change is runtime-risky, read
`../observability/references/service-readiness-matrix.md` so the PR's
monitoring section covers the real contract, state, rollout, and recovery
surface instead of generic "watch the logs" language.

If a shared evidence bundle exists, prefer it first. Include only items marked
`clean` or `redacted` with `PR Use: yes`. Turn `summary-only` items into short
prose instead of pasting raw artifacts. Keep `local-only` items out of the PR
body.

If the change affects observable behavior and the repo or host already exposes
evidence such as screenshots, CLI transcripts, request examples, generated
artifacts, or a shared evidence bundle, offer three choices:

1. **Include existing evidence** (recommended when a clean or redacted bundle
   entry already exists)
2. **Ship without evidence**
3. **Custom**

Do not block shipping on evidence capture when the repo has no practical
capture path.

Only include evidence in the PR description when you are above 90% confident it
contains no secrets and no meaningful PII. Do not paste raw auth headers,
cookies, tokens, passwords, or unredacted sensitive request or response bodies
into the PR body. When the raw artifact is too sensitive but the shape matters,
prefer a redacted or dummy-substituted example.

When a shared evidence bundle exists, cite the bundle-backed summary or the
sanitized artifact path rather than re-explaining the proof from scratch.

When a rollout artifact exists, reuse its activation sequence, validation
window, owner, and rollback trigger instead of rebuilding those decisions from
memory during PR preparation.

If the change is browser-visible and fresh proof is still missing, route
through `$flywheel:browser-test` before final PR preparation unless the user
explicitly wants to continue without it.

Read `references/pr-body-template.md` and fill it with concrete repo facts.

### Phase 5: Commit

If the worktree is dirty:

1. identify one logical unit at a time
2. stage only the files for that unit
3. choose a conventional commit message
4. prefer `$flywheel:commit` when available; otherwise draft the header
   directly as `<type>(scope): summary`
5. commit with the selected header, plus body or footers when useful

If the most honest message would be breaking, ask before using `!` or
`BREAKING CHANGE:`.

Default to one commit unless there are clearly separate concerns worth splitting.

### Phase 6: Push

Publish the branch safely:

```bash
git push --set-upstream origin HEAD
```

If the branch already has an upstream, use `git push`.

### Phase 7: Create Or Refresh The PR

If GitHub CLI is available:

- **No open PR** -> create one with the assembled title and body
- **Existing open PR + refresh requested** -> update the title and body
- **Existing open PR + no refresh requested** -> report the PR URL and stop

Required PR body sections:

- Summary
- Testing
- Post-Deploy Monitoring & Validation
- Evidence, only when present

If there is truly no runtime impact, the monitoring section must still contain:

```text
No additional operational monitoring required.
Reason: <one line grounded in the actual change>
```

### Phase 8: Close The Loop

When `plan:<path>` is available and the plan frontmatter contains
`status: active`, update it to `status: completed`.

Then report:

1. what shipped
2. the branch and PR URL when available
3. any residual follow-up
4. whether `$flywheel:spin` should capture a durable lesson

If the branch shipped from a `.worktrees/` checkout and no longer needs that
checkout, suggest `$flywheel:worktree cleanup <branch>` as the cleanup path.

---

## Included References

### Evidence Bundle

@./references/evidence-bundle.md

### PR Body Template

@./references/pr-body-template.md

### Rollout Template

@../rollout/references/rollout-template.md
