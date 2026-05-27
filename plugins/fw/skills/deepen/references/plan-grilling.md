# Plan Grilling

Load this file when deepening an existing implementation plan. The goal is to
make the plan detailed enough that the user, next agent, and reviewer share the
same understanding before work starts.

## Operating Rules

- Inspect repo truth before asking. Check the source plan, origin spec or
  requirements doc, context docs, decision records, prior solutions, source,
  tests, configs, API docs, workflow docs, and generated artifacts that can
  answer the question.
- Walk dependencies in order: source/spec intent, terminology, scope boundary,
  concrete scenario, vertical slice shape, test and verification posture,
  rollout or support posture, then downstream execution questions.
- Ask one material question at a time. Include the recommended answer and the
  reason for that recommendation when the likely answer space is predictable.
- Challenge conflicts immediately. If context, decisions, code, tests, or prior
  solutions disagree with the plan or source spec, surface the contradiction
  before strengthening the plan around it.
- Stress-test concrete scenarios. Use realistic edge cases to force precision
  around actors, states, boundaries, cardinality, failure behavior, and handoff
  points.
- Continue the loop until the completion bar is met, the user explicitly
  pauses, or unresolved blockers are recorded as open questions. Do not treat a
  single generic confirmation as sufficient for a materially ambiguous plan.

## Source Spec Alignment

When a plan has an origin spec, requirements doc, brainstorm, PRD synonym,
design doc, or issue body, compare the plan against it before changing the
implementation units.

Check:

- problem and outcome
- users, actors, or operators
- workflows, observable behavior, CLI/API contracts, or support paths
- accepted decisions and constraints
- acceptance criteria and definition of done
- explicit non-goals and out-of-scope work
- open questions and whether they block planning, implementation, or rollout

If the plan invents scope, weakens acceptance criteria, hides a source question,
or uses different terminology from the source artifact, stop and resolve that
conflict before calling the plan execution-ready.

If the source artifact itself is fuzzy or contradictory, load
`../../brainstorm/references/spec-grilling.md` and apply the same terminology,
scenario, and contradiction checks. Update the plan with the resolved truth. Do
not rewrite source artifacts unless the user approved that edit or the active
workflow clearly owns the source document.

## Vertical Slice Grill

For each implementation unit, verify that it is a vertical behavior slice by
default.

A good slice states:

- the observable behavior, workflow contract, API contract, CLI behavior,
  support outcome, or verification outcome it delivers end to end
- the source requirements or acceptance criteria it advances
- the production, test, docs, config, migration, generated artifact, or proof
  work needed for that one outcome
- dependencies and whether the unit is genuinely serial or parallel-ready
- the exact test posture: `tdd`, `characterization`, or `no-new-tests`
- for TDD, the concrete red signal and green signal that prove the material
  hypothesis
- public contracts protected by the slice

Reject horizontal units such as "write all tests," "edit the services," "update
docs," or "wire config" unless the unit is a true prerequisite, mechanical
sweep, or final reconciliation. Mark those as horizontal exceptions with the
reason and keep them serial unless repo truth proves they can run independently.

## Context, Decisions, And Spin

Use durable docs sparingly but immediately when they are warranted.

- Search `docs/solutions/` before asking or deciding when prior Flywheel
  learnings may already settle a workflow, support, verification, or repo
  maintenance question. Prefer active docs and follow `superseded_by`.
- Update context/glossary docs only for resolved project-specific terms,
  aliases, relationships, bounded contexts, or ambiguities that future specs,
  plans, tests, or reviews would otherwise rediscover.
- Keep context docs domain-facing. Do not turn them into implementation plans,
  file maps, test plans, or migration notes.
- Offer a decision record only when all three are true: the choice is hard to
  reverse, surprising without context, and the result of a real tradeoff.
- Offer `$fw:spin` only after re-review when the session produced a resolved,
  reusable repo lesson or durable user correction that belongs in
  `docs/solutions/`. Do not spin guesses, unresolved tradeoffs, or normal plan
  content.

## Completion Bar

A deepened plan is ready to hand back only when it can answer:

- Which source spec, requirements, or user request is the plan implementing?
- Which project terms are canonical, ambiguous, or deliberately avoided?
- Which concrete scenario proves the main scope boundary?
- Are all implementation units vertical slices or explicitly justified
  horizontal exceptions?
- Does each material slice name the test posture, red/green proof, and
  verification signal that execution should use?
- Which current docs, code, tests, prior solutions, context docs, or decisions
  support or contradict the plan?
- Are context or decision records updated, explicitly unnecessary, or still
  blocking?
- Are remaining questions classified as resolved, deferred to implementation,
  deferred to rollout, or blocking before work?
