# flywheel

## Philosophy

Development should work like a flywheel. We spin the flywheel to preserve
momentum and maintain that momentum over time. The more we spin the wheel, the
faster it turns, the more energy it stores, and the more energy we can recover
later.

In Flywheel, the docs are that stored energy. Each time we spin the flywheel,
we add to the docs so the next task starts with more context, more reusable
structure, and less rediscovery.

Flywheel is a Codex development plugin focused on building and preserving that
momentum across the development loop.

Each cycle spins the flywheel: brainstorms sharpen plans, plans inform future
plans, reviews catch more issues, and patterns get documented.

## Workflow

```text
Brainstorm -> Plan -> Work -> Review -> Spin -> Repeat
    ^
Ideate (optional -- when you need ideas)
```

## Happy Paths

### Idea to PR

1. Start with `/fw:brainstorm` when the problem is still fuzzy.
2. Move to `/fw:plan` once the behavior and scope are clear.
3. Run `/fw:work` to implement, validate, review, and ship.
4. Let the shipping step offer `/fw:spin` for any durable lessons worth
   preserving.

### Backlog Shaping to PR

1. Start with `/fw:ideate` when you want strong next bets instead of refining
   one preselected idea.
2. Pick the best survivor and move into `/fw:brainstorm`.
3. Continue through `/fw:plan` and `/fw:work`.

### Changed Code to Safer Merge

1. Run `/fw:review` when code already exists and the immediate job is to find
   risks, regressions, and missing tests before merge.
2. If the review is clean or fixes are applied, continue into the shipping
   path.

The default loop is:

1. `Brainstorm`: refine an idea into a requirements plan through interactive
   Q&A, and short-circuit automatically when extra ceremony is not needed.
2. `Plan`: take a requirements doc from brainstorming, or a sufficiently
   detailed idea, and distill it into a technical plan that agents or humans
   can execute.
3. `Work`: execute the plan with visible progress and deliberate validation.
4. `Review`: check the result for bugs, regressions, and missing tests.
5. `Spin`: capture what was learned in docs, skills, scripts, or checklists.
6. `Repeat`: start the next task with more stored energy than before.

`/fw:brainstorm` is the main entry point into the workflow.

`Ideate` sits just before the main loop. Use it less often, when you do not yet
know what the best next move is, want proactive improvement ideas from the
codebase, or want to steer the backlog before committing to a concrete problem.

The key point is that `Spin` is not an afterthought. It is how the cycle stores
energy. Each pass through the workflow should leave behind better documentation,
clearer patterns, and less future rediscovery.

## Command surface

- `/fw:brainstorm` is the main entry point. It refines ideas into a requirements plan through interactive Q&A and short-circuits when ceremony is unnecessary.
- `/fw:plan` takes either a requirements doc from brainstorming or a detailed idea and distills it into a technical plan that agents or humans can work from.
- `/fw:work` executes plans with visible task tracking and optional worktree isolation.
- `/fw:review` reviews changes before merge with a risk-first posture.
- `/fw:spin` captures learnings so future work gets easier.
- `/fw:ideate` is used less often as a force multiplier. It grounds itself in
  the repo or topic, generates a broad candidate set, and filters it down to a
  ranked shortlist of strong next bets.

These commands are currently scaffolded as plugin skills, with matching UI-facing
metadata under each skill's `agents/openai.yaml`.

The core skills are written to work cleanly in Codex and Claude Code style
hosts: stable scaffolds first, dynamic input later, repo-grounded validation,
and reviewer extension through a registry instead of a monolithic prompt body.

## Knowledge Store

Flywheel stores solved problems and durable guidance in `docs/solutions/`.
These entries are written by `/fw:spin` and are meant to be reusable inputs for
later ideation, brainstorming, planning, implementation, and debugging.

Each solution doc uses YAML frontmatter so agents can grep cheaply before
opening the full file. The main retrieval fields are:

- `title`
- `module`
- `files_touched`
- `problem_type`
- `component`
- `tags`
- `severity`

## Eval Harness

Use the repo-local harness under `scripts/flywheel-eval.js` to validate eval
packs, stamp repeatable run directories, and summarize scored results.

```bash
node scripts/flywheel-eval.js list
node scripts/flywheel-eval.js validate
node scripts/flywheel-eval.js prepare flywheel
```

For live local CLI comparisons against Codex and Claude Code without changing
the plugin runtime surface, use the isolated workspace in `tools/evals/`.

```bash
npm --prefix tools/evals install
npm --prefix tools/evals run doctor
npm --prefix tools/evals run compare -- --suite flywheel
```

## Scaffold

- `.codex-plugin/plugin.json` defines the plugin manifest and points Codex at `./skills/`.
- `skills/flywheel/` is the umbrella routing skill for the full development flow.
- `skills/fw-*/` contains the command-backed workflow skills.
- `skills/conventional-commit/` is the shared commit-message helper used
  before Flywheel workflows commit, with an explicit user check for breaking
  change markers.
- `docs/solutions/` is the searchable knowledge store for solved problems,
  practices, and workflow learnings captured by `/fw:spin`.
- `skills/fw-review/references/reviewer-registry.yaml` is the append-only review
  registry for generic reviewers and optional stack-pack extensions.
- `tools/evals/` is the isolated live-eval workspace for local Codex and Claude
  CLI comparisons.
- `hooks/` is reserved for automation hooks that support the flow.
- `scripts/` is reserved for helper scripts used by the plugin.

## Next steps

- Tighten the skill instructions as the workflow gets exercised on real tasks.
- Add hook or script support only when repeated work proves it is needed.
- Add any product-specific slash-command registration layer if the runtime expects one beyond skill metadata.
