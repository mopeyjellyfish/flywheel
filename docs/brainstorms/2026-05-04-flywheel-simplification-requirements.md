---
date: 2026-05-04
topic: flywheel-simplification
---

# Flywheel Simplification

## Problem Frame

Flywheel should become more context-efficient and more decisive without losing
the quality gates that make it useful. The current product already points in
the right direction with a compact loop, TDD guidance, publish-by-default
commit behavior, and risky-edge hooks, but those contracts are spread across
large skill files and lifecycle hooks that can feel noisy.

The target is a smaller default mental model: shape decisions well, execute
vertical TDD slices, review the result, then finish the branch through commit,
push, and PR automation.

## Requirements

**Hook Reduction**
- R1. Flywheel must reduce default hook behavior to required risky-edge
  guardrails, not general workflow nudges.
- R2. Required hooks should focus on destructive commands, sensitive writes,
  installed-plugin writes, and explicitly configured commit or push gates.
- R3. Session, prompt, post-tool, and stop lifecycle guidance should be removed
  from the default install or made opt-in diagnostics when it is not enforcing a
  real safety boundary.

**ADR And Decision Shaping**
- R4. Flywheel must add a first-class ADR or decision skill that can be invoked
  directly for spec grilling and durable decision capture.
- R5. `fw:shape` must always run a lightweight decision checkpoint before
  closing a material shaping pass.
- R6. The decision checkpoint must load the ADR or decision skill when shaping
  creates, validates, or changes a hard-to-reverse, surprising, trade-off-heavy,
  architectural, workflow-contract, or product-scope decision.
- R7. The checkpoint must be cheap when no ADR is needed: state that no durable
  decision record is required rather than loading extra context.
- R8. ADR output must be small, repo-grounded, and useful as a spec input:
  status, context, decision, rejected alternatives, consequences, evidence, and
  review questions.
- R9. The ADR skill should borrow the useful posture from
  `grill-with-docs`: challenge ambiguous terminology, inspect existing docs and
  code language, surface contradictions, and sharpen the decision before
  preserving it.
- R10. The ADR skill must ask one material question at a time and provide a
  recommended answer when the answer space is predictable.
- R11. The ADR skill must explore the repo instead of asking the user whenever
  the question can be answered from existing code, docs, configs, plans, or
  prior decisions.
- R12. The ADR skill must walk decision dependencies in order, so downstream
  questions are not asked before upstream choices are resolved.

**Domain Context And Terminology**
- R13. Flywheel must support a lightweight context or glossary artifact for
  project-specific language when shaping exposes overloaded terms,
  domain-specific concepts, or cross-context relationships.
- R14. Context artifacts must be created lazily only when there is resolved
  terminology to preserve; absence of a context file should not force a new
  artifact for trivial work.
- R15. Context capture must stay domain-facing: include canonical terms,
  avoided aliases, relationships, example dialogue, and flagged ambiguities,
  but avoid implementation mechanics and general programming concepts.
- R16. When multiple bounded contexts or project areas exist, Flywheel must be
  able to map each context to its own glossary and decision records, while
  keeping system-wide decisions separate.
- R17. During shaping, conflicts between user language, existing glossary/docs,
  and code behavior must be surfaced immediately instead of silently folded
  into the spec.

**TDD Execution**
- R18. Behavior-bearing work must use TDD by default, with explicit exceptions
  only for generated, configuration-only, documentation-only, mechanical, or
  intentionally throwaway work.
- R19. `fw:plan` must organize implementation plans around vertical behavior
  slices by default, not horizontal batches such as all tests, all service
  edits, all docs, all config updates, or all generated artifacts.
- R20. Each planned vertical slice must name the behavior, workflow contract,
  API contract, or user outcome delivered end to end, and include the source,
  tests, docs, config, generated artifacts, and proof work needed for that slice
  when applicable.
- R21. Horizontal plan units are allowed only for true prerequisites,
  mechanical sweeps, or final reconciliation, and must be explicitly justified.
- R22. `fw:tdd` must require vertical slices: pick one
  public behavior, write or identify the failing test, prove the red signal,
  make the smallest green change, refactor under test, and report evidence.
- R23. TDD guidance must discourage horizontal execution such as writing all
  tests first and then all implementation later.
- R24. TDD guidance must prefer tests through public interfaces and real chains
  where practical, with mocks reserved for true system boundaries.
- R25. `fw:work` must route into the TDD skill before implementation whenever a
  plan unit or direct request changes observable behavior.

**Work Skill Simplification**
- R26. `fw:work` must become a smaller execution router plus completion gate,
  not a large standalone implementation doctrine.
- R27. `fw:work` should own only the essential loop: establish repo truth, map
  work units, load the right helper skill, execute verified slices, keep task
  state aligned, and hand off to review.
- R28. Detailed TDD, browser proof, docs, rollout, observability,
  simplification, and commit behavior should live in their specialist skills
  and be referenced from `fw:work` only at activation points.
- R29. `fw:work` must preserve direct execution for clear small tasks without
  forcing unnecessary upstream ceremony.

**Automated Finish Path**
- R30. `fw:commit` must keep commit -> push -> PR creation or refresh as the
  default finish path unless `local-only` is explicit.
- R31. `fw:commit` should stop only for real blockers: unsafe default-branch
  state, failed readiness checks, missing required policy gates, unavailable
  publish tooling, unresolved blocking review findings, or missing required
  runtime/browser proof.
- R32. PR text should be generated from repo truth and reusable evidence, with
  concise testing and monitoring sections.

**Frontier-Model Context Efficiency**
- R33. First-class skills must keep the default loaded instructions compact and
  move conditional detail into named references.
- R34. Shape must always run the decision checkpoint, but the checkpoint must be
  a small heuristic until a material decision, glossary conflict, or ADR write
  actually requires deeper references.
- R35. The ADR skill must load context/glossary format details only when
  reading, creating, or updating glossary/context artifacts.
- R36. The ADR skill must load ADR format details only when an ADR qualifies or
  an existing decision record needs review.
- R37. Frontier-model effectiveness should come from sharper repo-grounded
  questions, recommended answers, and immediate contradiction checks rather
  than from loading broad doctrine into every shaping turn.

## Success Criteria

- The default visible loop remains `shape -> work -> review -> commit`.
- `shape` consistently considers whether a durable ADR or decision record is
  needed, and uses the first-class ADR skill for material decisions.
- Shaping catches terminology conflicts and preserves only useful
  domain-specific glossary/context decisions.
- Plans organize implementation around vertical behavior slices, with any
  horizontal exceptions justified.
- `work` becomes materially shorter and easier to load while still enforcing
  vertical TDD slices for behavior changes.
- Hook installation is smaller and easier to explain.
- A normal ready branch can be finished through commit, push, and PR with
  fewer repeated prompts.
- Existing evals or new targeted evals can catch regressions in hook posture,
  shape decision checkpoints, work-to-TDD routing, and publish-by-default
  commit behavior.
- The always-loaded shaping and ADR instructions stay compact while deeper
  references activate only for actual glossary or ADR work.

## Scope Boundaries

- Do not remove the compact Flywheel loop.
- Do not remove direct helper skill invocation.
- Do not make ADR capture mandatory for every small task.
- Do not create context/glossary files just because they are absent.
- Do not weaken destructive-command or sensitive-write safety.
- Do not skip review, TDD, browser proof, or runtime validation when repo policy
  or the task risk requires them.
- Do not create a large new spec framework that recreates the current context
  bloat under a different name.

## Key Decisions

- First-class ADR skill plus shape checkpoint: this keeps explicit direct use
  available while making decision quality part of normal shaping.
- Mandatory consideration, conditional loading: `shape` should always check for
  ADR need, but load the full ADR skill only when the decision surface warrants
  it.
- Context capture is adjacent to ADR, not the same artifact: glossary and
  bounded-context language explain what terms mean, while ADRs explain why
  material choices were made.
- Lazy artifacts beat comprehensive templates: resolved terminology and ADRs
  should be written as soon as they become useful, but skipped when they would
  add ceremony without future value.
- Vertical TDD as the execution contract: behavior changes should be delivered
  one user-visible slice at a time, not as broad test and implementation phases.
- Hook policy should enforce risky edges, while skills carry workflow guidance.
- Commit should remain the remembered finish command, with publish automation as
  the default path.

## High-Level Technical Direction

- Add or promote a first-class ADR or decision skill and register it in the
  router surfaces.
- Give that skill a compact reference for context/glossary format and another
  compact reference for ADR format. Load those references only when writing or
  checking the corresponding artifact.
- Add a short decision-checkpoint section to `skills/shape/SKILL.md`, with
  corresponding references from `brainstorm`, `plan`, and `deepen` handoffs
  when they close material shaping artifacts.
- Strengthen `skills/tdd/SKILL.md` rather than duplicating
  TDD doctrine inside `skills/work/SKILL.md`.
- Shrink `skills/work/SKILL.md` by moving detailed execution doctrine into
  references or specialist skill activation points.
- Reduce hook installation and doctor expectations to the required risky-edge
  events.
- Update eval suites for `fw-shape`, `fw-work`, `fw-tdd`,
  `fw-commit`, and hook policy.

## Dependencies / Assumptions

- The existing `fw:tdd` skill is the right home for strict
  TDD behavior.
- The existing publish-by-default `fw:commit` direction should be preserved.
- External inspiration comes from:
  - https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs
  - https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd

## Outstanding Questions

### Resolve Before Planning
- None.

### Deferred to Planning
- [Affects R4][Product naming] Should the first-class command be `fw:adr`,
  `fw:decision`, or another name that keeps ADR power without unnecessary
  jargon?
- [Affects R8, R13-R16][Documentation structure] Should durable decision records live in
  a new `docs/decisions/` directory, a new ADR-specific directory, or an
  existing documentation surface, and should glossary/context files live beside
  specs, decisions, or the relevant bounded context?
- [Affects R1-R3][Technical] Which exact hook events should remain installed by
  default for Codex and Claude after the risky-edge reduction?
- [Affects R26-R28][Technical] How much of `fw:work` should move into
  references versus specialist skills during the first simplification pass?

## Next Steps

-> `$fw:plan` for structured implementation planning.
