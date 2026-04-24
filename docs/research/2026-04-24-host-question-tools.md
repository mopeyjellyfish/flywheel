# Host Question Tools Research

Date: 2026-04-24

## Topic Frame

Flywheel needs to ask bounded workflow questions at shape, plan, review, commit,
and spin boundaries. The product contract should trigger host-native question
tools when available, not render markdown menus first.

## Ranked Findings

1. **Claude Code uses `AskUserQuestion` for clarifying questions** — Fact
   - Why it matters: Flywheel skills should instruct Claude Code to call
     `AskUserQuestion` directly for structured choices.
   - Confidence: High.
   - Sources: Claude Code "Handle approvals and user input" docs.

2. **Claude `AskUserQuestion` supports multiple questions, 2-4 options, and
   `multiSelect`** — Fact
   - Why it matters: Claude can support genuine multi-select for compatible
     sets such as goals, constraints, and success criteria.
   - Confidence: High.
   - Sources: Claude Code "Handle approvals and user input" docs.

3. **Codex `request_user_input` is narrower in the current runtime** — Fact
   - Why it matters: Flywheel should default to 2-3 portable options and avoid
     assuming Codex supports Claude-style `multiSelect`.
   - Confidence: Medium-high, based on the active Codex tool schema exposed in
     this session.
   - Sources: Current Codex runtime schema in this development session.

4. **Claude `allowed-tools` does not replace the tool call** — Fact
   - Why it matters: adding `allowed-tools: AskUserQuestion` is not the fix for
     weak question UX. It pre-approves tools for a skill in Claude Code; the
     model must still call `AskUserQuestion`.
   - Confidence: High.
   - Sources: Claude Code skills docs.

## Decision Guidance

Use a shared Flywheel contract:

- call `AskUserQuestion` in Claude Code when available
- call `request_user_input` in Codex when available
- keep normal workflow forks single-select
- use Claude `multiSelect` only for compatible sets
- use sequential Codex questions or the chat fallback for genuine multi-select
- render markdown or numbered options only after the host question tool is
  unavailable or errors

## Source Notes

- Claude Code user input docs:
  https://code.claude.com/docs/en/agent-sdk/user-input
- Claude Code skills docs:
  https://code.claude.com/docs/en/skills

## Uncertainty

No public OpenAI developer documentation found for `request_user_input` during
this pass. The Codex guidance should be rechecked against the active runtime
schema when Codex changes question-tool support.
