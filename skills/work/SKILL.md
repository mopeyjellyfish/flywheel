---
name: work
description: "Execute ready implementation work. Use for plans, specs, todos, or clear requests that need tracked changes and validation."
metadata:
  argument-hint: "[Plan doc path or description of work. Blank to auto use latest plan doc]"
---

# Execute Work

Use the actual current date from runtime context when identifying the latest
plan document or updating dated execution artifacts.

`$fw:work` is the smart middle stage of Flywheel's compact project loop.
It takes a plan, spec, todo file, or clear work request and turns it into
implemented, validated repo changes. The goal is not to stay busy. The goal is
to finish the feature, validate it against repo truth, pull in helper
workflows only when the task actually needs them, and leave the tree ready for
review and commit.

`$fw:brainstorm` defines **WHAT** to build. `$fw:plan` defines **HOW** to build
it. `$fw:work` executes the plan, stays grounded in the repo, and absorbs
helper-stage selection for things like docs, browser proof, rollout, verify,
observability, logging, architecture strategy, maintainability, or
simplification when the work needs those surfaces before review.

**When directly invoked, always execute.** Do not treat a direct invocation as
"not an execution task" and exit. If the work is large or underdefined enough
that execution would be irresponsible, recommend `$fw:brainstorm` or
`$fw:plan`, explain why, and honor the user's choice if they want to continue.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Call the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When the workflow spans multiple material steps, use the host task-tracking
tool named in `../references/host-interaction-contract.md` to create and
maintain a short task list.

Ask one question at a time. Prefer concise single-select choices when natural
options exist.

When runtime tradeoffs are real, present a short predicted choice list with the
recommended label first and rely on the host's native freeform final path when
it exists.

In automated or non-interactive contexts, skip approval prompts once ambiguity
is low enough to proceed responsibly.

## Reference Loading Map

Do not preload every reference. Load only what the current phase needs:

- Read `references/commit-workflow.md` only when all implementation tasks are
  complete and execution transitions from Phase 2 into quality check and
  commit.
- Read `../observability/references/service-readiness-matrix.md` only when the
  work changes runtime behavior, contracts, state, rollout posture, retries,
  queues, migrations, or other blast-radius-sensitive boundaries.

## Core Principles

1. **Finish complete slices** — finishing the feature matters more than looking
   busy.
2. **Touch grass before and during execution** — replace guesses with repo
   truth by finding the actual commands, policies, and patterns that can prove
   or falsify the plan's hypotheses.
3. **Use the plan as a decision artifact** — follow its scope, sequencing, and
   rationale, but adapt implementation details when the codebase proves a
   better path.
4. **Follow what exists** — mirror current naming, architecture, and test
   idioms before inventing anything new.
5. **Test continuously** — run the right checks while the work is still fresh.
6. **Keep progress visible** — maintain task state, note blockers, and finish
   with a clean quality gate.
7. **Prefer fewer extra visible handoffs** — use helper workflows when they add
   real value beyond the default shape -> work -> review -> optional spin ->
   commit loop.

## Input Document

<input_document> #$ARGUMENTS </input_document>

If `<input_document>` is blank:

1. Search `docs/plans/` for the most recent `*-plan.md`.
2. If one obvious candidate exists, announce that it will be used and continue.
3. If no plan is found or multiple candidates are equally plausible, ask the
   user what to implement.

If the input resolves to an existing file path, treat it as the work document.

If the input is not a file path, treat it as a bare prompt describing the work.

## Workflow

### Phase 0: Input Triage

Determine how to proceed based on what was provided in `<input_document>`.

**Plan document** — the input is a file path to an existing plan,
specification, or todo file. Skip to Phase 1.

**Bare prompt** — the input describes work rather than pointing at a file:

1. **Scan the work area**

   - Identify files likely to change based on the prompt.
   - Find existing test files for those areas by looking for test or spec files
     that import, reference, or share naming with the implementation files.
   - Note local patterns and conventions in the affected areas.

2. **Assess complexity and route**

   | Complexity | Signals | Action |
   | --- | --- | --- |
   | **Trivial** | 1-2 files, no behavioral change, typo, rename, narrow config edit | Proceed to Phase 1 step 2, then implement directly. Skip task-list construction and the execution strategy phase. Apply Test Discovery if the change touches behavior-bearing code. |
   | **Small / Medium** | Clear scope, bounded change, usually under 10 files | Build a host-tracked task list from discovery and proceed to Phase 1 step 2. |
   | **Large** | Cross-cutting, architectural, high-risk, or likely 10+ files, including auth, payments, migrations, or shared infra | Explain that the work would benefit from `$fw:brainstorm` or `$fw:plan` to surface edge cases and scope boundaries. Honor the user's choice. If proceeding, build a host-tracked task list and continue to Phase 1 step 2. |

### Phase 1: Quick Start

#### 1. Read Plan and Clarify

Skip this step when arriving from Phase 0 with a bare prompt.

- Read the work document completely.
- Treat the plan as a decision artifact, not an execution script.
- If the plan includes sections such as `Implementation Units`,
  `Work Breakdown`, `Requirements Trace`, `Files`, `Test Scenarios`, or
  `Verification`, use those as the primary source material for execution.
- If the plan includes `Dependencies And Parallelism` or per-unit
  `Execution mode`, use them as the default execution shape. Treat
  `parallel-ready` as eligible rather than mandatory, and keep `serial` units
  ordered.
- Check for `Test posture` on each implementation unit. If it is `tdd`, load
  the `test-driven-development` skill before writing implementation code for
  that unit. If it is `characterization`, capture current behavior before
  changing it. Treat `no-new-tests` as valid only when the plan gives a clear
  exception reason.
- Check for `Execution note` on each implementation unit and carry any
  sequencing, rollout, or other non-test posture into the task.
- If the plan includes `Architecture and Pattern Decisions` or an equivalent
  section, carry those boundary, pattern, and clean-code constraints into the
  task instead of rediscovering them ad hoc.
- Check for `Deferred to Implementation` or `Implementation-Time Unknowns`.
  These are questions intentionally left for execution. Note them before
  starting so they guide the work instead of surprising you mid-flight.
- Check for a `Scope Boundaries` section and keep its explicit non-goals active
  while implementing.
- Review any references or links provided in the plan.
- If the plan already has checked implementation-unit checkboxes, treat those
  units as already completed unless repo truth clearly contradicts them.
- If the user explicitly asks for TDD, test-first, or red-green-refactor
  execution in this session, load the `test-driven-development` skill and honor
  that request even if the plan is silent.
- If the user explicitly asks for characterization-first execution in this
  session, honor that request even if the plan is silent.
- If anything important is unclear or ambiguous, ask clarifying questions now.
- In interactive mode, get user approval to proceed after clarifications.
- Do not skip clarification when the plan leaves room for materially different
  outcomes.

#### 2. Touch Grass and Setup Environment

Before creating tasks or editing code, perform a **Touch Grass pass**. The
point is to find the repo's actual truth sources for validation rather than
assuming commands, policies, or conventions from memory.

Build a short **ground-truth ledger** from the repo:

- Read the repo-root `AGENTS.md` when present. Read `CLAUDE.md` only when
  present or when the repo still uses it as compatibility context.
- Read `.flywheel/config.local.yaml` when present and carry forward only the
  local policy gates that materially affect this task, such as browser proof,
  reproducer-before-fix, review-before-commit, or runtime validation.
- When the active repo has `docs/solutions/`, search that local store for the
  target area before editing. Prefer frontmatter-first lookup by
  `files_touched`, `module`, `tags`, `problem_type`, `component`, and title,
  then read only the strongest hits. Prefer `doc_status: active` and follow
  `superseded_by` when present.
- Inspect the nearest project manifests and automation surfaces that can prove
  how the repo wants work validated. Depending on stack, this may include
  `package.json`, `pyproject.toml`, `Gemfile`, `go.mod`, `Makefile`,
  `justfile`, `turbo.json`, `nx.json`, CI workflows, or repo-local scripts.
- Capture repo axioms and non-negotiables surfaced by those sources, including
  review expectations, branch safety rules, tracker or release workflow hints,
  and other project-level constraints that should shape execution.
- Confirm the actual commands, tasks, or entry points for:
  - tests
  - linting or formatting
  - typechecking or static analysis
  - audit, security, or policy checks when relevant
  - app boot or dev server commands when relevant to manual validation
- Identify the repo's observability surfaces when the work changes runtime
  behavior, for example:
  - logging wrappers or event helpers
  - tracing or correlation libraries
  - metrics, dashboards, or alert references
  - error trackers or saved log queries
- For runtime-risky work, capture the current behavior on the affected path and
  the likely blast radius if the change is wrong. Prefer concrete boundaries
  such as single request, single tenant, queue, worker pool, node, region, or
  data-correctness impact over generic "high risk" labels.
- Read nearby implementation and test files to confirm local code and test
  idioms.
- Prefer facts backed by files over hypotheses from the plan. If a plan names a
  command that is not confirmed in the repo, correct course to repo truth and
  note the adjustment.
- If a needed validation command cannot be established from repo evidence, ask
  now or explicitly mark the gap before proceeding.

When runtime-facing work depends on telemetry design or log quality, load
`$fw:observability` and `$fw:logging` instead of improvising a new instrumentation
shape from memory.

When runtime-risky work changes contracts, state, retries, queueing, or
cross-service behavior, read
`../observability/references/service-readiness-matrix.md` and keep the
applicable dimensions in the ground-truth ledger.

Use that ledger throughout execution. The ledger should answer: "What commands
or artifacts will tell me whether the plan's hypothesis is actually true?"

For runtime-facing work, the ledger should also answer: "What logs, traces,
metrics, dashboards, or queries will tell me this change is healthy or broken?"

For runtime-risky work, the ledger should also answer: "What does this path do
today, what failure modes matter most, and how far can a mistake spread?"

If a local workflow policy file exists, the ledger should also answer: "Which
completion gates in this repo are required here versus merely recommended?"

If the repo truth reveals multiple viable reliability postures, such as retry
vs fail-fast or fail-open vs fail-closed, call the host question tool with a
concise choice surface before editing:

- current repo truth
- top failure modes
- likely blast radius
- 2-3 viable options at most
- recommendation and proof hooks

If a relevant active-repo `docs/solutions/` entry exists and the current work
would contradict it, update the plan of attack immediately instead of plowing
ahead as though the prior learning does not exist.

Then check the current branch:

```bash
current_branch=$(git branch --show-current)
default_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')

# Safer fallbacks if remote HEAD isn't set
if [ -z "$default_branch" ]; then
  default_branch=$(git remote show origin 2>/dev/null | sed -n '/HEAD branch/s/.*: //p' | head -n1)
fi

if [ -z "$default_branch" ] && command -v gh >/dev/null 2>&1; then
  default_branch=$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name 2>/dev/null)
fi

if [ -z "$default_branch" ]; then
  echo "Unable to determine the default branch safely. Ask the user or run $fw:setup worktrees before creating a branch or worktree."
  exit 1
fi
```

**If already on a feature branch** (not the default branch):

- Check whether the branch name is meaningful. Names like
  `feat/crowd-sniff` or `fix/email-validation` communicate intent. Opaque or
  auto-generated names do not.
- If the branch name is meaningless or auto-generated, recommend renaming it
  before continuing:

  ```bash
  git branch -m <meaningful-name>
  ```

  Derive the new name from the plan title or work description.

- Ask: "Continue working on `[current_branch]`, or create a new branch?"
  - If continuing, proceed to step 3.
  - If creating new, follow Option A or B below.

**If on the default branch**, choose how to proceed:

**Option A: Create a new branch**

```bash
git pull origin [default_branch]
git checkout -b feature-branch-name
```

Use a meaningful branch name based on the work, for example
`feat/user-authentication` or `fix/email-validation`.

**Option B: Use a worktree** (recommended for parallel development)

- Prefer `$fw:worktree` when it is available. Use the bundled manager script
  instead of raw `git worktree add` so ignore hygiene and env-file copying stay
  consistent.
- If no manager is available, create an isolated worktree directly with git,
  for example:

  ```bash
  git worktree add ../<worktree-dir> -b <feature-branch-name> <default_branch>
  ```

- Continue the task from that isolated worktree.

**Option C: Continue on the default branch**

- Requires explicit user confirmation.
- Only proceed after the user explicitly says "yes, commit to [default_branch]".
- Never commit directly to the default branch without explicit permission.

**Recommendation:** Prefer a worktree when:

- parallel feature development is likely
- keeping the default branch clean matters
- frequent branch switching is expected

#### 3. Create Task List

Skip this step if Phase 0 already built the task list or if Phase 0 classified
the work as Trivial.

- Use the host task-tracking tool named in
  `../references/host-interaction-contract.md` to break the work into
  actionable tasks. If the host does not expose one, keep a concise visible
  checklist in chat.
- For plan-driven work, default to one host task per remaining implementation
  unit. Reuse the unit label in the task name so the task tool and plan stay
  aligned.
- Add separate tasks only for cross-cutting work not already represented by a
  unit, such as initial bare-prompt discovery or the final quality gate.
- Derive tasks from the plan's implementation units, dependencies, files, test
  targets, and verification criteria.
- Use each unit's `Execution mode` plus `Dependencies` to determine whether it
  is blocked, serial, or eligible for a later parallel-ready batch. If the plan
  lacks `Execution mode`, default units to `serial`.
- Carry each unit's `Test posture` and `Execution note` into the task when
  present.
- Read every unit's `Patterns to follow` field before implementing. Those
  references exist to keep execution aligned with the codebase.
- Use each unit's `Red signal`, `Green signal`, and `Verification` fields as
  the primary proof path when the unit is `tdd`; otherwise use `Verification`
  as the primary "done" signal.
- Keep the host task list and the plan document synchronized: the task tool
  carries `in_progress` and `blocked`, while the plan checkbox flips to `[x]`
  only after the unit's verification passes.
- Do not expect the plan to contain implementation code, shell choreography, or
  micro-step TDD instructions. Do expect a `tdd` unit to provide enough red and
  green signal to start test-first execution.
- Include testing and quality-check tasks, not just code-edit tasks.
- Keep tasks specific, dependency-aware, and completable.

#### 4. Choose Execution Strategy

After creating the task list, choose how to execute.

**Default to inline execution.** Use delegated or parallel execution only when
the platform supports it **and** the user explicitly asked for delegation,
subagents, or parallel agent work.

| Strategy | When to use |
| --- | --- |
| **Inline** | 1-2 small tasks, tasks needing user interaction mid-flight, or any normal direct `$fw:work` request. This is the default for bare-prompt work. |
| **Serial delegated units** | 3+ tasks with clear dependencies and plan-unit metadata strong enough to isolate execution cleanly. |
| **Parallel delegated units** | 3+ independent `parallel-ready` tasks that pass the Parallel Safety Check and the user explicitly wants parallel agent work. |

**Parallel Safety Check** — required before any parallel dispatch:

1. Start only from units whose `Execution mode` is `parallel-ready` and whose
   dependencies are already complete. `serial` units are never batched.
2. Build a file-to-unit mapping from every candidate unit's `Files:` section,
   including create, modify, and test paths.
3. Check for intersection. Any file appearing in 2+ units is overlap.
4. If any overlap exists, downgrade to serial delegated units and log the
   reason.

Even without planned overlap, parallel units sharing a working directory can
contend on the git index and on test execution. When dispatching work in
parallel, instruct each delegated worker:

- do not stage files
- do not create commits
- do not run the full project test suite

Give each delegated unit:

- the full plan file path for context
- the specific unit's Goal, Files, Test posture, Red signal, Green signal,
  Approach, Execution note, Patterns, Test Scenarios, and Verification
- any resolved deferred questions relevant to that unit
- instruction to check whether the unit's test scenarios cover happy path, edge
  cases, failure paths, and integration where applicable

**After each serial delegated unit completes:**

1. Review its diff against the unit's scope and `Files:` list.
2. Run the relevant tests before proceeding.
3. If tests fail, diagnose and fix before dispatching dependent work.
4. Update the task list and plan checkboxes.
5. Dispatch the next unit.

**After each parallel batch completes:**

1. Wait for the whole batch to finish before acting on results.
2. Compare the actual modified files across the batch, not just the planned
   `Files:` lists.
3. If two units touched the same file, commit all non-colliding work first,
   then re-run the colliding units serially for the shared file.
4. For each completed unit in dependency order, review the diff, run the
   relevant tests, stage only that unit's files, choose a conventional commit
   message, and commit with a message derived from the unit's Goal. Prefer
   `$fw:commit` when available; otherwise draft the header directly as
   `<type>(scope): summary`.
5. If tests fail after a unit commit, diagnose and fix before committing the
   next unit.
6. Update task state, then dispatch the next eligible batch.

### Phase 2: Execute

#### 1. Task Execution Loop

For plan-driven work, treat each unchecked implementation unit as the default
task. Start with the first `serial` unit or the first dependency-cleared
`parallel-ready` batch identified by the plan.

For each task in priority order:

```text
while (tasks remain):
  - Mark task as in-progress
  - Read any referenced files from the plan or discovered during Phase 0
  - Look for similar patterns in the codebase
  - Find existing test files for implementation files being changed
  - If the unit or prompt requires TDD, load `test-driven-development`, write
    and verify the red signal first, then implement the minimal green change
  - Otherwise, implement following existing conventions and add, update, or
    remove tests to match implementation changes
  - When runtime behavior changes, assess whether logs, traces, metrics, or
    operational validation need to be added or updated
  - Use `$fw:observability` or `$fw:logging` when the repo's runtime support story
    needs deliberate design, not just a quick local guess
  - When the change is browser-visible, run `$fw:browser-test` before claiming
    completion unless the repo has a stronger existing browser-proof surface
    and you can name it explicitly
  - When the change alters setup, public APIs, CLI flows, config, or
    user/operator workflows, note the likely docs impact so you can surface
    `$fw:docs` before final review when a separate docs pass is worth it
  - When runtime behavior changes meaningfully, confirm the chosen reliability
    posture still matches the current code, failure modes, and blast radius
  - When local policy requires explicit operational validation for runtime
    changes, treat that as a completion gate rather than a nice-to-have note
  - For runtime-risky work, run a short service-readiness sweep across the
    applicable dimensions from
    `../observability/references/service-readiness-matrix.md`
  - Run the relevant ground-truth checks from the Touch Grass ledger
  - Run tests after changes
  - Assess testing coverage: if behavior changed, were tests added or updated?
  - Apply verify discipline before claiming the task is done
  - Keep repo-local commit gates visible when present, especially review-before-
    commit and browser-proof requirements
  - Mark task as completed
  - If the task maps to a plan unit, flip that checkbox only after the unit's
    verification and relevant tests pass
  - Evaluate for an incremental commit
```

When a unit carries a `Test posture`, honor it:

- **tdd** — load `test-driven-development`, write the failing test before
  implementation, verify the red failure, implement the smallest green change,
  refactor if useful, and report red/green/refactor evidence
- **characterization-first** — capture current behavior before changing it
- **no-new-tests** — only when the unit is truly mechanical, config-only, or
  otherwise justified

When a unit carries an `Execution note`, honor it as sequencing, rollout, or
other execution guidance. Do not use `Execution note` as a substitute for
`Test posture`.

Guardrails for test posture:

- Do not write the test and the implementation in the same step when working
  test-first.
- Do not skip verifying that a new test fails before implementing the fix or
  feature.
- Do not over-implement beyond the current behavior slice when working
  test-first.
- If agent-authored implementation for the current TDD unit was written before
  a red signal, discard only those agent-authored hunks and restart from RED.
  Never revert user-authored or pre-existing dirty changes.
- Skip test-first discipline for trivial renames, pure configuration, and pure
  styling work.

**Test Discovery** — before implementing changes to a file, find its existing
test files by searching for test or spec files that import, reference, or share
its naming pattern. When the plan specifies test scenarios or test files, start
there, then look for additional local coverage the plan may not have listed.

**Test Scenario Completeness** — before writing tests for feature-bearing work,
check whether the unit's scenarios cover all applicable categories:

| Category | When it applies | How to derive if missing |
| --- | --- | --- |
| **Happy path** | Always for feature-bearing work | Use the unit's Goal and Approach to identify the core input and output pairs. |
| **Edge cases** | Inputs, state, boundaries, concurrency | Identify boundary values, empty inputs, and unusual state combinations. |
| **Error or failure paths** | Validation, permissions, downstream failures | Enumerate invalid inputs, denials, and dependency failures the code must handle. |
| **Integration** | The unit crosses layers or triggers a real chain | Identify the real callback, middleware, event, or service chain and cover it without mocks where possible. |

**System-Wide Test Check** — before marking a task done, pause and ask:

| Question | What to do |
| --- | --- |
| **What fires when this runs?** Callbacks, middleware, observers, event handlers. | Read the actual code for models, hooks, middleware, or handlers touched by the change. |
| **Do my tests exercise the real chain?** | Add at least one integration test that uses real objects through the relevant chain. |
| **Can failure leave orphaned state?** | Trace the failure path with real objects. If state is created before a risky call, test cleanup or idempotent retry behavior. |
| **What other interfaces expose this?** | Search for sibling entry points, mixins, DSLs, alternative APIs, or mirrored surfaces and keep parity when needed. |
| **Do error strategies align across layers?** | Verify the rescue or retry list matches what lower layers actually raise. |

Skip the System-Wide Test Check only for true leaf-node changes with no
callbacks, no persistence, and no parallel interfaces.

#### 2. Incremental Commits

After each task, evaluate whether to create an incremental commit.

| Commit when... | Do not commit when... |
| --- | --- |
| A logical unit is complete | The work is only a small fragment of a larger unit |
| Tests pass and the progress is meaningful | Tests are failing |
| You are about to switch contexts | The state only represents scaffolding with no value on its own |
| You are about to attempt risky changes | The only honest message would be `WIP` |

**Heuristic:** "Can I write a commit message that describes a complete,
valuable change?" If yes, commit. If the only honest message is `WIP`, wait.

Use implementation units as a starting guide for commit boundaries, but adapt
to what the repo proves. A large unit may need multiple commits, and two tiny
related units may land together.

**Commit workflow:**

```bash
# 1. Verify relevant tests pass using commands from the Touch Grass ledger

# 2. Stage only files related to this logical unit
git add <files related to this logical unit>

# 3. Choose a conventional commit header/body/footer
#    Prefer $fw:commit-message when available
#    If the helper is unavailable, draft the message directly
#    If the best message would use `!` or `BREAKING CHANGE:`, ask the user first

# 4. Commit with the selected conventional message
git commit -m "feat(scope): description of this unit"
```

When parallel delegated work is used, delegated workers do not commit. The
orchestrator stages and commits after the batch is reconciled.

#### 3. Follow Existing Patterns

- Read the plan's similar-code references before implementing.
- Match naming conventions and file organization exactly.
- Reuse existing components, helpers, and test idioms where possible.
- Follow project coding standards from `AGENTS.md` and repo-local instruction
  files.
- When in doubt, search for similar implementations and mirror them.

#### 4. Test Continuously

- Run the relevant checks after each significant change.
- Do not wait until the end to find out the approach was wrong.
- Fix failures immediately.
- Add tests for new behavior, update tests for changed behavior, and remove or
  update tests for deleted behavior.
- Unit tests with mocks prove isolated logic. Integration tests with real
  objects prove the system still hangs together.

#### 5. Simplify as You Go

After a cluster of related units, or every 2-3 units, review the changed files
for simplification opportunities:

- consolidate duplicated patterns
- extract shared helpers where the repo already favors that shape
- improve reuse and efficiency when it reduces real complexity
- route to `maintainability` when the issue is future edit cost rather than
  removable complexity
- route to `architecture-strategy` or `pattern-recognition` when current repo
  truth invalidates a planned boundary or named-pattern choice

Do not simplify after every single task. Early duplication can still be
intentional until the shape of the work is clear.

If a simplify skill or equivalent exists, use it. If the main issue is future
edit cost rather than removable complexity, use a maintainability pass instead.
Otherwise perform the review yourself.

#### 6. Figma Design Sync

If the work is UI-heavy and the task includes Figma designs:

- implement the components to spec
- compare implementation against the design iteratively
- fix visual differences before moving on

#### 7. Track Progress

- Keep the host task list current as work completes.
- When the input document is a plan, mirror completed unit state back into the
  plan checkboxes and keep in-progress state in the host task tool rather than
  faking an in-progress checkbox format.
- Note blockers and unexpected discoveries.
- Create new tasks if scope legitimately expands.
- Keep the user informed at major milestones.

### Phase 3-4: Quality Check and Commit It

If the completed change likely changed setup steps, public interfaces, config
contracts, CLI behavior, or user workflows, offer `$fw:docs` before final
review. If the user agrees, complete that docs pass first and then resume the
path into review and commit.

When all Phase 2 tasks are complete and execution transitions to quality check,
read `references/commit-workflow.md` and follow that workflow for final
validation, required `$fw:review`, and notification.

If the completed change is runtime-risky and the release posture is still
unclear, route through `$fw:rollout` after `$fw:review` and before
`$fw:commit` so activation sequence, validation window, and rollback
triggers are explicit instead of being squeezed into the final commit step.

## Common Failure Modes

- **Analysis paralysis** — read enough to move, then execute.
- **Skipping clarification** — ask before building the wrong thing.
- **Ignoring plan references** — they exist to keep the work aligned.
- **Guessing commands** — Touch Grass first and let repo truth drive checks.
- **Testing only at the end** — continuous testing prevents surprise piles.
- **Losing task state** — update progress as you go.
- **Blind parallelism** — only batch units that are explicitly
  `parallel-ready` and still pass a fresh overlap check.
- **Premature checkbox flips** — do not mark a plan unit complete until its
  verification and relevant tests pass.
- **Stopping at 80%** — finish the feature and close the quality gate.
- **Skipping review** — every change gets reviewed, even when the review is
  lightweight.
- **Turning helper checks into default ceremony** — use docs, browser proof,
  rollout, and verify when the task needs them, not as a fixed visible
  checklist layered on top of the default review step.
