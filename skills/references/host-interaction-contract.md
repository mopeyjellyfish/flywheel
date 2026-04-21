# Host Interaction Contract

Flywheel is authored once for multiple hosts. Keep the workflow shared and let
the host provide the UI surface.

## Host Tool Map

- Claude Code: use `AskUserQuestion` for structured question flows.
- Codex: use `request_user_input` when the active Codex runtime exposes it.
  Some Codex collaboration modes do not expose this tool; in those cases ask a
  concise plain-text choice question in chat instead of pretending the tool is
  available.
- OpenCode: use `question` for structured question flows.

## Structured Choice Rules

- Use the exact host question tool named above when that tool is available.
- Do not ask the user to reply with raw `1`, `2`, or `3` when the host already
  offers a choice surface.
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
- If a host surface truly lacks a freeform path and one is still needed, keep
  exactly one freeform-compatible choice last.

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
