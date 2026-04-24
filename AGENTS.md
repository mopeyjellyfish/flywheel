# Repository Guidelines

## Project Structure & Module Organization
`skills/` is the product. Each Flywheel stage or helper lives in `skills/<name>/SKILL.md` with optional `agents/`, `references/`, `scripts/`, or `assets/`. Shared host guidance lives in `skills/references/host-interaction-contract.md`. `scripts/` contains repo-local maintenance and validation helpers such as `flywheel-doctor.js` and `flywheel-eval.js`. `evals/` stores suite definitions as `manifest.json`, `cases.jsonl`, and `rubric.md`. `docs/` holds durable repo knowledge under `brainstorms/`, `plans/`, `setup/`, and `solutions/`. Host packaging lives in `.codex-plugin/`, `.claude-plugin/`, and `.agents/plugins/`.

## Directory Layout
```text
skills/           Shared Flywheel stage and helper skills
evals/            Eval suites for workflow, stage, and regression validation
scripts/          Local install refresh, doctor, and eval helpers
hooks/            Shared hook policy script and Claude hook pack
docs/             Brainstorms, ideation captures, plans, setup docs, solutions
tools/evals/      Isolated eval harness workspace and CLI
.claude-plugin/   Claude plugin manifest and marketplace metadata
.codex-plugin/    Codex plugin manifest reused by the repo marketplace
.agents/plugins/  Repo marketplace metadata used by Codex
.flywheel/        Local config example and repo-level Flywheel settings
```

## Development & Verification Commands
- `make install/codex` refreshes the local Codex install, repairs hooks, runs doctor checks, and validates eval suites.
- `make install/codex/force-link` repoints the Codex install to this checkout when another repo or worktree is linked.
- `make install/claude` refreshes the local Claude marketplace install and runs the same validation loop for Claude.
- `make install/claude/force-source` repoints the Claude marketplace source to this checkout.
- `make install/skills/global` installs Flywheel through `npx skills add` from the local checkout's `skills/` package for non-Codex skills-CLI hosts and fails fast if that local package is missing or empty. Codex should use the plugin install because standalone global skills appear as unnamespaced commands such as `$start`.
- `make install/skills/project` is a safe repo-root no-op after validating the local `skills/` source because project scope resolves to `./skills`, which is Flywheel's authored source tree.
- `make uninstall/skills` removes Flywheel `npx skills` installs from global scope and treats repo-root project scope as metadata cleanup/no-op so it never deletes the authored `skills/` tree.
- `make uninstall/all` removes Flywheel from Codex and Claude and also clears Flywheel `npx skills` installs so a later install starts from a clean host state.
- `make doctor` runs repository health checks without reinstalling anything.
- `make validate` validates every eval suite through `node scripts/flywheel-eval.js validate`.
- `make verify` runs the broad plugin verification pass: `node scripts/flywheel-doctor.js --smoke`, which includes eval-suite validation.
- `npm --prefix tools/evals install` installs the isolated eval harness dependencies.
- `npm --prefix tools/evals run compare -- --suite flywheel` runs side-by-side Codex vs Claude comparisons after the install step.

## Pre-Commit Checklist
- Run `make verify`. If `tools/evals/node_modules/` is missing, install it first with `npm --prefix tools/evals install`.
- Update the affected eval suite when the user-facing workflow, routing, wording contract, or artifact contract changes.
- Sweep all public contracts together when renaming a skill, command, or stage: `skills/`, manifests, `README.md`, `docs/`, `evals/`, and helper scripts.
- Keep machine-local config out of git. `.flywheel/config.local.yaml` is local-only; update `.flywheel/config.local.example.yaml` when guidance changes.
- Recheck command examples and host syntax when editing setup, troubleshooting, or workflow docs.

## Debugging Plugin Bugs
Bug reports often come from an installed plugin rather than the current checkout. Start by identifying the execution path: installed plugin, direct `--plugin-dir` load, or raw repo edits.

- Codex development installs point `~/.codex/plugins/fw` at this repo and serve from the cache under `~/.codex/plugins/cache/fw-local/fw/local/`. Use `make install/codex` to refresh both.
- Claude development installs use this repo as the marketplace source and reinstall `flywheel@flywheel`. Use `make install/claude` to refresh that state.
- If another checkout or worktree is active, use `make install/codex/force-link` or `make install/claude/force-source` before debugging code.
- Check `git status --short` early. A dirty tree can mean the repo, the installed copy, and the cached copy all differ.
- If the repo already contains the fix but the installed plugin still reproduces the bug, the install is stale. Refresh the install, reload the host session, and retest.
- If both the installed copy and the current repo reproduce the bug, fix the repo and rerun `make verify`.

## Naming Conventions
- Use lowercase kebab-case for skill directories, frontmatter `name`, helper script names, and most user-facing identifiers.
- Prefer short single-word stage names when clarity stays intact. The canonical visible loop is `start` routing into `shape`, `work`, `review`, optional `spin`, and `commit`; `shape` owns the internal `ideate`, `brainstorm`, `plan`, and `deepen` modes.
- Keep explicit compounds when shortening would make the surface worse, for example `browser-test`, `document-review`, `commit-message`, and `worktree`.
- Keep runtime skill names and eval suite ids separate when that improves clarity. Runtime commands stay `fw:<name>`; eval suites may stay prefixed, such as `fw-review`.
- Use the namespaced Flywheel command surface in docs and prompts: `$fw` or `$fw:<stage>` in Codex and `/fw:<stage>` in Claude Code. Bare `$flywheel` is accepted only as a root-router text alias for `$fw:start`; do not reintroduce legacy `/flywheel:*`, `$flywheel:*`, or ambiguous unnamespaced stage forms.
- Treat user-facing renames as contract sweeps across the repo, not single-file edits.

## Repository Docs Convention
- Requirements exploration lives in `docs/brainstorms/`.
- Saved ideation artifacts from `ideate` live in `docs/ideation/` when they are worth keeping.
- Saved research briefs from `research` live in `docs/research/` when they are worth keeping.
- Implementation plans and execution-ready follow-ups live in `docs/plans/`.
- Setup, compatibility, and troubleshooting guidance for working on Flywheel itself live in `docs/setup/`.
- Durable lessons captured by `spin` live in `docs/solutions/`.
- This repo does not currently use `docs/specs/` as a standard surface. Add it only when Flywheel needs a stable host-contract, manifest-format, or compatibility specification that should outlive a single plan or solution doc.

### Solution Categories
Categorize `docs/solutions/` from the perspective of a developer using Flywheel, not only from the perspective of a contributor editing this repo.

- `developer-experience/` is for issues that mainly affect contributors to Flywheel itself: local install loops, eval-harness ergonomics, authoring friction, and repo-maintenance workflow.
- `operational-guidance/` is for durable runtime and proof-handling guidance that the product should preserve for end users: review and verify handoffs, evidence bundles, rollout posture, incident routing, and other operational workflow patterns.
- `workflow-issues/` is for user-facing stage and skill contract decisions: command naming, router behavior, stage boundaries, review or verify expectations, commit ownership, and other workflow-surface changes.

When in doubt:
- If the lesson only matters to someone hacking on this checkout, prefer `developer-experience/`.
- If the lesson changes how Flywheel should guide review, verify, rollout, debug, or commit for plugin users, prefer `operational-guidance/` or `workflow-issues/`.

## Skill File Conventions
- Every skill must include YAML frontmatter with `name` and `description`.
- Keep `name` aligned with the directory name.
- Write `description` as “what it does” plus “when to use it.” Quote the value if it contains a colon.
- Keep `description` concise because hosts load the skill catalog before loading
  any individual skill. Target less than 150 characters on average and less than
  180 characters for any single skill; `make doctor` enforces this context
  budget.
- Prefer backtick path references such as `` `references/file.md` `` or `` `../references/file.md` `` inside `SKILL.md` files. Avoid markdown links for local reference files; they are harder for agents to resolve correctly.
- Keep large or conditional reference material in `references/` instead of inlining it into the main skill body.
- When one skill refers to another, prefer semantic wording such as “load the `document-review` skill” unless the text is intentionally teaching the published command syntax.

## Platform-Specific Variables in Skills
This plugin is authored once and packaged for multiple agent platforms. Do not rely on platform-only environment variables or string substitutions in `SKILL.md` content unless the skill also explains what to do when the value is missing, unresolved, or copied literally into another host.

- Avoid direct assumptions about variables such as `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_SKILL_DIR}`, `${CLAUDE_SESSION_ID}`, `CODEX_SANDBOX`, or `CODEX_SESSION_ID`.
- Prefer relative paths to co-located files and scripts, for example `bash scripts/my-script.sh ARG` or `` `references/schema.md` ``. That is the default authoring path because the skill directory remains the stable unit across hosts.
- If a platform variable is truly unavoidable, use a pre-resolved `!` backtick expression and add explicit fallback instructions in the skill text.

Example:

```text
**Plugin version (pre-resolved):** !`jq -r .version "${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json"`

If the line above resolved to a semantic version, use it.
Otherwise, use the versionless fallback and do not attempt to resolve the value at runtime.
```

This rule applies equally to Claude, Codex, Gemini, or any later host. A converted skill must still make sense when a platform-specific variable does not exist.

## Writing Style
- Use imperative or infinitive, verb-first instructions.
- Avoid second person. Prefer objective phrasing such as “To capture the lesson, write `docs/solutions/...`” over “You should write...”.
- State the constraint first, then the rationale.
- Keep instructions concrete and host-aware. Name exact commands, file paths, or artifacts when the repo already defines them.
- Keep workflow text honest and operational, not promotional. Skills are product code and should read like executable instructions.

## Cross-Platform User Interaction
When a skill needs user input, default to the host’s blocking question tool and keep `skills/references/host-interaction-contract.md` aligned with the same rule set.

- Known equivalents are `AskUserQuestion` in Claude Code, `request_user_input` in Codex, and `ask_user` in Gemini.
- In Claude Code, `AskUserQuestion` is a deferred tool. If its schema is not already loaded, load it through `ToolSearch` with `select:AskUserQuestion` before falling back. A pending schema load is not a valid reason to ask in plain text.
- In Codex, use `request_user_input` when the active runtime exposes it. Some edit-mode sessions do not expose that tool.
- A structured choice means a blocking tool call, not a markdown menu in chat. Ask one question at a time. Default to 2-3 portable options, recommended option first, and rely on the host’s native free-form path when it exists. Use a fourth explicit option only when the active host schema supports it; Codex `request_user_input` currently expects 2-3 explicit choices and provides its own free-form path.
- Claude Code supports multi-select with `AskUserQuestion.multiSelect`; Codex `request_user_input` is currently mutually exclusive, so use sequential single-select questions or the fallback chat protocol for genuine multi-select choices.
- If no blocking question tool exists in the active harness, or the tool call errors, present numbered options in chat and wait for the user’s reply before continuing. Never silently skip the question.
- Narrow exception: if there are 5 or more genuinely relevant options and trimming them would hide real user choice, use a numbered chat list instead of forcing the menu into the 4-option cap. Apply that only after verifying that no option can be removed, merged, or moved into nearby prose. Include a free-form hint such as “Pick a number or describe what you want.”
- Platform note: this guidance reflects current behavior as of April 2026. `AskUserQuestion` is currently deferred in Claude Code, and `request_user_input` in Codex is currently limited to plan-capable modes. Re-verify these constraints before carrying the workaround forward.

## Cross-Platform Task Tracking
- When a skill needs task tracking, describe the intent and name the host equivalent rather than hard-coding one platform’s wording.
- Known equivalents are `TaskCreate` / `TaskUpdate` / `TaskList` in Claude Code and `update_plan` in Codex.
- Do not write new guidance against legacy `TodoWrite` or `TodoRead`.

## Commit & Pull Request Guidelines
Recent history follows scoped Conventional Commits such as `feat(workflow): ...`, `feat(flywheel): ...`, and `docs(solutions): ...`.

- Choose the prefix by behavior, not file type. Markdown under `skills/` is product code, so behavior changes there are usually `feat`, `fix`, or `refactor`, not `docs`.
- Use the narrowest useful scope: `workflow`, `setup`, `review`, `logging`, or the specific skill name.
- PRs should summarize the user-facing change, list validation performed (`make verify` plus any targeted commands), and note any host-specific reinstall or reload steps.
- Include screenshots only for browser-visible or rendered-output changes. For normal workflow changes, prefer command evidence and repo artifacts.
