---
date: 2026-04-19
topic: flywheel-active-repo-solutions-boundary
---

# Flywheel Active-Repo Solutions Boundary

## Problem Frame

Flywheel uses `docs/solutions/` as a durable knowledge surface, and that is
correct when it is operating inside a project repository. The problem is that
Flywheel is also dogfooded inside its own plugin repo, where `docs/solutions/`
contains internal development lessons about Flywheel itself. Runtime skill text
must not blur those two contexts or imply that Flywheel's internal dogfooding
docs should carry into other repositories.

## Requirements

**Runtime Scope**
- R1. Flywheel runtime skills must treat `docs/solutions/` as the active
  repository's `docs/solutions/` directory, not as a global Flywheel knowledge
  store.
- R2. When the active repository is the Flywheel repo, Flywheel's own
  `docs/solutions/` remains valid and usable for dogfooding.
- R3. Runtime skill wording must not imply that Flywheel's internal
  `docs/solutions/` content should bleed into other repositories or their
  prompts.

**Missing Surface Behavior**
- R4. If the active repository does not have `docs/solutions/`, runtime skills
  should continue without that knowledge surface instead of treating it as an
  error.
- R5. When useful, Flywheel may suggest creating or extending the active
  repository's `docs/solutions/` later through `$flywheel:spin`.

**Implementation Boundaries**
- R6. This change should be solved through runtime skill and reference wording,
  not through packaging changes or a separate install artifact.
- R7. The implementation should stay focused on user-facing runtime prompts and
  references that shape downstream behavior.

## Success Criteria

- Runtime Flywheel instructions clearly scope `docs/solutions/` to the active
  repository.
- A downstream repository does not inherit wording that suggests Flywheel's own
  dogfooding solution docs are part of its runtime knowledge surface.
- Flywheel still works normally in repositories that already use
  `docs/solutions/`, and it still behaves sensibly when that directory is
  absent.

## Scope Boundaries

- Do not introduce a packaging split or install-time filtering step in this
  pass.
- Do not add a new global knowledge system beyond the active repository's
  existing `docs/solutions/`.
- Do not make `docs/solutions/` mandatory for using Flywheel.

## Key Decisions

- **Active repo wins**: `docs/solutions/` is always interpreted relative to the
  repository Flywheel is currently working in.
- **Dogfooding remains valid**: Flywheel's own `docs/solutions/` is still used
  when Flywheel is the active repository.
- **No packaging detour**: the immediate fix is a wording and behavior boundary
  in the runtime skills themselves.

## Dependencies / Assumptions

- Flywheel is installed through the existing plugin manifest at
  `.codex-plugin/plugin.json`.
- The relevant leak surface is runtime skill and reference text under `skills/`,
  not a separate packaged docs artifact.

## Outstanding Questions

### Resolve Before Planning

- None.

### Deferred to Planning

- [Affects R7][Technical] Which runtime references under `skills/` materially
  shape downstream prompts and should be updated in the same sweep as the main
  skill files?

## Next Steps

-> `$flywheel:plan` for structured implementation planning by default; for this
small wording boundary, `-> $flywheel:work` is also acceptable.
