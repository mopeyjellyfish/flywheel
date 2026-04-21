---
name: worktree
description: "Manage isolated git worktrees for Flywheel execution, review, and parallel development. Use when work should happen on a new branch without polluting the current checkout, when a review target should be inspected in isolation, or when multiple branches must stay active at once."
metadata:
  argument-hint: "[blank for help, or pass create <branch> [base], list, path <branch>, copy-env <branch>, or cleanup <branch>]"
---

# Manage Worktrees

`$flywheel:worktree` is Flywheel's isolated-workspace manager.

Use it when the right move is not "switch branches in place", but "open a
clean parallel checkout with the branch, template env files, and ignore hygiene
already handled."

## Rule

Always use the bundled manager script instead of typing raw `git worktree`
commands by hand.

Script path:

```text
<repo-root>/skills/worktree/scripts/worktree-manager.sh
```

## Why

The manager script handles the Flywheel defaults that raw `git worktree add`
does not:

- keeps worktrees under `.worktrees/`
- ensures `.worktrees/` is ignored
- copies top-level template env files by default
- warns when real `.env*` files exist without copying them automatically
- prints exact follow-up commands for entering or cleaning up the worktree
- keeps branch naming and base-branch selection consistent

## Interaction Method

Use the platform's blocking question tool when available. Otherwise present
numbered options in chat and wait for the user's reply.

Prefer a concise choice surface when the user has not already named an action:

1. **Create isolated worktree** (recommended)
2. **List current worktrees**
3. **Show path for an existing worktree**
4. **Clean up a finished worktree**
5. **Custom**

## Workflow

### Phase 1: Choose The Action

Interpret the input or user intent as one of:

- `create <branch> [base]`
- `list`
- `path <branch>`
- `copy-env <branch>`
- `cleanup <branch>`

If the user only says they want isolated work, infer `create`.

### Phase 2: Create Or Manage Through The Script

Run the manager script directly:

```bash
bash "$(git rev-parse --show-toplevel)/skills/worktree/scripts/worktree-manager.sh" <command> ...
```

#### Create

Use:

```bash
bash "$(git rev-parse --show-toplevel)/skills/worktree/scripts/worktree-manager.sh" create <branch-name> [base-branch]
```

Creation rules:

- derive a meaningful branch name from the work, not an opaque random name
- default the base branch from repo truth when the caller does not specify one
- prefer a worktree over in-place branch switching when the current checkout
  already has unrelated work or when review should stay isolated

#### List

Use:

```bash
bash "$(git rev-parse --show-toplevel)/skills/worktree/scripts/worktree-manager.sh" list
```

#### Show Path

Use:

```bash
bash "$(git rev-parse --show-toplevel)/skills/worktree/scripts/worktree-manager.sh" path <branch-name>
```

The script returns the worktree path and a `cd` command suggestion.

#### Copy Env Files

Use:

```bash
bash "$(git rev-parse --show-toplevel)/skills/worktree/scripts/worktree-manager.sh" copy-env <branch-name>
```

This is the explicit escape hatch for copying real top-level `.env` and
`.env.*` files when that worktree genuinely needs local secrets.

If the repo has a durable local preference recorded in
`.flywheel/config.local.yaml`, honor it by setting
`FW_WORKTREE_ENV_COPY_MODE=none`, `templates-only`, or `real-files` when
invoking the script. The default remains `templates-only`.

#### Cleanup

Use:

```bash
bash "$(git rev-parse --show-toplevel)/skills/worktree/scripts/worktree-manager.sh" cleanup <branch-name>
```

Cleanup is intentionally conservative:

- it refuses to remove the current worktree
- it refuses to remove a dirty worktree
- it removes the worktree path first
- it deletes the local branch only when that branch is already merged into the
  detected default branch

## Env File Policy

Flywheel's default worktree posture is:

- copy templates and examples automatically
- never copy real secret-bearing env files silently
- warn when real env files exist so the user can opt in deliberately
- allow an explicit local override through `FW_WORKTREE_ENV_COPY_MODE` when the
  repo truly needs a different default

Use `copy-env` only when the worktree actually needs those local secrets.
Review-only and documentation-only worktrees should usually not copy them.

## Integration Rules

- `$flywheel:work` should recommend `$flywheel:worktree` whenever work starts from the
  default branch and isolation is preferable.
- `$flywheel:review` should prefer `$flywheel:worktree` when a PR or branch must be
  reviewed without switching the shared checkout.
- `$flywheel:commit` may suggest `$flywheel:worktree cleanup <branch>` after merge or after a
  shipped branch no longer needs an isolated checkout.

## Output Contract

Return:

1. the command run
2. the resulting worktree path or status
3. any env-file warning or safety condition that blocked the operation
4. the next concrete command, usually `cd <path>`, `copy-env <branch>`, or a
   cleanup follow-up
