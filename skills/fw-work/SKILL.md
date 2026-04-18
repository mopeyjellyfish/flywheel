---
name: fw-work
description: "Execute work efficiently while maintaining quality and finishing features. Use when a plan doc, specification, todo file, or clear implementation request is ready for execution, and the goal is to ship complete work with visible task tracking, repo-grounded validation, and disciplined follow-through."
metadata:
  argument-hint: "[Plan doc path or description of work. Blank to auto use latest plan doc]"
---

# Execute Work

**Note: The current year is 2026.** Use this when identifying the latest plan
document or updating dated execution artifacts.

`/fw:work` is the execution stage of Flywheel. It takes a plan, spec, todo
file, or clear work request and turns it into shipped implementation. The goal
is not to stay busy. The goal is to finish the feature, validate it against repo
truth, and leave the tree in a reviewable, shippable state.

`/fw:brainstorm` defines **WHAT** to build. `/fw:plan` defines **HOW** to build
it. `/fw:work` executes the plan, stays grounded in the repo, and closes the
loop with quality checks and shipping discipline.

**When directly invoked, always execute.** Do not treat a direct invocation as
"not an execution task" and exit. If the work is large or underdefined enough
that execution would be irresponsible, recommend `/fw:brainstorm` or
`/fw:plan`, explain why, and honor the user's choice if they want to continue.

## Interaction Method

Use the platform's blocking question tool when available. Otherwise present
numbered options in chat and wait for the user's reply.

Ask one question at a time. Prefer concise single-select choices when natural
options exist.

In automated or non-interactive contexts, skip approval prompts once ambiguity
is low enough to proceed responsibly.

## Reference Loading Map

Do not preload every reference. Load only what the current phase needs:

- Read `references/shipping-workflow.md` only when all implementation tasks are
  complete and execution transitions from Phase 2 into quality check and
  shipping.

## Frontier Model Posture

Keep the stable execution scaffold first, keep the work input later, default to
inline execution, and let repo truth override memory. Use Touch Grass to
discover the real validation commands and project axioms before editing or
claiming success.

## Core Principles

1. **Ship complete slices** — finishing the feature matters more than looking
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
   | **Small / Medium** | Clear scope, bounded change, usually under 10 files | Build a task list from discovery and proceed to Phase 1 step 2. |
   | **Large** | Cross-cutting, architectural, high-risk, or likely 10+ files, including auth, payments, migrations, or shared infra | Explain that the work would benefit from `/fw:brainstorm` or `/fw:plan` to surface edge cases and scope boundaries. Honor the user's choice. If proceeding, build a task list and continue to Phase 1 step 2. |

### Phase 1: Quick Start

#### 1. Read Plan and Clarify

Skip this step when arriving from Phase 0 with a bare prompt.

- Read the work document completely.
- Treat the plan as a decision artifact, not an execution script.
- If the plan includes sections such as `Implementation Units`,
  `Work Breakdown`, `Requirements Trace`, `Files`, `Test Scenarios`, or
  `Verification`, use those as the primary source material for execution.
- Check for `Execution note` on each implementation unit. Carry that posture
  into the task, especially when it specifies `tdd`, `test-first`, or
  `characterization`.
- Check for `Deferred to Implementation` or `Implementation-Time Unknowns`.
  These are questions intentionally left for execution. Note them before
  starting so they guide the work instead of surprising you mid-flight.
- Check for a `Scope Boundaries` section and keep its explicit non-goals active
  while implementing.
- Review any references or links provided in the plan.
- If the user explicitly asks for TDD, test-first, or characterization-first
  execution in this session, honor that request even if the plan is silent.
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
- When `docs/solutions/` exists, search it for the target area before editing.
  Prefer frontmatter-first lookup by `files_touched`, `module`, `tags`,
  `problem_type`, `component`, and title, then read only the strongest hits.
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
- Read nearby implementation and test files to confirm local code and test
  idioms.
- Prefer facts backed by files over hypotheses from the plan. If a plan names a
  command that is not confirmed in the repo, correct course to repo truth and
  note the adjustment.
- If a needed validation command cannot be established from repo evidence, ask
  now or explicitly mark the gap before proceeding.

Use that ledger throughout execution. The ledger should answer: "What commands
or artifacts will tell me whether the plan's hypothesis is actually true?"

If a relevant `docs/solutions/` entry exists and the current work would
contradict it, update the plan of attack immediately instead of plowing ahead
as though the prior learning does not exist.

Then check the current branch:

```bash
current_branch=$(git branch --show-current)
default_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')

# Fallback if remote HEAD isn't set
if [ -z "$default_branch" ]; then
  default_branch=$(git rev-parse --verify origin/main >/dev/null 2>&1 && echo "main" || echo "master")
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

- Use the host's worktree workflow if one exists. Otherwise create an isolated
  worktree directly with git, for example:

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

#### 3. Create Todo List

Skip this step if Phase 0 already built the task list or if Phase 0 classified
the work as Trivial.

- Use the available task tracking mechanism to break the work into actionable
  tasks.
- Derive tasks from the plan's implementation units, dependencies, files, test
  targets, and verification criteria.
- Carry each unit's `Execution note` into the task when present.
- Read every unit's `Patterns to follow` field before implementing. Those
  references exist to keep execution aligned with the codebase.
- Use each unit's `Verification` field as the primary "done" signal.
- Do not expect the plan to contain implementation code, shell choreography, or
  micro-step TDD instructions.
- Include testing and quality-check tasks, not just code-edit tasks.
- Keep tasks specific, dependency-aware, and completable.

#### 4. Choose Execution Strategy

After creating the task list, choose how to execute.

**Default to inline execution.** Use delegated or parallel execution only when
the platform supports it **and** the user explicitly asked for delegation,
subagents, or parallel agent work.

| Strategy | When to use |
| --- | --- |
| **Inline** | 1-2 small tasks, tasks needing user interaction mid-flight, or any normal direct `/fw:work` request. This is the default for bare-prompt work. |
| **Serial delegated units** | 3+ tasks with clear dependencies and plan-unit metadata strong enough to isolate execution cleanly. |
| **Parallel delegated units** | 3+ independent tasks that pass the Parallel Safety Check and the user explicitly wants parallel agent work. |

**Parallel Safety Check** — required before any parallel dispatch:

1. Build a file-to-unit mapping from every candidate unit's `Files:` section,
   including create, modify, and test paths.
2. Check for intersection. Any file appearing in 2+ units is overlap.
3. If any overlap exists, downgrade to serial delegated units and log the
   reason.

Even without planned overlap, parallel units sharing a working directory can
contend on the git index and on test execution. When dispatching work in
parallel, instruct each delegated worker:

- do not stage files
- do not create commits
- do not run the full project test suite

Give each delegated unit:

- the full plan file path for context
- the specific unit's Goal, Files, Approach, Execution note, Patterns,
  Test Scenarios, and Verification
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
   relevant tests, stage only that unit's files, load
   `/conventional-commit`, and commit with a message derived from the
   unit's Goal.
5. If tests fail after a unit commit, diagnose and fix before committing the
   next unit.
6. Update task state, then dispatch the next eligible batch.

### Phase 2: Execute

#### 1. Task Execution Loop

For each task in priority order:

```text
while (tasks remain):
  - Mark task as in-progress
  - Read any referenced files from the plan or discovered during Phase 0
  - Look for similar patterns in the codebase
  - Find existing test files for implementation files being changed
  - Implement following existing conventions
  - Add, update, or remove tests to match implementation changes
  - Run the relevant ground-truth checks from the Touch Grass ledger
  - Run tests after changes
  - Assess testing coverage: if behavior changed, were tests added or updated?
  - Mark task as completed
  - Evaluate for an incremental commit
```

When a unit carries an `Execution note`, honor it:

- **test-first / tdd** — write the failing test before implementation
- **characterization-first** — capture current behavior before changing it
- **no-new-tests** — only when the unit is truly mechanical, config-only, or
  otherwise justified

Guardrails for test posture:

- Do not write the test and the implementation in the same step when working
  test-first.
- Do not skip verifying that a new test fails before implementing the fix or
  feature.
- Do not over-implement beyond the current behavior slice when working
  test-first.
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

# 3. Load /conventional-commit to choose the header/body/footer
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

Do not simplify after every single task. Early duplication can still be
intentional until the shape of the work is clear.

If a simplify skill or equivalent exists, use it. Otherwise perform the review
yourself.

#### 6. Figma Design Sync

If the work is UI-heavy and the task includes Figma designs:

- implement the components to spec
- compare implementation against the design iteratively
- fix visual differences before moving on

#### 7. Track Progress

- Keep the task list current as work completes.
- Note blockers and unexpected discoveries.
- Create new tasks if scope legitimately expands.
- Keep the user informed at major milestones.

### Phase 3-4: Quality Check and Ship It

When all Phase 2 tasks are complete and execution transitions to quality check,
read `references/shipping-workflow.md` and follow that workflow for final
validation, review, PR preparation, and notification.

## Common Failure Modes

- **Analysis paralysis** — read enough to move, then execute.
- **Skipping clarification** — ask before building the wrong thing.
- **Ignoring plan references** — they exist to keep the work aligned.
- **Guessing commands** — Touch Grass first and let repo truth drive checks.
- **Testing only at the end** — continuous testing prevents surprise piles.
- **Losing task state** — update progress as you go.
- **Stopping at 80%** — finish the feature and close the quality gate.
- **Skipping review** — every change gets reviewed, even when the review is
  lightweight.
