---
date: 2026-04-21
topic: flywheel-cross-host-interaction-and-hook-governance
---

# Flywheel Cross-Host Interaction And Hook Governance

## Problem Frame

Flywheel already has a shared workflow and a growing cross-host packaging story
for Codex and Claude Code. The next gap is not "add more skills." The gap is
making the existing skills feel fast, structured, and safe across both hosts
without duplicating the workflow.

Three problems are now visible:

1. some skills still describe fallback numbered chat choices instead of
   treating the host's structured question UI as the primary interaction
   surface
2. Flywheel already has repo-local policy toggles in
   `.flywheel/config.local.example.yaml`, but those policies are still mostly
   advisory because the repo does not yet ship a thin hook layer around risky
   actions
3. Flywheel already supports parallel agent work in some skills, but the
   cross-host contract for "move quickly with bounded parallelism" is not yet a
   first-class product rule

The target product posture is:

- one shared `skills/` tree
- explicit Flywheel stages rather than an always-on takeover
- host-native structured questioning rather than raw numbered replies
- thin hooks that guard risky edges without slowing trivial work
- bounded parallel agent use where the user wants speed and the work is truly
  independent

## Requirements

**Shared Workflow**
- R1. Flywheel must keep one shared `skills/` tree as the source of truth for
  the core workflow unless a real host limitation forces a different shape.
- R2. Host differences should be handled through packaging, hooks, helper
  scripts, config, or validation layers rather than by duplicating the stage
  instructions.
- R3. Flywheel must continue to support both Codex and Claude Code as first
  class hosts.

**Interaction Contract**
- R4. Skills that ask the user to choose among options must prefer the host's
  structured question UI when that surface is available.
- R5. Flywheel should not ask the user to answer with raw numeric replies such
  as `1`, `2`, or `3` when the host already provides a better choice surface.
- R6. When the host provides a freeform final option, Flywheel should use that
  host-native path rather than duplicating it with a second manual custom
  branch.
- R7. Multi-select should be used only for compatible sets such as goals,
  constraints, or non-goals. It should not be used for mutually exclusive
  decision forks.
- R8. Direct invocation should keep work moving. Flywheel should still ask
  targeted questions when they materially improve the next step, but it should
  not add ceremony once the route is already clear.

**Workflow Shape And Parallelism**
- R9. Flywheel should keep the explicit stage model: route into the right
  visible stage, then continue through the compact loop rather than hiding the
  workflow inside always-on background behavior.
- R10. When the host supports subagents or delegated agents and the user wants
  speed, Flywheel should use parallel agents for independent bounded work.
- R11. Parallel work should be used only when the work units are actually
  separable. Shared-write or tightly coupled work should remain serial.
- R12. Parallel-agent behavior should stay explicit and bounded rather than
  being treated as a default for all tasks.

**Hooks And Enforcement**
- R13. Flywheel should use hooks only for risky-edge governance, not as a
  general workflow takeover mechanism.
- R14. Clearly dangerous actions may be hard-blocked.
- R15. Risky checkpoints should prefer confirm gates over hard-blocks when that
  preserves a better developer experience.
- R16. Missing review or missing proof before `git commit` should trigger a
  confirm gate rather than a deny gate.
- R17. Pushing to the default branch should trigger a confirm gate rather than
  a deny gate.
- R18. Hook policy should come from repo-local or machine-local policy overlays
  such as `.flywheel/config.local.yaml`, not from an always-loaded global
  instruction document.

**Host Boundaries**
- R19. Claude hook support should use the official Claude plugin or settings
  surfaces rather than ad hoc undocumented installation steps.
- R20. Codex hook support should use supported Codex hook surfaces, while
  acknowledging that current Codex `PreToolUse` is a guardrail rather than a
  full enforcement boundary.
- R21. Flywheel should not assume host-interaction behavior that is stronger
  than the officially supported hook or question surfaces can guarantee.

**Validation**
- R22. The eval harness should protect not only correctness and routing, but
  also restraint, interaction quality, and over-ceremony regression risk.
- R23. Repo-local doctor and setup surfaces should make the hook and policy
  state understandable enough to troubleshoot.
- R24. Contributor guidance should make it clear that host-specific wrappers
  exist to adapt one workflow, not to fork it.

## Success Criteria

- A user in Codex or Claude can interact with Flywheel through structured
  choices rather than being told to reply with numbers.
- The same stage skills remain shared across hosts.
- Repo-local policy can tighten risky edges without making trivial work feel
  slow.
- Flywheel can use parallel agents where the work is independent and the user
  wants that speedup.
- Hooks improve safety at destructive or publication boundaries without turning
  Flywheel into an always-on controller.
- The eval surface can catch regressions where a skill becomes too forceful,
  too chatty, or too slow for straightforward work.

## Scope Boundaries

- Do not add an always-loaded plugin-wide instruction document.
- Do not fork Flywheel into separate Codex-only and Claude-only skill trees.
- Do not turn every workflow recommendation into a hard-block.
- Do not force multi-agent parallelism onto tightly coupled or trivial work.
- Do not preserve raw numeric-reply UX as the primary interaction contract when
  the host already offers better structured input.
- Do not copy Superpowers' stronger always-on workflow-enforcement posture as
  the default Flywheel product model.

## Key Decisions

- **Explicit workflow plus thin hooks**: keep the visible Flywheel stages and
  add hooks only for risky-edge governance.
- **Host-native structured questions**: treat structured choice UI as the
  primary interaction contract wherever the host supports it.
- **Shared skills, host-specific adapters**: keep one authored workflow and
  move host differences into packaging, hooks, helper scripts, and validation.
- **Policy overlays, not global mandates**: use `.flywheel/config.local.yaml`
  and related setup surfaces to tighten risky work without making all work
  heavy.
- **Parallelism is a speed tool, not a religion**: use parallel agents when the
  work is independent and the user wants it, not by default.
- **Confirm before risky publication**: commit and default-branch push
  checkpoints should prefer explicit user confirmation over blanket denial when
  the risk is procedural rather than destructive.

## Dependencies / Assumptions

- The root `skills/` tree remains the shared Flywheel authoring surface.
- `.flywheel/config.local.example.yaml` is the right existing policy extension
  point.
- Claude's public plugin and hook docs support plugin-bundled hooks via
  `hooks/hooks.json`.
- Codex's public hook docs support hook-based guardrails, but current
  `PreToolUse` is Bash-only and should be treated as a partial enforcement
  layer.
- Current host runtimes provide structured question surfaces, even where the
  public docs are thinner about the exact final freeform path than the runtime
  behavior observed in practice.

## Outstanding Questions

### Resolve Before Planning

- None.

### Deferred To Planning

- Where should the shared interaction contract live so all interactive skills
  can reuse it without cargo-cult duplication?
- Which hook logic should be shared across hosts, and which parts should stay
  host-specific wrappers?
- How should repo-local doctor output prove hook readiness without overfitting
  to one host's implementation details?
- Which eval suites should gain explicit restraint and interaction-quality
  dimensions first?

## Recommended Direction

Treat this as a product-hardening pass with three layers:

1. shared authored workflow in `skills/`
2. host adapters for hooks, question UI, and install surfaces
3. eval and doctor coverage that protects both safety and speed

## Next Steps

- Move to `$flywheel:plan` for a concrete implementation plan covering:
  - shared interaction-contract refactoring
  - skill sweep for structured question UX
  - bounded parallel-agent guidance
  - thin cross-host hook policy adapters
  - setup, doctor, and eval updates
