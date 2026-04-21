---
date: 2026-04-21
topic: flywheel-commit-replaces-ship
---

# Flywheel Commit Replaces Ship

## Problem Frame

Flywheel's current finish stage is named `ship`, but the user-facing action a
developer is most likely to remember is `commit`. Today that creates two
problems:

1. `commit` sounds like the natural "finish this branch" command, but Flywheel
   currently uses it only as a commit-message helper.
2. `ship` already owns the real finish flow, including commit, push, and PR
   creation or refresh, but that capability is hidden behind a less intuitive
   stage name.

The goal is to make `commit` the remembered finish-stage command and remove
`ship` completely, while preserving Flywheel's review, branch-safety, proof,
and post-finish knowledge-capture behavior.

## Requirements

**User-Facing Workflow**
- R1. Flywheel must replace `ship` with `commit` as the visible finish stage in
  the core project-development loop.
- R2. The visible loop must become `shape -> work -> review -> commit -> spin`.
- R3. `commit` must be taught as the default "finish this branch" command in
  README, routing, examples, and handoff language.
- R4. `ship` must be removed immediately rather than kept as a compatibility
  alias.

**Commit Stage Behavior**
- R5. `$flywheel:commit` must own the full finishing flow: determine commit
  units, create local commit(s), push the branch by default, create or refresh
  the PR when possible, and then decide whether to offer `spin`.
- R6. `$flywheel:commit` must support an explicit local-only path, but local-only
  behavior must be opt-out rather than the default.
- R7. If the user invokes `$flywheel:commit` directly, the stage must keep
  moving instead of refusing to run just because earlier stages were skipped.
- R8. `$flywheel:commit` must auto-run any missing finish-stage checks it can
  perform itself, including review when needed, and stop only on real blockers
  such as unresolved high-severity findings, default-branch risk, or required
  browser or runtime validation gates.

**Commit Planning**
- R9. `$flywheel:commit` must detect when the branch contains multiple logical
  commit units instead of assuming one commit.
- R10. When multiple logical commits are warranted, `$flywheel:commit` must show
  a short commit plan before execution.
- R11. The commit plan must describe each proposed commit in enough detail for a
  developer to see why the split is honest, including a conventional header and
  the reason it is separate.
- R12. When the diff is too entangled for a clean split, `$flywheel:commit`
  must say so and prefer one honest commit over a bad partition.

**Command Surface Cleanup**
- R13. The current message-only `commit` helper must be renamed to
  `commit-message`.
- R14. The new full-stage `commit` workflow must call `commit-message` as an
  internal helper when drafting commit headers, bodies, or footers.
- R15. Routing, helper-stage references, evidence-bundle references, rollout
  handoffs, review handoffs, and eval suites must be updated so they no longer
  teach or depend on `ship`.
- R16. Repo-wide live wording and policy labels that still describe the finish
  stage must be renamed from `ship`-based language to `commit`-based language,
  including `fw-ship`, `shipping`, and `review-before-ship` wording in config
  templates, plugin manifests, setup guidance, doctor-facing text, and other
  current workflow surfaces.

## Success Criteria

- A user can finish a ready branch by remembering `$flywheel:commit` alone.
- Flywheel no longer teaches `ship` anywhere in the product-facing workflow.
- No live repo surface still teaches `fw-ship`, `shipping`, or
  `review-before-ship` when it means the finish stage or its policy gate.
- Direct `commit` invocation remains fast, but still preserves real safety
  gates.
- Multi-commit branches are split only when the grouping is understandable and
  reviewable.
- `spin` remains the post-finish capture step, now offered after `commit`.

## Scope Boundaries

- Do not preserve `ship` as a compatibility alias.
- Do not keep ship-based policy or config wording in current repo surfaces when
  it refers to the finish stage.
- Do not weaken default-branch, review, browser-proof, or runtime-validation
  protections.
- Do not force every branch into multiple commits.
- Do not turn `commit-message` into a separate user-facing primary stage.

## Key Decisions

- Replace `ship` completely: recall matters more than preserving the older
  finish-stage name.
- Make `commit` the full finish stage: splitting commit, push, and PR refresh
  across multiple remembered commands adds friction.
- Default to pushing and PR refresh: local-only behavior is valid, but should
  be explicit.
- Preview multi-commit execution: commit splitting is valuable, but over-
  segmentation is a real risk.
- Keep `commit-message` as an internal helper: the user mental model stays
  simple while conventional-commit drafting remains reusable.

## Dependencies / Assumptions

- Existing `ship` behavior is the baseline to migrate rather than redesign from
  scratch.
- Current review, rollout, browser-test, verify, and evidence-bundle contracts
  remain useful once their downstream handoff target changes from `ship` to
  `commit`.

## Outstanding Questions

### Deferred to Planning
- [Affects R8][Technical] How should `commit` determine when a prior review is
  recent enough to reuse versus when it should run review again?
- [Affects R10][Technical] What is the minimum commit-plan format that is still
  readable in both Codex and Claude Code hosts?
- [Affects R15][Needs research] Which eval packs, docs, and reference files can
  be renamed in place versus needing explicit migration notes because of file or
  suite IDs?

## Next Steps

-> $flywheel:plan for structured implementation planning
