---
name: commit
description: "Finish the current branch cleanly: validate readiness, plan logical commit boundaries, create commit(s), push safely, and create or refresh a PR with testing and operational validation notes. Use when the work is done and the next job is to finish the branch without dropping evidence, monitoring, or branch-safety discipline."
metadata:
  argument-hint: "[blank to finish current branch, or pass local-only, plan:<path>, pr:<url>, or refresh-description]"
---

# Commit The Work

`$flywheel:commit` closes Flywheel's compact project loop between "the repo
change is ready enough to finish" and "a clean local branch or PR exists."

It is the finishing workflow for:

- staged or unstaged work that needs commit planning and commit creation
- committed work that needs pushing
- a feature branch that needs a PR
- an existing PR whose description should be refreshed
- a branch that surfaced durable lessons worth offering to `spin`

Use it after `$flywheel:work` or after `$flywheel:review` reaches a clean
enough verdict. For runtime-risky changes, use it after `$flywheel:rollout`
sets the activation, validation, and rollback posture. If the user invokes
`$flywheel:commit` directly, treat that as permission to run the finish-stage
workflow rather than as a reason to reject the request because earlier stages
were skipped.

## Interaction Method

Use the platform's blocking question tool when available. Otherwise present
numbered options in chat and wait for the user's reply.

Ask one question at a time. When multiple finish paths are viable, present a
short predicted option list with the recommended option first and `Custom`
last.

## Input

<commit_input> #$ARGUMENTS </commit_input>

Parse optional tokens before interpreting any remainder:

- `local-only` - create local commit(s) but do not push or create or refresh a
  PR
- `plan:<path>` - use this plan as finish-stage context and update it to
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
- read `.flywheel/config.local.yaml` when present for repo-local commit gates
  such as browser proof, review-before-commit, and runtime validation

## Core Principles

1. **Finish from repo truth** - branch status, open PR state, test evidence,
   and review outcomes outrank memory or optimism.
2. **Commit honestly** - use `$flywheel:commit-message` for each logical unit
   being committed. If the helper is unavailable, draft the conventional header
   directly and ask before marking breaking changes.
3. **Prefer one coherent finish flow** - local commits, push, PR state, and
   operational validation belong to one remembered command.
4. **Preview multiple commits before execution** - when the diff should split,
   show a short commit plan first so the grouping is reviewable.
5. **Operational validation is mandatory** - every PR gets a
   `Post-Deploy Monitoring & Validation` section, even if the answer is a
   no-impact rationale.
6. **Preserve branch safety** - do not commit directly to the default branch
   without explicit user approval.
7. **Offer spin only when it earns its keep** - after the branch is finished,
   suggest knowledge capture only when the work surfaced durable project value.

## Workflow

### Phase 1: Gather Finish Context

Collect the smallest useful context in one pass:

```bash
printf '=== STATUS ===\n'; git status --short --branch
printf '\n=== BRANCH ===\n'; git branch --show-current
printf '\n=== DIFF ===\n'; git diff HEAD
printf '\n=== LOG ===\n'; git log --oneline -10
printf '\n=== DEFAULT_BRANCH ===\n'; git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null || echo 'DEFAULT_BRANCH_UNRESOLVED'
printf '\n=== PR_CHECK ===\n'; gh pr view --json url,title,state,baseRefName,headRefName 2>/dev/null || echo 'NO_OPEN_PR'
```

If GitHub CLI is unavailable or unauthenticated, continue with local git-only
finish behavior and report that PR creation or refresh is blocked.

If `.flywheel/config.local.yaml` exists, read only the finish-stage-relevant
keys before classifying the path:

- `review.require_review_before_commit`
- `browser.require_proof_for_browser_visible_changes`
- `commit.require_browser_proof_for_browser_visible_changes`
- `runtime.require_operational_validation_for_runtime_changes`

If `.context/flywheel/evidence/` exists, inspect only the newest `summary.md`
that clearly matches the current branch, plan, or task. Treat the shared
bundle as the primary reusable proof source for finishing.

If `.context/flywheel/rollout/` exists, inspect only the newest `rollout.md`
that clearly matches the current branch, plan, or task. Treat it as the source
of truth for activation sequence, validation window, and rollback trigger.

### Phase 2: Classify The Finish Path

Choose the path from branch truth:

- **Description refresh** - user asked for `refresh-description` or only wants
  to update the existing PR text
- **Full finish** - branch has uncommitted work, unpushed commits, or no open PR
- **Local-only finish** - user explicitly asked for `local-only`
- **Push only** - branch is committed but not published
- **PR creation** - branch is published and no open PR exists
- **PR refresh** - branch already has an open PR and the user wants the
  description updated after new work landed

If the current branch is the default branch and finishing would create commits,
create a feature branch first unless the user explicitly approves committing on
the default branch.

If a clean isolated checkout is preferable before finishing, use
`$flywheel:worktree` instead of switching the shared checkout ad hoc.

### Phase 3: Run Missing Readiness Checks

Before creating commits or a PR, confirm:

- tests and linting were addressed, using the repo-grounded commands already
  discovered during `$flywheel:work` or local setup
- browser-visible changes have fresh acceptance proof from
  `$flywheel:browser-test`, repo-native browser tests, or an explicit user
  decision to continue without that proof
- if the change is runtime-risky and activation sequence, validation window, or
  rollback trigger are still unresolved, stop and route through
  `$flywheel:rollout` before continuing
- the change's runtime impact has either:
  - concrete monitoring and validation notes, or
  - a clear no-impact rationale
- if local policy requires explicit operational validation for runtime changes,
  that validation is present before continuing

Review handling:

- if `$flywheel:review` already ran and the latest verdict is clean enough,
  reuse it
- if review has not run and finish-stage confidence depends on it, run
  `$flywheel:review` now instead of blocking only because the user skipped it
- if unresolved `P0` or `P1` gated or manual findings remain after review, stop
  instead of continuing into commit or PR creation
- if local policy requires review before commit, stop only when the review pass
  still leaves blocking findings unresolved

If the branch is not actually ready, stop and say what remains.

### Phase 4: Build The Finish Payload

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
2. **Finish without evidence**
3. **Custom**

Do not block finishing on evidence capture when the repo has no practical
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

### Phase 5: Plan And Create Commit(s)

If the worktree is dirty:

1. identify one logical unit at a time
2. decide whether the diff should stay as one honest commit or split into
   multiple logical commits
3. if multiple commits are warranted, show a short commit plan before
   execution with:
   - the proposed header
   - the goal of the unit
   - the reason it is separate
4. if the diff is too entangled for a clean split, say so and prefer one
   honest commit
5. stage only the files for each chosen unit
6. use `$flywheel:commit-message` for each conventional header, plus body or
   footers when useful
7. commit the unit before moving to the next one

If the most honest message would be breaking, ask before using `!` or
`BREAKING CHANGE:`.

Default to one commit unless there are clearly separate concerns worth
splitting.

### Phase 6: Push

If the path is `local-only`, skip this phase and say so explicitly.

Otherwise publish the branch safely:

```bash
git push --set-upstream origin HEAD
```

If the branch already has an upstream, use `git push`.

### Phase 7: Create Or Refresh The PR

If the path is `local-only`, skip this phase and report that no PR work was
requested.

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

Before the final report, infer at most **3** candidate spin lessons from:

- execution evidence such as review findings, validation work, or non-obvious
  fixes
- repo changes that altered setup, CLI, API, config, docs, or workflow
  contracts
- answers and clarified preferences surfaced during `ideate`, `brainstorm`, or
  `plan` when they materially changed the repo workflow or project direction
- user corrections from this session that materially changed how Flywheel
  should behave for project work

Only keep candidates that look durable and project-specific. If nothing
non-trivial surfaced, end cleanly without forcing a spin offer.

Then report:

1. what finished
2. the branch and PR URL when available
3. any residual follow-up
4. whether a bounded `$flywheel:spin` offer is warranted

If one or more candidates are worth preserving, present a small choice surface:

1. **Skip**
2. **Quick spin**
3. **Full spin**

Recommend the strongest candidate explicitly. If the user wants to continue,
launch `$flywheel:spin` with the selected candidate summary instead of calling
it blank.

If the branch finished from a `.worktrees/` checkout and no longer needs that
checkout, suggest `$flywheel:worktree cleanup <branch>` as the cleanup path.

---

## Included References

### Evidence Bundle

@./references/evidence-bundle.md

### PR Body Template

@./references/pr-body-template.md

### Rollout Template

@../rollout/references/rollout-template.md
