---
title: Flywheel Canonical Cross-Host Command Contract Plan
type: feat
status: active
date: 2026-04-20
origin: docs/brainstorms/2026-04-20-flywheel-canonical-command-contract-requirements.md
---

# Flywheel Canonical Cross-Host Command Contract Plan

## Overview

This plan hardens Flywheel's cross-host command contract without duplicating the
workflow. The target outcome is:

- one shared `skills/` tree
- Codex canonically invoked as `$flywheel:<stage>`
- Claude Code canonically invoked as `/flywheel:<stage>`
- repo-local validation that proves those names through host-native surfaces
- docs that clearly distinguish Flywheel's namespaced commands from overlapping
  host built-ins or third-party plugin commands

## Problem Frame

Flywheel's packaging now supports both hosts from one repo, but the repo still
does not prove the command contract at the right level. Today the doctors can
show that the Claude plugin is installed and that `/flywheel:start` runs, but
they do not yet verify the plugin-registered command surface directly. That
leaves space for recurring confusion when users see host-level commands such as
`/plan`, `/run`, or `/commit` and infer they are Flywheel.

The implementation goal is therefore not "make Claude's menu identical to
Codex." The goal is to make Flywheel's actual namespaced surface explicit,
provable, and easy to troubleshoot while keeping the authored workflow shared.

## Requirements Trace

- R1-R3. Keep one shared `skills/` tree and do not duplicate the stage
  instructions per host.
- R4-R7. Preserve the canonical namespaced runtime contract:
  `$flywheel:<stage>` in Codex and `/flywheel:<stage>` in Claude Code.
- R8-R10. Add host-native proof for the surfaced Flywheel commands rather than
  relying on inferred UI behavior.
- R11-R13. Keep host-specific packaging and helper logic lightweight and avoid
  introducing a second authored command corpus.

## Scope Boundaries

- Do not rename the `flywheel` plugin namespace.
- Do not rename stage slugs in this pass.
- Do not add a separate Claude-only `skills/` tree.
- Do not introduce a Claude `commands/` wrapper layer as the default solution.
- Do not try to solve every overlapping host command in Claude; solve the
  Flywheel contract and its proof.

## Context & Research

### Relevant Repo Truth

- `.codex-plugin/plugin.json` and `.claude-plugin/plugin.json` already package
  the same Flywheel identity from one repo.
- `skills/` already contains the shared authored workflow.
- `README.md`, `docs/setup/compatibility.md`, and
  `docs/setup/troubleshooting.md` explain installed usage, but they do not yet
  clearly separate canonical Flywheel namespaced commands from overlapping host
  commands.
- `scripts/flywheel-doctor.js` and `tools/evals/src/doctor.cjs` currently prove
  install state and one callable Claude command, but they do not verify the
  registered Claude `flywheel:*` command list directly.

### External Findings

- Claude's command reference documents built-in bare commands such as `/plan`,
  so bare slash commands cannot be treated as Flywheel evidence on their own.
- Claude's SDK init metadata exposes plugin `slash_commands`, and current local
  evidence reports only namespaced `flywheel:*` entries for the installed
  Flywheel plugin.
- Installed Claude plugins that ship `commands/` can still resolve both bare
  and namespaced forms, which means adding wrapper commands is not a clean fix
  for the underlying contract ambiguity.

## Key Technical Decisions

- **Shared authored workflow remains the source of truth.** Keep using the root
  `skills/` tree for the Flywheel stages in both hosts.
- **Treat namespaced commands as the canonical contract.** The repo should
  teach and validate `$flywheel:<stage>` and `/flywheel:<stage>`, not bare host
  commands.
- **Use host-native surface inspection.** Add Claude-side validation that
  checks the registered `flywheel:*` slash commands directly, and keep Codex
  validation on Codex-native surfaces.
- **Prefer proof over workaround.** Tightening docs and doctor output is better
  than introducing a second command-authoring surface that duplicates the
  workflow.

## Testing Strategy

- **Project testing idioms:** use the existing doctor commands, CLI smoke
  checks, and eval harness validation rather than inventing a separate test
  framework for this contract-hardening pass.
- **Plan posture mix:** use `characterization` for doctor and surface-probe
  changes because the repo already has working cross-host packaging and we are
  tightening the proof around it; use `no-new-tests` for pure docs edits.
- **Why no TDD-heavy units:** this work is mostly packaging proof, CLI
  introspection, and documentation rather than new domain logic.
- **Public contracts to protect:** shared `skills/` authoring, `flywheel`
  namespace stability, stage-slug stability, installed Claude plugin
  visibility, and Codex plugin visibility.

## Dependencies And Sequence

1. Decide where the Claude surface inspection logic lives.
2. Add the inspection/proof path to the repo-local doctor surfaces.
3. Update docs and troubleshooting so they point to the canonical namespaced
   commands and the new proof path.
4. Add contributor guidance that keeps `skills/` as the one authored workflow
   surface.
5. Run the cross-host validation flow and a repo grep for stale ambiguous
   command guidance.

## Implementation Units

### Unit 1: Add Claude Command-Surface Inspection To Doctor Flows

- Add a reusable Claude surface probe that inspects the installed plugin's
  registered slash commands through a supported runtime surface.
- Fold that probe into `scripts/flywheel-doctor.js` and
  `tools/evals/src/doctor.cjs`.
- Teach doctor output to distinguish:
  - plugin installed
  - plugin callable
  - canonical `flywheel:*` commands registered
- Keep the current callable smoke for `/flywheel:start`, but stop treating that
  as the only proof point.

Execution note: characterization — this is contract proof around existing
behavior, not a new workflow.

Files:

- `scripts/flywheel-doctor.js`
- `tools/evals/src/doctor.cjs`
- `tools/evals/src/lib/run-direct-cli.cjs`
- `tools/evals/src/lib/prompt-rendering.cjs`
- optional new helper under `tools/evals/src/lib/`

Test posture: `characterization`

Reason: the host integration already exists; the work is to verify and report
the canonical surface more precisely.

Validation scenarios:

- Doctor output reports that Claude has registered `flywheel:start`,
  `flywheel:plan`, and the other canonical Flywheel stage commands.
- Doctor output still proves `/flywheel:start` is callable through the
  installed Claude plugin.
- Doctor output does not rely on bare `/plan`, `/run`, or `/commit` as plugin
  evidence.

### Unit 2: Tighten Docs Around Canonical Namespaced Commands

- Update `README.md`, `docs/setup/compatibility.md`, and
  `docs/setup/troubleshooting.md` so they explain that Flywheel's canonical
  contract is namespaced:
  - Codex: `$flywheel:<stage>`
  - Claude: `/flywheel:<stage>`
- Add a short troubleshooting note that Claude built-ins and unrelated plugin
  commands can overlap with Flywheel's stage names and are not proof of
  Flywheel registration by themselves.
- Document the new doctor or inspection path as the supported way to verify the
  installed Claude command surface.

Execution note: no-new-tests — these are user-facing docs changes grounded in
the host proof added in Unit 1.

Files:

- `README.md`
- `docs/setup/compatibility.md`
- `docs/setup/troubleshooting.md`

Test posture: `no-new-tests`

Reason: the docs should reflect validated runtime truth, not add logic.

Validation scenarios:

- A contributor reading the docs can tell the difference between Flywheel's
  canonical Claude commands and Claude's own built-ins.
- Current docs do not imply that bare `/plan`, `/run`, or `/commit` are
  Flywheel commands.
- Current docs still teach one shared stage vocabulary across both hosts.

### Unit 3: Add A Contributor Guardrail For Shared Skills

- Add a concise contributor-facing note that `skills/` is the only supported
  authoring surface for Flywheel workflow stages and that host-specific plugin
  folders exist to package the same workflow, not to fork it.
- If helpful, add a small repo-local validation or grep check that warns when a
  new Claude-only workflow surface is added without an explicit design decision.

Execution note: no-new-tests unless the guardrail becomes executable.

Files:

- `README.md`
- `docs/setup/compatibility.md`
- optional helper or Make target only if needed after implementation review

Test posture: `no-new-tests`

Reason: this is a maintenance boundary and contributor contract, not a new
runtime feature.

Validation scenarios:

- The repo docs state plainly that Flywheel is authored once in `skills/`.
- A future contributor can see where host-specific packaging ends and shared
  workflow authoring begins.

## Validation Matrix

- `claude plugin validate .`
- `node scripts/flywheel-doctor.js --host claude --smoke`
- `node scripts/flywheel-doctor.js --host codex`
- `npm --prefix tools/evals run doctor -- --host claude --smoke`
- `npm --prefix tools/evals run doctor -- --host codex`
- repo grep for ambiguous bare-command guidance in current docs

## Risks And Mitigations

- **Risk:** Claude's supported inspection surface changes.
  **Mitigation:** keep the probe isolated behind one helper so the repo updates
  one path instead of rewriting multiple doctors.
- **Risk:** contributors misread overlapping host commands as Flywheel anyway.
  **Mitigation:** put the canonical namespaced command contract and the proof
  path in the main README and troubleshooting docs.
- **Risk:** a future fix reaches for Claude-only wrapper commands and starts a
  second command corpus.
  **Mitigation:** document the shared-skills boundary explicitly in the repo.

## Finish Line

This plan is complete when:

- the repo can prove the canonical Flywheel command surface in both hosts
- the docs explain that proof clearly
- Flywheel still ships one authored `skills/` tree rather than host-specific
  workflow duplicates

After this plan, move into `$flywheel:work` to implement the doctor, docs, and
shared-skills guardrails.
