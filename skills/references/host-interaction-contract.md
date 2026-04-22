# Host Interaction Contract

Flywheel is authored once for multiple hosts. Keep the workflow shared and let
the host provide the UI surface.

## Host Tool Map

- Claude Code: use `AskUserQuestion` for structured question flows. If its
  schema is not already loaded, load it through `ToolSearch` with
  `select:AskUserQuestion` first. Deferred schema load is not a valid reason to
  fall back to plain text.
- Codex: use `request_user_input` when the active Codex runtime exposes it.
  Some Codex modes do not expose this tool. If it is unavailable or the call
  errors, fall back to numbered options in chat and wait for the user's reply.
- Gemini CLI: use `ask_user` for structured question flows when available.
- OpenCode: use `question` for structured question flows when available.

## Structured Choice Rules

- Use the exact host question tool named above when that tool is available.
- Ask one question at a time.
- Default to single-select.
- Use multi-select only for compatible sets such as goals, constraints,
  non-goals, or success criteria that can coexist.
- Do not use multi-select for mutually exclusive decision forks.
- OpenCode can submit multiple questions together, but Flywheel should still
  ask one question at a time unless the workflow explicitly benefits from a
  bundled answer set.
- When the likely answer space is predictable, present `2-4` recommended-first
  labels.
- Rely on the host's native freeform final path when it exists instead of
  adding a redundant manual `Custom` branch.
- Do not ask the user to reply with raw `1`, `2`, or `3` when the host already
  offers a blocking choice surface.
- If no blocking question tool exists in the active harness, or the tool call
  errors, present numbered options in chat and wait for the user's reply.
  Never silently skip the question.
- Narrow exception for legitimate option overflow: if there are `5+` genuinely
  relevant options and cutting, merging, or moving one into nearby prose would
  lose real user choice, use a numbered chat list instead of trimming the menu
  to fit the normal option cap. Include a freeform hint such as "Pick a number
  or describe what you want."
- If a host surface truly lacks a freeform path and one is still needed, keep
  exactly one freeform-compatible choice last.

## Task Tracking Rules

- When a workflow spans multiple material steps, create a host task list before
  substantive tool work begins.
- Known task-tracking equivalents:
  - Claude Code: `TaskCreate`, `TaskUpdate`, `TaskList`
  - Codex: `update_plan`
- Use one task per material tool-driven step or phase, such as repo scan,
  editing, validation, synthesis, or handoff. Do not create one task per
  literal shell subcommand.
- When a durable checklist artifact already exists, mirror that artifact
  instead of inventing a competing breakdown. For `docs/plans/*-plan.md`,
  default to one host task per remaining implementation unit plus any extra
  cross-cutting quality-gate tasks not already represented in the plan.
- Update task state as soon as a step completes, blocks, or materially expands.
- Keep status surfaces honest: use the host task tool for `in_progress`,
  `blocked`, and sequencing state, and flip document checkboxes only when the
  underlying unit is actually complete.
- If the host does not expose a dedicated task tool, keep a short visible
  checklist in chat and keep it current.
- Do not reference legacy `TodoWrite` or `TodoRead`.

## Delegation Rules

- Default to inline execution, analysis, or review.
- Use delegated or parallel agents only when the host supports them, current
  policy allows them, and the user explicitly wants that speedup or the active
  workflow already selected delegation.
- Parallel work must be bounded and independent.
- Keep shared-write, tightly coupled, or order-sensitive work serial.
- When parallelism is unavailable or not worth the overhead, fall back cleanly
  to inline or serial execution without changing the visible Flywheel stages.

## Hook Rules

- Hooks are for risky-edge governance, not constant workflow nagging.
- Deny clearly dangerous destructive actions.
- Use confirm gates for procedural checkpoints such as commit or push when the
  host can honestly support them.
- If a host cannot enforce the intended confirm gate, state the limitation and
  fall back to the strongest honest warning or reminder the host supports.

Platform note, current as of April 2026 and subject to change:

- `AskUserQuestion` is currently deferred in Claude Code.
- `request_user_input` in Codex is currently unavailable in some non-plan
  modes.

Re-verify these constraints before preserving a workaround indefinitely.
