# Shipping Workflow

This file contains the shipping workflow for Phase 3 and Phase 4. Load it only
when all Phase 2 tasks are complete and execution transitions to quality check.

## Phase 3: Quality Check

### 1. Run Core Quality Checks

Always run before submitting:

```bash
# Run the full test suite using the repo-grounded command discovered during the
# Touch Grass pass.

# Run linting using the repo-grounded command from AGENTS.md, CLAUDE.md, local
# manifests, CI workflows, or equivalent project truth sources.
```

If the repo has additional required gates such as typecheck, audit, security,
build, or packaging checks, run the ones relevant to the changed surface.

If the repo exposes a dedicated linting agent or wrapper workflow, use it
before pushing in addition to the grounded command discovery above.

### 2. Code Review (Required)

Every change gets reviewed before shipping. The depth scales with the change's
risk profile, but review itself is never skipped.

**Tier 2: Full review** — default and required unless Tier 1 is explicitly
justified. Invoke `/fw:review` with `mode:autofix`. When the plan file path is
known, pass it as `plan:<path>`. This is the mandatory default.

Proceed to Tier 1 only after confirming every criterion below.

**Tier 1: Inline self-review** — permitted only when all four criteria are
true. Before choosing Tier 1, explicitly state which criteria apply and why. If
any criterion is uncertain, use Tier 2.

- Purely additive — new files only, no existing behavior modified
- Single concern — one skill, one component, not cross-cutting
- Pattern-following — implementation mirrors an existing example with no novel
  logic
- Plan-faithful — no scope growth and no surprising deferred-question
  resolution

### 3. Final Validation

Before shipping, confirm:

- all tasks are marked completed
- testing is addressed: tests pass and new or changed behavior has matching
  test coverage, or there is an explicit justification for no tests
- linting passes
- code follows existing patterns
- Figma designs match when applicable
- there are no console errors or warnings relevant to the change
- each requirement in `Requirements Trace`, if present, is satisfied by the
  completed work
- any `Deferred to Implementation` questions were resolved during execution

### 4. Prepare Operational Validation Plan (Required)

Add a `## Post-Deploy Monitoring & Validation` section to the PR description for
every change.

Include concrete:

- log queries or search terms
- metrics or dashboards to watch
- expected healthy signals
- failure signals and the rollback or mitigation trigger
- validation window and owner

When the repo already has observability conventions, prefer the actual event
names, fields, trace filters, dashboards, or monitor surfaces discovered during
Touch Grass instead of generic placeholders.

If there is truly no production or runtime impact, still include the section
with `No additional operational monitoring required` and a one-line reason.

## Phase 4: Ship It

### 1. Prepare Evidence Context

Do not invoke a separate evidence-capture workflow prematurely in this step.
Evidence capture belongs to the PR creation or PR-description update flow,
where the final diff and summary context are available.

Note whether the completed work has observable behavior, for example:

- UI rendering
- CLI output
- API or library behavior with a runnable example
- generated artifacts
- workflow output

If the host exposes a PR creation helper, it should ask about capturing
evidence only when evidence is actually possible.

### 2. Update Plan Status

If the input document has YAML frontmatter with a `status` field, update it to
`completed`:

```text
status: active  ->  status: completed
```

Choose conventional commit messages for the final shipping step. Prefer
`/conventional-commit` when available. If the helper is unavailable, draft the
header directly as `<type>(scope): summary`. If the best message would use `!`
or `BREAKING CHANGE:`, ask the user before marking the commit as breaking.

Then hand off to `/fw:ship` for commit, push, PR creation, or PR refresh. If no
host helper exists, `/fw:ship` should complete the same steps directly with git
and GitHub CLI or the repo's standard tooling:

```bash
# 1. Stage only the intended files
git add <files>

# 2. Commit using the selected conventional message
git commit -m "<header>"

# 3. Publish the branch
git push --set-upstream origin HEAD

# 4. Create the PR
gh pr create --title "<title>" --body-file <prepared-pr-body-file>
```

Whether using a helper or direct commands, preserve the same Flywheel inputs:
branch safety, conventional commit discipline, testing notes, evidence context,
and a complete PR description.

When providing PR-description context, include:

- the plan's summary and key decisions
- testing notes, including tests added or modified and any manual validation
- the evidence context from step 1
- the Figma design link when applicable
- the `Post-Deploy Monitoring & Validation` section

If the user prefers to commit without creating a PR, `/fw:ship` should still
choose a conventional message first, prefer `/conventional-commit` when
available, and then either use the host helper or a direct `git commit`.

### 3. Notify User

- Summarize what was completed.
- Link to the PR when one was created.
- Note any follow-up work.
- Suggest next steps when useful.

### 4. Offer Spin

Before ending the session, identify up to **3** non-trivial solved problems or
durable lessons worth capturing in `docs/solutions/`.

Good candidates include:

- a bug with a non-obvious root cause
- a workflow or tooling improvement that removed friction
- a reusable testing or validation pattern
- a clarified project rule or integration gotcha
- a repeated dead end that future work should avoid

Present each candidate in one line with why it is worth preserving, then ask
whether to run `/fw:spin` now.

Unless the user explicitly asked for `/fw:spin`, do not silently write new
`docs/solutions/` entries as part of shipping.

If the user agrees to spin a specific candidate, invoke `/fw:spin` with that
selected candidate summary as the argument. Do not call `/fw:spin` blank after
the user already chose a candidate in this shipping step.

If the user wants to spin multiple candidates, handle them one at a time in
priority order rather than passing a blank prompt that forces candidate
rediscovery.

## Quality Checklist

Before creating a PR, verify:

- [ ] All clarifying questions were asked and answered
- [ ] All tasks are marked completed
- [ ] Testing is addressed: tests pass and new or changed behavior has matching test coverage, or an explicit justification exists for why tests are not needed
- [ ] Linting passes
- [ ] Code follows existing patterns
- [ ] Figma designs match implementation when applicable
- [ ] Evidence handling is addressed by the host PR workflow or the manual PR creation step when the change has observable behavior
- [ ] Commit messages follow conventional format
- [ ] The PR description includes `Post-Deploy Monitoring & Validation` or an explicit no-impact rationale
- [ ] Code review completed, inline or via `/fw:review`
- [ ] The PR description includes summary, testing notes, and evidence when captured
- [ ] Any durable session learnings were either captured with `/fw:spin` or consciously deferred

## Code Review Tiers

Every change gets reviewed. The tier determines depth, not whether review
happens.

**Tier 2: Full review** — required default. Invoke `/fw:review mode:autofix`
with `plan:<path>` when available. Safe fixes are applied automatically;
residual work surfaces as todos. Always use this tier unless all four Tier 1
criteria are explicitly confirmed.

If the review verdict is `Not ready`, or unresolved `P0` or `P1` gated/manual
findings remain, stop the shipping path until those findings are resolved or
explicitly accepted by the user.

**Tier 1: Inline self-review** — permitted only when all four are true and each
is stated explicitly before choosing it:

- Purely additive
- Single concern
- Pattern-following
- Plan-faithful
