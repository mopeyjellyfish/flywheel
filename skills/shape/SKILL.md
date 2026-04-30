---
name: shape
description: "Shape work before implementation. Use to choose ideation, brainstorming, planning, or plan-deepening before work."
metadata:
  argument-hint: "[idea, problem, requirements doc, plan path, or shaping focus]"
---

# Shape Work Before Execution

Use this skill as the public shaping entrypoint for Flywheel's compact loop:

```text
shape -> work -> review -> optional spin -> commit
```

Invoke it as `fw:shape` using the current host's native syntax:

- Codex: `$fw:shape`
- Claude Code: `/fw:shape`

`fw:shape` is the first main workflow stage. It decides which shaping mode is
needed, then runs or hands off to the smallest mode that can produce the next
useful artifact before implementation.

## Shaping Modes

- `fw:ideate` when the user wants a better next bet, backlog shaping, or a
  ranked shortlist before choosing one direction.
- `fw:brainstorm` when one direction exists but behavior, scope, user-facing
  decisions, or success criteria are still unclear.
- `fw:plan` when the intended behavior is clear enough to design execution.
- `fw:deepen` when a reviewed plan already exists and needs more repo research,
  test posture, rollout posture, or architecture detail before work starts.

Do not implement code inside `fw:shape`. The stage ends when it has produced or
selected the artifact that `fw:work` can execute from.

When closing a material shaping pass, read `../references/workflow-gates.md`
and use its `Shape-Ready` gate plus canonical handoff card.

## Routing Rules

- If the user asks what to improve, asks for next bets, or presents an open area
  rather than one chosen direction, load `../ideate/SKILL.md`.
- If the user has one idea, request, or problem but the behavior or scope still
  needs clarification, load `../brainstorm/SKILL.md`.
- If the user points at a requirements doc, clear feature description, bug
  report, or concrete rough task and wants execution design, load
  `../plan/SKILL.md`. When the input is an existing spec or requirements doc
  whose review state is unclear, the plan stage should offer source document
  review before drafting the implementation plan.
- If the user points at an existing plan and asks to harden, deepen, strengthen,
  or make it more execution-ready, load `../deepen/SKILL.md`.
- If the user explicitly invokes one shaping mode, honor that mode directly
  unless the input is clearly incompatible with that mode.

When the best mode is obvious, state the selected mode briefly and continue
with it. When two shaping modes would produce materially different artifacts,
ask one focused challenge question using the host interaction contract in
`../references/host-interaction-contract.md`.

## Output Contract

End with one of these outcomes:

- ranked shortlist from `fw:ideate`, with the selected idea moving to
  `fw:brainstorm`
- reviewed requirements doc or requirements plan from `fw:brainstorm`, with a
  user choice to proceed to `fw:plan` or run document review first
- reviewed technical implementation plan from `fw:plan`, with a host-question
  user choice to address review findings, deepen the plan, or confirm moving
  to `fw:work`
- strengthened reviewed plan from `fw:deepen`, with a host-question user
  choice between another deepen pass, pausing, and confirming `fw:work`

Always name the next main stage as `fw:work` once the shaping artifact is ready.
Do not cross from shaping into `fw:work` until the user confirms through the
host question tool when that tool is available, or gives an explicit same-turn
implementation instruction.
When a shaping mode produced or selected a durable artifact, close with the
canonical handoff fields from `../references/workflow-gates.md`: Stage,
Artifact, Ready, Open decisions, Evidence, and Next.

## Example Prompts

- "Use `fw:shape` to turn this rough feature idea into the right next artifact."
- "Use `fw:shape` on this requirements doc and decide whether it needs planning
  or deeper requirements work."
- "Use `fw:shape` to decide whether this plan is ready for `fw:work`."
