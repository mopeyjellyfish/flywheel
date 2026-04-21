---
date: 2026-04-19
topic: flywheel-next-gen-roadmap
---

# Flywheel Next-Gen Roadmap

## Problem Frame

Flywheel already covers the core loop from idea to PR, with stronger runtime
supportability and repo-grounded execution than most workflow plugins. The main
gap is not the core loop itself. The gap is the product shell and the
post-code operational control plane around it.

Today Flywheel is strong at brainstorming, planning, work, review, commit,
logging, observability, and durable lessons. It is weaker at three things that
matter for service and distributed-system engineering:

1. rollout and change-management guidance between review and commit
2. incident-first production debugging and mitigation flow
3. productized setup, install, doctor, and recovery surfaces that make the
   plugin feel complete rather than merely capable

The roadmap should make Flywheel better than comparable plugins by doubling
down on safe, high-leverage engineering for real services instead of chasing
feature breadth or host count for its own sake.

## Requirements

**Product Direction**
- R1. The roadmap must optimize for Flywheel being the best workflow for
  frontier-model-assisted engineering on services, APIs, jobs, queues, and
  distributed-system-adjacent repositories.
- R2. Flywheel must stay Codex- and Claude Code-first for now; broad multi-host
  packaging is explicitly secondary to workflow quality.
- R3. New roadmap items must preserve progressive disclosure and low context
  pollution. Skills, personas, and stack packs should load only when evidence
  says they are needed.

**Workflow Capabilities**
- R4. Flywheel must add a first-class rollout workflow for runtime-risky
  changes, covering compatibility posture, canary or ramp strategy, rollback
  triggers, validation windows, owners, and failure signals.
- R5. Flywheel must add a first-class incident workflow for production issues,
  starting from logs, traces, metrics, or runtime evidence and routing cleanly
  into debug, planning, implementation, and commit.
- R6. Flywheel must support repo-local strict workflow policies for risky work,
  such as requiring browser proof, a reproducer before bug fixes, operational
  validation for runtime changes, or review before commit.
- R7. Flywheel must standardize an evidence bundle that can carry browser proof,
  test proof, review outcomes, optimization evidence, and rollout notes into
  commit.

**Productization And Validation**
- R8. Flywheel must provide a more complete product shell around setup,
  including doctor or recovery behavior, install guidance, upgrade guidance,
  troubleshooting, and durable local setup outputs.
- R9. Flywheel must add end-to-end scenario evals for its key workflows, not
  only per-skill prompt evals.
- R10. The roadmap must avoid adding always-loaded global instruction files,
  mandatory ceremony for trivial work, or host-breadth work that weakens the
  main service-engineering workflow.

## Success Criteria

- A runtime-risky change can move through planning, work, review, rollout, and
  commit with explicit validation ownership, rollback posture, and healthy vs
  unhealthy signals.
- A production issue can start from runtime evidence and follow a named,
  documented Flywheel path without inventing a fresh incident process.
- Strict workflow policies can be enabled per repo or per machine without
  hard-forcing every change into the same level of ceremony.
- Shipping can consume a consistent evidence bundle rather than scattered proof
  across browser testing, review, optimize, and chat history.
- `fw:setup` can leave behind durable local state, clear recovery guidance, and
  a concrete answer about what the repo and host are ready for.
- The eval harness can score not only individual skills but also realistic
  multi-stage developer journeys.

## Scope Boundaries

- Do not broaden host support ahead of workflow quality in Codex and Claude
  Code.
- Do not add an always-loaded plugin-wide instruction document that pollutes
  context.
- Do not force TDD, browser proof, or runtime validation onto trivial or
  low-risk work without an explicit policy toggle.
- Do not replace existing `fw:debug`, `fw:commit`, `fw:setup`, or `fw:review`
  surfaces when extension or clearer routing is sufficient.

## Key Decisions

- **Favor standalone operational workflows over hidden sub-modes**: rollout and
  incident work are substantial enough to deserve explicit skills and routing,
  not a few extra bullets inside `fw:commit` or `fw:debug`.
- **Use policy overlays instead of hard global mandates**: strictness should be
  configurable through local Flywheel config so teams can tighten risky work
  without making trivial work slow.
- **Build product shell around existing strengths**: setup, review, commit,
  observability, and eval infrastructure already exist and should be extended,
  not replaced.
- **Prioritize service-engineering leverage over marketplace breadth**: the
  main competitive edge is better operational engineering, not matching every
  host or editor surface immediately.

## Dependencies / Assumptions

- Existing Flywheel skills remain the backbone of the workflow and will be
  extended rather than rewritten wholesale.
- `.flywheel/config.local.example.yaml`, the eval harness, and the existing
  skill tree are available as extension points.
- The near-term roadmap can assume Codex and Claude Code remain the primary
  supported hosts.

## Outstanding Questions

### Resolve Before Planning

- None.

### Deferred to Planning

- [Affects R6][Technical] What exact local config keys should carry strict
  workflow policy without making `.flywheel/config.local.yaml` noisy or brittle?
- [Affects R7][Technical] Where should the unified evidence bundle live, and
  which stages should be authoritative writers vs readers?
- [Affects R8][Needs research] Should Flywheel expose a dedicated top-level
  doctor command, or should productized doctor behavior remain inside existing
  setup and eval surfaces?
- [Affects R9][Technical] Should end-to-end scenarios live as a new eval suite
  family, an extension to current suite metadata, or a wrapper over existing
  per-skill suites?

## Next Steps

-> /fw:plan for structured implementation planning by default.
