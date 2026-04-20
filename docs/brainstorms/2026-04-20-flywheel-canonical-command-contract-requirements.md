---
date: 2026-04-20
topic: flywheel-canonical-command-contract
---

# Flywheel Canonical Cross-Host Command Contract

## Problem Frame

Flywheel now supports installation from the same repository in both Codex and
Claude Code, and the core workflow instructions already live in one shared
`skills/` tree. The remaining confusion is not about install packaging. It is
about what counts as the canonical command surface in each host.

On the Claude side, the installed Flywheel plugin is callable through
`/flywheel:<stage>`, but the interactive experience can still show or resolve
bare commands such as `/plan`, `/run`, or `/commit` that are also used by
Claude built-ins or other plugins. That makes it easy to misread a host-level
command as proof that Flywheel is installed correctly.

The question is therefore not "should Flywheel have different skills for
Claude?" The question is "how do we make the shared Flywheel skill surface
provable and teachable in both hosts without duplicating the workflow?"

## Requirements

**Shared Workflow**
- R1. Flywheel must keep one shared `skills/` tree as the source of truth for
  the core workflow unless a hard host limitation forces a different shape.
- R2. Codex and Claude Code must continue to use the same stage slugs and the
  same workflow concepts across that shared skill corpus.
- R3. The repo must not introduce a second Claude-only or Codex-only copy of
  the Flywheel stage instructions just to paper over command-surface confusion.

**Canonical Invocation Contract**
- R4. The canonical Codex invocation contract remains `$flywheel:<stage>`.
- R5. The canonical Claude Code invocation contract remains `/flywheel:<stage>`.
- R6. Bare host commands such as `/plan`, `/run`, or `/commit` must not be used
  as Flywheel contract proof in docs, troubleshooting, or doctor output.
- R7. If a host exposes overlapping built-ins or third-party plugin commands,
  Flywheel docs must explicitly distinguish those from Flywheel's own canonical
  namespaced commands.

**Validation**
- R8. Repo-local validation must prove the surfaced Flywheel names in each host
  using host-native inspection, not inference from adjacent host commands.
- R9. Claude validation should verify the plugin-registered `flywheel:*`
  command surface directly, not only "plugin installed" or "one command call
  succeeded."
- R10. Codex validation should continue to verify Flywheel visibility through
  Codex-native surfaces rather than by assuming config presence alone is enough.

**Packaging And Maintenance**
- R11. Host-specific packaging may differ through `.codex-plugin/` and
  `.claude-plugin/`, but the workflow content itself should remain shared.
- R12. Host-specific helpers or validation adapters are acceptable when they
  reduce ambiguity without creating a second authored command corpus.
- R13. Do not add a Claude-only `commands/` layer as the primary fix unless a
  later experiment proves that the namespaced skill surface cannot be relied on
  and that wrapper commands would materially improve the contract without
  creating duplicate maintenance.

## Success Criteria

- A contributor can install Flywheel from this repo in Codex and Claude Code
  and understand the canonical commands without guessing.
- The repo clearly states that "consistent" means one shared skills tree and
  one shared stage vocabulary, even though each host uses a different prefix.
- Repo-local doctor output can prove that Claude has registered `flywheel:*`
  commands and that Codex has registered `flywheel:*` prompts in its own
  surface.
- Current docs no longer imply that Claude built-ins or bare slash commands are
  Flywheel's own public contract.
- No second host-specific Flywheel skill tree or wrapper-command corpus is
  required to support the canonical workflow.

## Scope Boundaries

- Do not rename the `flywheel` plugin namespace in this pass.
- Do not rename the single-word stage slugs in this pass unless host-native
  registration evidence proves the canonical namespaced surface is impossible
  to rely on.
- Do not try to suppress every overlapping built-in command in Claude; that is
  a host behavior question, not necessarily a Flywheel packaging bug.
- Do not add backwards-compatibility aliases for `/fw:*`, `$fw:*`, or other
  historical forms.
- Do not fork the shared skills into per-host trees.

## Key Decisions

- **Consistency means shared authored workflow, not identical host UI.** The
  important invariant is one `skills/` tree and one set of stage slugs. The
  host-specific prefix can differ.
- **The namespaced Flywheel commands are the contract.** In Claude, the source
  of truth should be `/flywheel:<stage>`, not whichever bare command the host
  also happens to expose.
- **Registration proof matters more than menu heuristics.** Doctor output and
  troubleshooting should rely on the host's actual registered command list or
  equivalent native surface, not on what users infer from the first few `/`
  suggestions they notice.
- **Do not duplicate to chase a UI quirk.** Adding Claude-only command wrappers
  or a second skill corpus is worse than teaching and validating the canonical
  namespaced surface correctly.

## Dependencies / Assumptions

- `.codex-plugin/plugin.json` and `.claude-plugin/plugin.json` will remain the
  host-specific packaging surfaces.
- The shared `skills/` tree already contains the canonical Flywheel workflow
  instructions for both hosts.
- Claude Code's installed-plugin surface can be inspected through supported
  runtime or SDK metadata that reports registered slash commands.
- Codex continues to expose Flywheel visibility through its existing debug or
  config surfaces.

## Outstanding Questions

### Resolve Before Planning

- Should the repo add a dedicated shared "surface inspection" helper, or should
  the existing doctor commands absorb that logic directly?

### Deferred To Planning

- How much of the interactive Claude menu behavior should the docs describe,
  versus only documenting the canonical commands and validation path?
- Should the repo add a lightweight contributor-facing note that `skills/` is
  the only supported authoring surface for Flywheel workflow stages?

## Recommended Direction

Treat this as a contract-hardening pass, not a workflow rewrite:

1. Keep one shared `skills/` tree.
2. Keep `$flywheel:<stage>` for Codex and `/flywheel:<stage>` for Claude Code.
3. Add host-native validation that proves those surfaces explicitly.
4. Tighten docs so they explain the difference between Flywheel's canonical
   namespaced commands and any overlapping host-level commands.

## Next Steps

- Move to `$flywheel:plan` for a small follow-up plan covering:
  - Claude command-registration proof in doctor output
  - doc and troubleshooting cleanup around canonical namespaced commands
  - contributor guidance that keeps Flywheel authored from one shared `skills/`
    tree
