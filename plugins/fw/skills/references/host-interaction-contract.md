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

- A Flywheel choice surface means a blocking tool call, not a markdown menu in
  chat. Call the exact host question tool named above when that tool is
  available.
- Do not merely say "I would ask" or render options in prose before attempting
  the tool call.
- Ask one question at a time.
- Default to single-select.
- Use multi-select only for compatible sets such as goals, constraints,
  non-goals, or success criteria that can coexist.
- Do not use multi-select for mutually exclusive decision forks.
- Claude Code supports multi-select through `AskUserQuestion`'s `multiSelect`
  field. Codex `request_user_input` is currently a mutually-exclusive choice
  surface; when true multi-select is needed in Codex, ask a short sequence of
  single-select questions or use the fallback chat protocol and wait.
- OpenCode can submit multiple questions together, but Flywheel should still
  ask one question at a time unless the workflow explicitly benefits from a
  bundled answer set.
- Default to `2-3` portable, recommended-first labels. This fits Codex's
  explicit choice surface and stays compact in Claude Code.
- Use a fourth explicit option only when the active host question schema
  supports it. On Codex, compress the least important action into nearby prose
  or the native freeform path instead of overfilling the tool call.
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

## Host Choice Shape

- Claude Code: call `AskUserQuestion` with one question and a small
  single-select option set. If the schema is absent, load it through
  `ToolSearch` with `select:AskUserQuestion` before falling back.
- Codex: call `request_user_input` with one question item, a stable
  `snake_case` id, a short header, and `2-3` mutually exclusive options. Put the
  recommended option first and do not add a manual `Other` option; Codex
  provides its own freeform path when the tool is available.
- Fallback chat: use the same labels and descriptions, number the options only
  because the structured tool is unavailable, and wait for the reply before
  continuing.

### Claude Code `AskUserQuestion` Shape

When Claude Code needs a choice, trigger the tool with this shape:

```json
{
  "questions": [
    {
      "question": "Review the source document before planning?",
      "header": "Review",
      "options": [
        {
          "label": "Review first",
          "description": "Check simplification, feasibility, scope, and supportability before planning."
        },
        {
          "label": "Continue planning",
          "description": "Draft the plan now and capture uncertainty as assumptions."
        }
      ],
      "multiSelect": false
    }
  ]
}
```

Use `multiSelect: true` only for compatible sets. For normal Flywheel route
choices, keep it `false`.

### Codex `request_user_input` Shape

When Codex exposes `request_user_input`, trigger the tool with this shape:

```json
{
  "questions": [
    {
      "id": "review_before_plan",
      "header": "Review",
      "question": "Review the source document before planning?",
      "options": [
        {
          "label": "Review first (Recommended)",
          "description": "Check simplification, feasibility, scope, and supportability before planning."
        },
        {
          "label": "Continue planning",
          "description": "Draft the plan now and capture uncertainty as assumptions."
        }
      ]
    }
  ]
}
```

Do not add an explicit `Other` option for Codex; the host supplies the freeform
path when available. If the tool is not exposed in the current Codex mode, use
the fallback chat protocol and wait.

### Skill Frontmatter

Do not rely on Claude Code `allowed-tools` frontmatter to make questions work.
It pre-approves listed tools when the skill is active; it does not replace the
model's need to call `AskUserQuestion`, and it is not portable to Codex.

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
