---
name: review
description: "Structured code review using diff-selected reviewer personas, confidence-gated findings, and a merge/dedup pipeline. Use when reviewing code changes before creating a PR, checking whether a branch is ready to merge, or running a review pass inside a larger Flywheel workflow."
metadata:
  argument-hint: "[blank to review current branch, or provide PR link]"
---

# Code Review

`$flywheel:review` reviews code changes with a risk-first, structured workflow.
It selects reviewers from diff evidence, dispatches them in parallel when the
host supports it, keeps synthesis centralized, and keeps mutation bounded.

Use this skill before merge, after meaningful implementation work, or inside a
larger Flywheel loop when code has changed and the next job is to find risk.

**When directly invoked, always review.** Do not downgrade a direct invocation
into a casual summary or diff explanation. If the scope is unclear, establish
it and continue the review workflow.

## When To Use

- Before creating a PR
- After completing a task during iterative implementation
- When feedback is needed on any code changes
- As a standalone branch review
- As a read-only or autofix review step inside a larger workflow

## Argument Parsing

Parse `$ARGUMENTS` for the following optional tokens. Strip each recognized
token before interpreting the remainder as the PR number, GitHub URL, or branch
name.

| Token | Example | Effect |
| --- | --- | --- |
| `mode:autofix` | `mode:autofix` | Select autofix mode |
| `mode:report-only` | `mode:report-only` | Select report-only mode |
| `mode:headless` | `mode:headless` | Select headless mode for programmatic callers |
| `base:<sha-or-ref>` | `base:abc1234` or `base:origin/main` | Skip scope detection and use this as the diff base |
| `plan:<path>` | `plan:docs/plans/2026-03-25-001-feat-foo-plan.md` | Load this plan for requirements verification |

All tokens are optional. Each one present means one less thing to infer.

**Conflicting mode flags:** If multiple mode tokens appear, stop and do not
dispatch reviewers. If `mode:headless` is one of the conflicting tokens, emit:

```text
Review failed (headless mode). Reason: conflicting mode flags — <mode_a> and <mode_b> cannot be combined.
```

Otherwise emit:

```text
Review failed. Reason: conflicting mode flags — <mode_a> and <mode_b> cannot be combined.
```

## Reference Loading Map

Do not preload every reference. Load only what the current phase needs:

- Read `references/resolve-base.sh` only during Stage 1 when branch or
  standalone scope detection needs a base branch.
- Always read `references/reviewer-registry.yaml` and
  `references/persona-loading.md` first when Stage 3 begins.
- Read `references/stack-packs/index.yaml` only when Stage 3 determines stack
  packs should be considered for this diff.
- After stack-pack selection, read only the matching pack files and only the
  stack-pack reference files those packs explicitly name.
- Read `../observability/references/service-readiness-matrix.md` only when the
  diff changes runtime behavior, contracts, state, rollout posture, retries,
  queues, migrations, or other service-readiness-sensitive boundaries.
- Read only the selected persona files under `references/personas/` after the
  registry and loading guide identify them.
- Read `references/diff-scope.md` and `references/findings-schema.json`
  immediately before reviewer dispatch or serial reviewer execution.
- Read `references/subagent-template.md` immediately before parallel reviewer
  dispatch.
- Read `../commit/references/evidence-bundle.md` only when an existing shared
  evidence bundle is present or the review artifact should feed `$flywheel:commit`.
- Read `references/review-output-template.md` during synthesis and
  presentation.

## Host Compatibility

This skill is optimized for Codex and Claude Code style hosts:

- keep the stable orchestration scaffold and registry loading order intact
- keep dynamic diff and repo context later in the prompt
- keep reviewer prompts narrow, explicit, and evidence-bound
- prefer named context blocks such as `<intent>`, `<files>`, `<diff>`,
  `<pr-context>`, and `<standards-paths>` when building reviewer context
- avoid aggressive "always use every reviewer" wording; select reviewers by
  evidence so hosts do not overtrigger

## Mode Detection

| Mode | When | Behavior |
| --- | --- | --- |
| **Interactive** | No mode token present | Review, apply `safe_auto` fixes automatically, present findings, ask for policy decisions on gated or manual work, and optionally continue into fix, push, or PR next steps |
| **Autofix** | `mode:autofix` | No user interaction. Review, apply only policy-allowed `safe_auto` fixes, re-review in bounded rounds, write a run artifact, and emit residual downstream work |
| **Report-only** | `mode:report-only` | Strictly read-only. Review and report only, then stop with no edits, artifacts, todos, commits, pushes, or PR actions |
| **Headless** | `mode:headless` | Programmatic mode for skill-to-skill invocation. Apply `safe_auto` fixes silently in a single pass, return all other findings as structured text output, write run artifacts, skip todos, and end with `Review complete` |

### Mode Rules

**Autofix**

- Skip all user questions after scope is established.
- Apply only `safe_auto -> review-fixer` findings.
- Write a run artifact under `.context/flywheel$flywheel:review/<run-id>/`.
- Create durable todo files only for unresolved actionable findings whose final
  owner is `downstream-resolver`.
- Never commit, push, or create a PR from autofix mode.

**Report-only**

- Skip all user questions.
- Never edit files or externalize work.
- Do not write `.context/flywheel$flywheel:review/<run-id>/`.
- Safe for parallel read-only verification on the same checkout.
- Do not switch the shared checkout. If a caller wants another branch or PR in
  report-only mode, it must run from an isolated checkout or worktree.

**Headless**

- Skip all user questions and infer intent conservatively when needed.
- Require a determinable diff scope. If headless mode cannot determine one,
  emit:

  ```text
  Review failed (headless mode). Reason: no diff scope detected. Re-invoke with a branch name, PR number, or base:<ref>.
  ```

- Apply only `safe_auto -> review-fixer` findings in a single pass.
- Return all non-auto findings as structured text output.
- Write a run artifact under `.context/flywheel$flywheel:review/<run-id>/`.
- Do not create todo files.
- Do not switch the shared checkout. If a caller passes an explicit PR or
  branch target in headless mode on a shared checkout, emit:

  ```text
  Review failed (headless mode). Reason: cannot switch shared checkout. Re-invoke with base:<ref> to review the current checkout, or run from an isolated worktree.
  ```

- End with `Review complete` as the terminal signal.

## Severity Scale

All reviewers use P0-P3:

| Level | Meaning | Action |
| --- | --- | --- |
| **P0** | Critical breakage, exploitable vulnerability, data loss or corruption | Must fix before merge |
| **P1** | High-impact defect likely hit in normal usage, breaking contract | Should fix |
| **P2** | Moderate issue with meaningful downside | Fix if straightforward |
| **P3** | Low-impact, narrow scope, minor improvement | User's discretion |

## Action Routing

Severity answers urgency. Routing answers who acts next and whether this skill
may mutate the checkout.

| `autofix_class` | Default owner | Meaning |
| --- | --- | --- |
| `safe_auto` | `review-fixer` | Local, deterministic fix suitable for in-skill fixing when the mode allows mutation |
| `gated_auto` | `downstream-resolver` or `human` | Concrete fix exists, but it changes behavior, contracts, permissions, or another sensitive boundary |
| `manual` | `downstream-resolver` or `human` | Actionable work that should be handed off rather than fixed in-skill |
| `advisory` | `human` or `release` | Report-only output such as learnings, rollout notes, or residual risk |

Routing rules:

- Synthesis owns the final route.
- On disagreement, choose the more conservative route.
- Only `safe_auto -> review-fixer` enters the in-skill fixer queue
  automatically.
- `requires_verification: true` means the fix is incomplete without targeted
  tests, focused re-review, or operational validation.

## Reviewer Catalog

The initial Flywheel reviewer catalog is intentionally cross-cutting and
language-agnostic. The core workflow does not depend on stack- or
platform-specific reviewers being hardcoded into `SKILL.md`.

Every review uses:

- 4 always-on structured personas
- 2 always-on Flywheel agents
- any relevant cross-cutting conditionals
- optional stack-pack extensions
- optional Flywheel conditional agents for migrations and rollout verification

Read `references/reviewer-registry.yaml` and
`references/persona-loading.md` before reviewer selection. Do not invent new
reviewer categories during synthesis. Add them through the registry and persona
files instead.

The registry plus persona files are the extension surface. Keep `SKILL.md`
generic, append new reviewers in the registry, and use stack packs only when a
specialist truly depends on repo, stack, or platform evidence.

This deterministic loading order is mandatory. Do not skip straight to persona
files or hardcode reviewer choices in the orchestrator body.

## Protected Artifacts

The following paths are Flywheel pipeline artifacts and must never be flagged
for deletion, removal, or gitignore:

- `docs/brainstorms/*`
- `docs/plans/*.md`
- `docs/solutions/*.md`

Discard any cleanup finding that targets those directories.

## Workflow

### Stage 1: Determine Scope

Compute the diff range, file list, and diff.

**If `base:` is provided**

Use the provided value directly and skip base-branch detection:

```bash
BASE_ARG="{base_arg}"
BASE=$(git merge-base HEAD "$BASE_ARG" 2>/dev/null) || BASE="$BASE_ARG"
echo "BASE:$BASE" && echo "FILES:" && git diff --name-only "$BASE" && echo "DIFF:" && git diff -U10 "$BASE" && echo "UNTRACKED:" && git ls-files --others --exclude-standard
```

Do not combine `base:` with a PR number, GitHub URL, or explicit branch target.
If both are present, stop with:

```text
Cannot use `base:` with a PR number or branch target — `base:` implies the current checkout is already the correct branch. Pass `base:` alone, or pass the target alone and let scope detection resolve the base.
```

**If a PR number or GitHub URL is provided**

- Preflight gate: if `mode:report-only` or `mode:headless` is running on the
  shared checkout, stop here before any checkout logic. Do not continue to the
  remaining steps in this section.
- Only continue to `gh pr checkout` when the run is interactive or autofix, or
  when the review is already running in an isolated checkout or worktree.
- Verify the worktree is clean with `git status --porcelain` before switching.
  If it is dirty, stop and ask the user to stash or commit first.
- Check out the PR branch with:

  ```bash
  gh pr checkout <number-or-url>
  ```

- Fetch PR metadata:

  ```bash
  gh pr view <number-or-url> --json title,body,baseRefName,headRefName,url
  ```

- Resolve the base ref from the PR's actual base repository and compute the
  merge-base. Review against the local diff from that base so re-reviews include
  local fix commits and uncommitted edits.
- If the base ref cannot be resolved, stop rather than falling back to
  `git diff HEAD`.

**If a branch name is provided**

- Preflight gate: if `mode:report-only` or `mode:headless` is running on the
  shared checkout, stop here before any checkout logic. Do not continue to the
  remaining steps in this section.
- Only continue to `git checkout <branch>` when the run is interactive or
  autofix, or when the review is already running in an isolated checkout or
  worktree.
- Verify the worktree is clean before switching.
- Check out the named branch with:

  ```bash
  git checkout <branch>
  ```

- Run `bash references/resolve-base.sh`. If it outputs an error, stop rather
  than falling back to `git diff HEAD`.
- On success, produce:

  ```bash
  echo "BASE:$BASE" && echo "FILES:" && git diff --name-only "$BASE" && echo "DIFF:" && git diff -U10 "$BASE" && echo "UNTRACKED:" && git ls-files --others --exclude-standard
  ```

**If no argument is provided**

- Run `bash references/resolve-base.sh`.
- If it fails, stop instead of silently reviewing only working-copy changes.
- On success, review:

  ```bash
  echo "BASE:$BASE" && echo "FILES:" && git diff --name-only "$BASE" && echo "DIFF:" && git diff -U10 "$BASE" && echo "UNTRACKED:" && git ls-files --others --exclude-standard
  ```

Using `git diff "$BASE"` against the working tree includes committed, staged,
and unstaged changes together.

**Untracked file handling**

Always inspect the `UNTRACKED:` list even when `FILES:` and `DIFF:` are
non-empty.

- Interactive mode: tell the user which files are excluded. If any should be
  reviewed, stop and ask them to `git add` those files first.
- Autofix or headless: proceed with tracked changes only and note the excluded
  files in Coverage.

### Stage 2: Intent Discovery

Understand what the change is trying to accomplish.

- **PR mode:** use the PR title, body, linked issues, and commit messages when
  needed.
- **Branch mode:** inspect `git log --oneline ${BASE}..<branch>`.
- **Standalone mode:** inspect:

  ```bash
  echo "BRANCH:" && git rev-parse --abbrev-ref HEAD && echo "COMMITS:" && git log --oneline "${BASE}..HEAD"
  ```

Write a 2-3 line intent summary and pass it to every reviewer.

If intent is ambiguous:

- Interactive mode: ask one targeted question using the platform's blocking
  question tool.
- Autofix, report-only, or headless: infer conservatively and note the
  uncertainty in Coverage or Verdict reasoning.

### Stage 2b: Plan Discovery

Locate the plan document so requirements completeness can be checked later.
Check these sources in order:

1. `plan:` argument
2. PR body for `docs/plans/*.md`
3. auto-discovery from branch-name keywords against `docs/plans/*`

Confidence tagging:

- caller-provided or single unambiguous PR-body match -> `plan_source: explicit`
- auto-discovery or ambiguous PR-body resolution -> `plan_source: inferred`

If a plan is found, read its `Requirements Trace` and `Implementation Units`.
Do not block the review if no plan is found.

### Stage 2c: Build A Service-Readiness Frame When Needed

If the diff is runtime-risky, read
`../observability/references/service-readiness-matrix.md` and build a concise
readiness frame from the dimensions that apply.

Use that frame to sharpen:

- reviewer selection, especially observability, reliability, performance,
  data-access, api-contract, data-migrations, and deployment verification
- verdict reasoning
- any final handoff into `$flywheel:rollout` or `$flywheel:commit`

### Stage 2d: Discover Local Prior Learnings

If the active repo has `docs/solutions/` and the diff touches an area that may
already be documented:

- search solution frontmatter first by `files_touched`, `module`, `tags`,
  `problem_type`, `component`, and title
- prefer docs with `doc_status: active`
- if a strong hit has `superseded_by`, follow that path first and treat the
  older doc as historical context only
- read only the strongest hits

Use these local prior learnings to:

- sharpen reviewer selection when the diff revisits a known failure mode
- detect whether the current change appears to contradict established guidance
- seed the final "Learnings and past solutions" section with repo-local context
- avoid treating already-solved historical incidents as brand new discoveries

### Stage 2e: Read Local Workflow Policy When Present

If `.flywheel/config.local.yaml` exists, read only the local policy keys that
materially affect review-to-commit handoff, such as:

- `review.require_review_before_commit`
- `runtime.require_operational_validation_for_runtime_changes`
- browser-proof gates already relevant to the changed surface

Use these local policy gates to sharpen:

- verdict reasoning
- residual-work vs commit-readiness language
- final handoff into `$flywheel:commit`

Absent config is not a policy violation. Treat local policy as an explicit
overlay, not a universal Flywheel default.

### Stage 2f: Discover Shared Evidence Bundle When Present

If `.context/flywheel/evidence/` exists, inspect only the newest `summary.md`
that clearly matches the current branch, task, or plan.

Use that bundle to:

- avoid re-describing browser or verification proof that already exists
- sharpen commit-readiness reasoning
- decide whether this review should append its own verdict and artifact path for
  `$flywheel:commit`

### Stage 3: Select Reviewers

Read the diff and file list from Stage 1, then read
`references/reviewer-registry.yaml` and `references/persona-loading.md`.

Always include the always-on personas and always-on Flywheel agents from the
registry.

For each cross-cutting conditional reviewer, decide whether the diff warrants
it. This is agent judgment, not keyword matching.

More reviewers is not automatically better. Prefer the smallest set that gives
clear coverage of the actual risks in the diff.

If the repo and diff suggest stack- or platform-specific review would be
useful:

- read `references/stack-packs/index.yaml`
- detect matching stack packs from changed files, nearby manifests, repo-root
  manifests, and applicable instruction files
- load only the matching stack-pack files
- read only the stack-pack reference files explicitly named by those matching
  pack files
- add the reviewer IDs named by those pack files

When multiple stack packs match, combine them additively into one selected
reviewer set. Typical combinations include:

- `typescript` + `react` for typed React surfaces
- language pack + `postgres` when app code and PostgreSQL behavior both change
- language pack + `kafka` or `redis` only when the diff clearly touches those
  integrations
- language pack + `otel` or `datadog` when the diff changes telemetry,
  correlation, monitors, or runtime validation surfaces

Do not split synthesis by pack. Pack selection determines who reviews; the
selected reviewers still flow through one shared dispatch, merge, and verdict
pipeline.

Only after the selected reviewer IDs are known, load the corresponding persona
files from `references/personas/`.

Selection rules:

- `previous-comments` is PR-only. Skip it when no PR metadata exists.
- Count executable code toward adversarial line-count thresholds. Pure
  instruction prose, schemas, and config do not automatically warrant
  adversarial review unless they describe or alter high-risk behavior.
- Do not bypass the registry by hardcoding reviewer files directly in the main
  workflow body.

Announce the team before spawning. Include one-line justifications for
conditional reviewers.

### Stage 3b: Discover Project Standards Paths

Before spawning reviewers, locate relevant `AGENTS.md` and `CLAUDE.md` files:

1. Find all `**/AGENTS.md` and `**/CLAUDE.md`.
2. Keep only those whose directory is an ancestor of at least one changed file.

Pass the resulting path list to the `project-standards` reviewer inside a
`<standards-paths>` block. The reviewer reads the files itself.

### Stage 4: Execute Reviewer Passes

#### Execution Notes

This workflow uses model-tiered review orchestration when the host supports it:

- keep the orchestrator on the strongest available model
- keep reviewer or fixer subagents on a faster capable model when the platform
  supports model overrides
- keep reviewer prompts narrow and schema-bound
- keep returns compact to protect synthesis quality and context window health

If the platform has no model override mechanism, let reviewers inherit the
default model rather than breaking dispatch.

When overrides are available, use a strong orchestrator tier and a cheaper but
capable reviewer tier. Prefer capability labels over provider branding:

- `strong_orchestrator` for synthesis, policy decisions, and complex merge work
- `fast_review_worker` for narrow reviewer passes

Map those tiers to host-native model names only at dispatch time.

#### Run ID

In interactive, autofix, and headless modes, generate a run ID before
dispatching reviewers:

```bash
RUN_ID=$(date +%Y%m%d-%H%M%S)-$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' ')
mkdir -p ".context/flywheel$flywheel:review/$RUN_ID"
```

Report-only mode skips run-id generation and file writes.

#### Dispatch

Read:

- `references/diff-scope.md`
- `references/findings-schema.json`
- `references/subagent-template.md`

If the platform supports subagents or tasks **and** the active host policy
permits delegated review work, dispatch the selected reviewers in parallel.
When the host requires explicit delegation approval, only delegate after that
approval is already present. Otherwise run the same reviewer passes serially
yourself while preserving persona boundaries.

Parallelism is by reviewer, not by pack. Once the selected reviewer set is
known, dispatch the always-on reviewers, relevant cross-cutting reviewers, and
selected stack-pack reviewers in the same parallel review batch when the host
allows it.

Keep each reviewer prompt compact:

- include only the selected persona file, not the full reviewer library
- include only the shared references needed for execution
- avoid repeating large diff-independent instructions inside every reviewer
  prompt

Each structured reviewer receives:

1. its persona definition
2. diff-scope rules
3. the findings schema
4. PR metadata when available
5. intent summary, file list, and diff
6. local prior-learnings summary when Stage 2d found any strong hits
7. run ID and reviewer name
8. standards-paths for `project-standards` only
9. stack-pack reference files only for stack- or platform-specific reviewers
   selected by a
   matching pack

Reviewer passes are read-only with respect to project code. The one permitted
write is the reviewer artifact file under:

```text
.context/flywheel$flywheel:review/{run_id}/{reviewer_name}.json
```

Each reviewer writes full JSON to disk when a run ID exists and returns compact
JSON with merge-tier fields only.

When delegated reviewer execution is permitted, dispatch the always-on and
conditional Flywheel agents in parallel with the structured reviewers.
Otherwise produce the equivalent advisory analysis inline and preserve those
outputs for synthesis even though they do not use the structured findings
schema.

### Stage 5: Merge Findings

Convert multiple reviewer returns into one deduplicated, confidence-gated
finding set. This is the coalescing step for the whole review, including any
parallel stack-pack reviewers.

1. **Validate** compact returns against the compact-return field set:
   top-level `reviewer`, `findings`, `residual_risks`, and `testing_gaps`, plus
   per-finding merge-tier fields only. Do not apply artifact-only requirements
   such as `why_it_matters` or `evidence` at this stage. Drop malformed returns
   or findings and record the drop count.
2. **Confidence gate** findings below `0.60`. Exception: P0 findings at `0.50+`
   survive.
3. **Deduplicate** using:

   ```text
   normalize(file) + line_bucket(line, +/-3) + normalize(title)
   ```

4. **Cross-reviewer agreement** boosts merged confidence by `0.10`, capped at
   `1.0`.
5. **Separate pre-existing** findings into their own list.
6. **Resolve disagreements** by keeping the most conservative severity and
   route, while preserving reviewer disagreement notes.
7. **Normalize routing** so synthesis owns final `autofix_class`, `owner`, and
   `requires_verification`.
8. **Partition the work** into:
   - in-skill fixer queue: `safe_auto -> review-fixer`
   - residual actionable queue: unresolved `gated_auto` or `manual` findings
     owned by `downstream-resolver`
   - report-only queue: `advisory` findings and anything owned by `human` or
     `release`
9. **Sort** by severity, then confidence descending, then file path, then line.
10. **Collect coverage data** by unioning residual risks and testing gaps.
11. **Preserve Flywheel agent artifacts** alongside the merged findings.

### Stage 6: Synthesize And Present

Read `references/review-output-template.md`.

Use pipe-delimited markdown tables for interactive findings output. Do not
present findings as prose blocks.

Interactive output should contain:

1. Header with scope, intent, mode, and reviewer team
2. Findings grouped by severity
3. Requirements completeness, only when a plan was found
4. Applied fixes, only if a fix phase ran
5. Residual actionable work, when applicable
6. Pre-existing issues
7. Learnings and past solutions
8. Agent-native gaps
9. Service readiness notes, when Stage 2c ran
10. Schema drift check, when that agent ran
11. Deployment notes, when that agent ran
12. Coverage
13. Verdict

**Requirements completeness**

When a plan was found:

- `explicit` plan source: unaddressed requirements become P1 `manual ->
  downstream-resolver` findings
- `inferred` plan source: unaddressed requirements become P3 `advisory ->
  human` findings

Omit the section entirely when no plan was found.

**Format verification**

Before delivering the interactive report, verify the findings sections use
pipe-delimited table rows (`| # | File | Issue | ... |`).

### Headless Output Format

In `mode:headless`, replace the interactive report with this structured text
envelope:

```text
Code review complete (headless mode).

Scope: <scope-line>
Intent: <intent-summary>
Reviewers: <reviewer-list with conditional justifications>
Verdict: <Ready to merge | Ready with fixes | Not ready>
Artifact: .context/flywheel$flywheel:review/<run-id>/

Applied N safe_auto fixes.

Gated-auto findings (concrete fix, changes behavior/contracts):

[P1][gated_auto -> downstream-resolver][needs-verification] File: <file:line> -- <title> (<reviewer>, confidence <N>)
  Why: <why_it_matters>
  Suggested fix: <suggested_fix or "none">
  Evidence: <evidence[0]>
  Evidence: <evidence[1]>

Manual findings (actionable, needs handoff):

[P1][manual -> downstream-resolver] File: <file:line> -- <title> (<reviewer>, confidence <N>)
  Why: <why_it_matters>
  Evidence: <evidence[0]>

Advisory findings (report-only):

[P2][advisory -> human] File: <file:line> -- <title> (<reviewer>, confidence <N>)
  Why: <why_it_matters>

Pre-existing issues:
[P2][gated_auto -> downstream-resolver] File: <file:line> -- <title> (<reviewer>, confidence <N>)
  Why: <why_it_matters>

Residual risks:
- <risk>

Learnings & Past Solutions:
- <learning>

Agent-Native Gaps:
- <gap description>

Service Readiness Notes:
- <readiness note>

Schema Drift Check:
- <drift status>

Deployment Notes:
- <deployment note>

Testing gaps:
- <gap>

Coverage:
- Suppressed: <N> findings below 0.60 confidence (P0 at 0.50+ retained)
- Untracked files excluded: <file1>, <file2>
- Failed reviewers: <reviewer>

Review complete
```

Headless detail enrichment rules:

- `Why:` and `Evidence:` come from reviewer artifact files on disk.
- `Suggested fix:` comes from the compact reviewer return.
- Match artifact detail by `file + line_bucket(line, +/-3)` and then by
  normalized title as a tiebreaker.
- If no artifact match exists, omit `Why:` and `Evidence:` for that finding and
  note the gap in Coverage.

## Quality Gates

Before delivering the review, verify:

1. every finding is actionable
2. each finding was checked against surrounding code rather than skimmed
3. severity is calibrated
4. cited line numbers are accurate
5. protected artifacts are respected
6. findings do not duplicate obvious linter or formatter output

## After Review

### Step 1: Build Action Sets

- Clean review: zero findings after suppression and pre-existing separation
- Fixer queue: final findings routed to `safe_auto -> review-fixer`
- Residual actionable queue: unresolved `gated_auto` or `manual` findings owned
  by `downstream-resolver`
- Report-only queue: `advisory` findings and anything owned by `human` or
  `release`

### Step 2: Choose Policy By Mode

**Interactive**

- Apply `safe_auto -> review-fixer` findings automatically.
- Ask a policy question using the platform's blocking question tool only when
  `gated_auto` or `manual` findings remain.
- If only `manual` findings remain, offer residual-work vs report-only choices.
- If `gated_auto` findings remain, offer approval, residual-work, or
  report-only choices.

**Autofix**

- Ask no questions.
- Apply only `safe_auto -> review-fixer`.
- Leave everything else unresolved.

**Report-only**

- Ask no questions.
- Build no fixer queue.
- Stop after synthesis.

**Headless**

- Ask no questions.
- Apply only `safe_auto -> review-fixer` in a single pass.
- Stop after artifact emission and structured text output.

### Step 3: Apply Fixes With One Fixer And Bounded Rounds

- Use exactly one fixer subagent for the current fixer queue only when the
  platform supports delegated fixing **and** the active host policy permits it.
  Otherwise apply the same approved fixer queue inline before re-review.
- Re-review only the changed scope after fixes land.
- Bound the loop with `max_rounds: 2`.
- If any applied finding has `requires_verification: true`, the round is not
  complete until the targeted verification runs.

### Step 4: Emit Artifacts And Downstream Handoff

In interactive, autofix, and headless modes, write a per-run artifact under:

```text
.context/flywheel$flywheel:review/<run-id>/
```

Include:

- synthesized findings
- applied fixes
- residual actionable work
- advisory-only outputs

Also write `metadata.json` with at least:

```json
{
  "run_id": "<run-id>",
  "branch": "<git branch --show-current at dispatch time>",
  "head_sha": "<git rev-parse HEAD at dispatch time>",
  "verdict": "<Ready to merge | Ready with fixes | Not ready>",
  "completed_at": "<ISO 8601 UTC timestamp>"
}
```

In autofix mode, create durable todo files only for unresolved actionable
findings whose final owner is `downstream-resolver`.

If a shared evidence bundle already exists, or if this review is clearly
feeding `$flywheel:commit`, read `../commit/references/evidence-bundle.md` and append
one short review entry to:

```text
.context/flywheel/evidence/<bundle-id>/summary.md
```

Record only what later stages need:

- review verdict
- review artifact path
- any PR-safe summary of blocking or residual findings

Keep full reviewer detail in `.context/flywheel$flywheel:review/<run-id>/` and link
to it from the shared bundle instead of duplicating large findings payloads.

### Step 5: Final Next Steps

Interactive mode only:

- PR mode: offer `$flywheel:commit` to push and refresh the PR, or `Exit`
- Feature-branch mode: offer `$flywheel:commit`, `Continue without finishing the branch`, or `Exit`
- Base/default-branch mode: offer `Continue` or `Exit`
- If the diff changes browser-visible behavior and no fresh acceptance proof was
  captured yet, offer `$flywheel:browser-test` before `$flywheel:commit`.
- If the diff is runtime-risky and rollout posture is still unresolved, offer
  `$flywheel:rollout` before `$flywheel:commit`.
- If the dominant residual work is performance, throughput, build-time, or
  cost tuning rather than correctness, offer `$flywheel:optimize` as the next handoff.

Autofix, report-only, and headless modes stop after report, artifact emission,
and residual-work handoff.

## Fallback

If the platform does not support parallel subagents, run reviewers
sequentially. Keep the same stages, merge pipeline, and output format.

---

## Included References

### Reviewer Registry

@./references/reviewer-registry.yaml

### Persona Loading Guide

@./references/persona-loading.md

### Stack Pack Index

@./references/stack-packs/index.yaml

### Subagent Template

@./references/subagent-template.md

### Diff Scope Rules

@./references/diff-scope.md

### Findings Schema

@./references/findings-schema.json

### Review Output Template

@./references/review-output-template.md

### Evidence Bundle

@../commit/references/evidence-bundle.md
