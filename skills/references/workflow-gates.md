# Flywheel Handoffs And Readiness Gates

Use this reference when a Flywheel stage is about to hand work to another
stage, pause for approval, or decide whether the next stage is allowed to
start.

## Canonical Handoff Card

Close material stage outputs with this compact shape:

```text
Flywheel handoff
- Stage: `fw:<stage>`
- Artifact: `<repo path, run path, PR URL, or none>`
- Ready: `<yes | no | conditional>` -- <one-sentence reason>
- Open decisions: `<none | concise list>`
- Evidence: `<commands, artifacts, verdicts, or n/a>`
- Next: `fw:<stage>` -- <why this is the next stage>
```

Rules:

- `Stage` is the stage that just produced this handoff, not the requested next
  stage.
- `Artifact` lists durable repo or local artifacts that the next stage should
  read. Use `none` only when the stage produced no reusable artifact.
- `Ready` describes whether the next stage may start now. Use `conditional`
  when the next stage needs a user decision, missing proof, or a non-blocking
  caveat.
- `Open decisions` lists only decisions that can change the next action. Use
  `none` when there are no material choices left.
- `Evidence` names fresh proof or review verdicts. Do not paste sensitive raw
  output; link to local evidence bundles or summarize safely.
- `Next` names exactly one recommended next Flywheel stage. Mention alternates
  in nearby prose only when the user must choose.

Do not use the handoff card as ceremony for one-line answers. Use it when a
stage boundary, artifact, approval gate, or proof handoff matters.

## Readiness Gates

### Shape-Ready

`fw:shape` is ready to hand off when:

- the internal mode is clear: `ideate`, `brainstorm`, `plan`, or `deepen`
- the selected mode produced or identified the right artifact
- any source document review or plan review that should happen before work has
  happened or is explicitly offered as the next decision
- the next user choice is explicit when approval is needed

### Plan-Ready

`fw:plan` is ready to hand off to `fw:work` when the plan has:

- clear problem frame, scope boundary, and requirements trace
- implementation units with repo-relative files
- per-unit `Test posture`, `Execution mode`, dependencies, and verification
- `Red signal` and `Green signal` for `tdd` units
- architecture, runtime, rollout, or supportability decisions when relevant
- document-review result or explicit unresolved findings
- a user decision to address findings, deepen the plan, or start work

### Work-Ready

`fw:work` is ready to hand off to `fw:review` when:

- planned or accepted units are implemented or explicitly deferred
- TDD, characterization, or exception evidence matches the selected posture
- relevant tests, checks, browser proof, docs impact, runtime support, and
  local policy gates are complete or listed as blockers
- task state and plan checkboxes are synchronized when a plan exists
- the worktree status is understood, including untracked files

### Review-Ready

`fw:review` is ready to hand off to fixing, spin, or commit when:

- diff scope and intent are clear
- plan requirements were checked when a plan exists
- selected reviewers ran or skipped with an explicit reason
- findings are severity-ranked, deduplicated, and routed
- blocking status is explicit
- review verdict, testing gaps, residual risk, and evidence paths are reusable

### Spin-Ready

`fw:spin` is warranted when completed work revealed durable, repo-specific
guidance that future work should recover from `docs/solutions/`.

It is not warranted for generic lessons, obvious command transcripts, or notes
that only restate the diff. When warranted, keep the candidate set to at most
three lessons and capture the strongest useful one before commit.

### Commit-Ready

`fw:commit` may commit, push, or create/refresh a PR when:

- branch safety is satisfied
- staged or unstaged changes have a coherent commit grouping
- required tests, review, browser proof, runtime validation, and local policy
  gates are complete or intentionally deferred with user approval
- no unresolved P0/P1 review findings block the branch
- spin was captured, skipped, or found unwarranted
- PR-safe finish summary, evidence, monitoring/no-impact notes, and PR target
  are ready

## Boundary Rules

- Do not cross from plan to work without user approval through the host question
  tool when available, or an explicit same-turn implementation request.
- Do not cross from work to commit without review. If a narrower workflow
  explicitly allows inline self-review, record that as review evidence.
- Do not cross from review to commit while blocking findings remain.
- Do not turn helper skills into visible backbone stages. Helpers improve the
  current stage's handoff.
