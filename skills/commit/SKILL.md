---
name: commit
description: "Draft Conventional Commit messages for workflow-driven and direct commit requests. Use when choosing a commit header, body, or footer, especially before `git commit`, a host commit helper, or a host PR creation workflow."
metadata:
  argument-hint: "[Summary of the change or blank to infer from current work context]"
---

# Commit

Use this skill whenever the agent is about to create, suggest, or validate a
commit message.

This skill is the shared commit-message helper for Flywheel workflows and
direct commit requests. Load it before:

- running `git commit`
- invoking a host commit helper
- invoking a host push or PR creation helper
- proposing commit titles during review or shipping

Base the message on the actual logical unit being committed, not on the whole
branch or PR.

## Message Shape

Use Conventional Commits v1.0.0 structure:

```text
<type>[optional scope]: <description>

[optional body]
[optional footer(s)]
```

Prefer these common types when they fit the actual change:

- `feat` for a new user-facing or developer-facing capability
- `fix` for a bug fix or regression fix
- `refactor` for internal restructuring without behavior change
- `perf` for a measured or clearly intended performance improvement
- `docs` for documentation-only changes
- `test` for tests-only changes
- `build` for build system or dependency build tooling changes
- `ci` for CI workflow changes
- `chore` for repo maintenance that is neither behavior nor API meaningful
- `revert` for reverting an earlier change

Use `feat` and `fix` when they are honest. Do not hide a real feature in
`chore`, and do not label refactoring as `fix` unless it actually fixes a bug.

## Workflow

1. Identify the smallest honest logical unit being committed.
2. Choose the type that best matches the user-visible or caller-visible effect.
3. Add a scope only when it helps:
   - use a short noun such as a package, module, feature area, or subsystem
   - omit the scope when the commit is already clear without it
4. Write a short description:
   - imperative when natural
   - specific about the outcome
   - no trailing period
5. Add a body only when the why, migration context, or behavior change needs it.
6. Add footers only when they carry real value, such as:
   - `BREAKING CHANGE: ...`
   - `Refs: #123`
   - other trailer-style metadata already used by the repo

## Breaking Changes

If the most honest commit would mark a breaking change, **pause and ask the
user before using** either:

- `!` in the header, such as `feat(api)!: ...`
- a `BREAKING CHANGE:` footer

Use a short direct question that names the proposed header and the breaking
reason.

Example:

```text
This commit looks breaking for callers because it changes the config key shape.
Do you want me to mark it as a breaking change with `feat(config)!` and a
`BREAKING CHANGE:` footer?
```

Rules:

- Do not add `!` or `BREAKING CHANGE:` without explicit user approval.
- If the user approves, mark the commit as breaking and include a clear breaking
  description.
- If the user declines, use the best non-breaking conventional message that
  still truthfully describes the unit.

## Multiple Concerns

If one proposed commit message would need to describe multiple unrelated
changes, prefer splitting the work into multiple commits when practical.

If the work must land in one commit, choose the type for the dominant behavioral
change and explain the rest in the body.

## Output

Return:

1. the proposed commit header
2. an optional body when useful
3. optional footers when useful
4. a one-line rationale for the chosen type if the choice is not obvious

## Reference

Primary source:

- https://www.conventionalcommits.org/en/v1.0.0/
