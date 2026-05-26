---
name: browser-test
description: "Run browser acceptance checks with playwright-cli. Use when browser-visible behavior needs fresh proof before review or commit."
metadata:
  argument-hint: "[url, local route, changed flow, or blank to inspect current web surface]"
---

# Browser Test

`$fw:browser-test` is Flywheel's browser-proof workflow.

Use it when the work changes observable browser behavior and you need fresh
evidence rather than assumptions.

This skill prefers `playwright-cli` for browser automation. It is the default
browser-proof path for Flywheel because it is lightweight, CLI-native, and
works cleanly with frontier coding agents.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Call the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When the workflow spans multiple material steps, use the host task-tracking
tool named in `../references/host-interaction-contract.md` to create and
maintain a short task list.

Ask one question at a time. When multiple browser-proof paths are viable,
present the recommended label first and rely on the host's native freeform
final path when it exists.

## Input

<browser_test_input> #$ARGUMENTS </browser_test_input>

Interpret the input as one of:

- a URL or route to verify
- a changed user flow or browser-visible feature
- a request for smoke, happy-path, regression, or acceptance testing
- a blank request to inspect repo truth and find the most likely web surface

## Reference Loading Map

Do not preload every reference. Load only what the current phase needs:

- Read `references/dev-server-detection.md` when the local target URL or dev
  command must be discovered.
- Read `references/scenario-shape.md` when deciding which browser scenarios to
  run.
- Read `references/evidence-contract.md` when deciding what artifacts to keep.
- Read `../commit/references/evidence-bundle.md` when browser proof should be
  handed off into review or commit.

## Core Principles

1. **Fresh browser proof beats verbal confidence** - if behavior changed, prove
   it on the real page.
2. **Use repo truth for the target surface** - discover the actual local URL,
   route, or dev command from the repo before improvising one.
3. **Small scenario set, high signal** - smoke plus the changed path beats a
   giant brittle checklist.
4. **Capture artifacts that help later stages** - snapshots, screenshots,
   console, network, and traces should make review and commit easier.
5. **Do not silently invent a browser stack** - if the repo has no web surface
   or no runnable target, say so clearly.
6. **Treat evidence as potentially sensitive** - avoid capturing or sharing
   auth headers, cookies, tokens, session state, or raw sensitive payloads
   unless you are highly confident the artifact is clean or the user explicitly
   asks and the artifact is kept local, redacted, or replaced with dummy data.

## Workflow

### Phase 1: Touch Grass

Ground the browser target in repo truth:

- read `AGENTS.md` and `CLAUDE.md` when present
- inspect nearby app manifests, scripts, Makefiles, CI workflows, and docs
- inspect Playwright config or tests when the repo already uses Playwright
- read `.flywheel/config.local.yaml` when present for `base_url`,
  `dev_command`, browser mode, evidence directory, evidence level, or
  sensitivity settings

Read `references/dev-server-detection.md` only when you need help discovering
the local target URL or dev command.

Determine:

- whether the change is actually browser-visible
- the best target surface: direct URL, local route, or local dev server
- whether the dev server is already running or must be started
- whether the repo already has browser-proof conventions to follow

### Phase 2: Confirm Browser Capability

Prefer this order:

1. `playwright-cli`
2. `npx --no-install playwright-cli`

If neither is available, stop and route to `$fw:setup browser` with the
repo-proven install path or a pinned fallback chosen there:

```text
Browser proof is blocked: `playwright-cli` was not found.
```

When a reusable session name is helpful, derive it from repo + branch or use
the configured `session_prefix`.

### Phase 3: Choose Scenario Shape

Read `references/scenario-shape.md`.

Choose the smallest honest scenario set:

- **Smoke** - page loads, no console explosions, primary surface renders
- **Changed happy path** - the flow the change was meant to improve
- **Regression reproduction** - only when fixing a bug or validating a risky
  interaction
- Freeform path when the repo needs a different scenario shape

For browser-visible feature work, at least one scenario must exercise the
changed behavior directly.

### Phase 4: Run Browser Proof With `playwright-cli`

Use `playwright-cli` for the interaction loop:

- `open` or `goto` the target
- `snapshot` to capture the page state and element refs
- interact with refs or stable selectors
- use `console` or `network` when errors or failing requests matter
- use `tracing-start` and `tracing-stop` when failures are flaky or timing-
  sensitive
- use `screenshot` when visible proof is materially useful

Keep evidence under a local artifact directory, preferably:

```text
.context/flywheel/browser/<run-id>/
```

Read `references/evidence-contract.md` before deciding what to save.
Read `../commit/references/evidence-bundle.md` when the run should leave a
reusable handoff for `$fw:review` or `$fw:commit`.

Default to the smallest safe evidence set. Unless failure analysis or the user
clearly requires more, prefer screenshots or snapshots over raw console,
network, or trace captures.

Never include auth headers, cookies, bearer tokens, CSRF tokens, passwords,
session identifiers, or unredacted sensitive payloads in the saved evidence set
or in the final report. Payloads, traces, or request examples may be shared
when you are above 90% confident they contain no secrets and no meaningful PII.
If a failing scenario truly requires network or trace data but that confidence
is not there, keep it local, summarize the useful signal, and redact or replace
sensitive fields with dummy values before handing it to `$fw:review` or
`$fw:commit`.

When the run produces proof that downstream stages should reuse, create or
update a shared evidence bundle under:

```text
.context/flywheel/evidence/<bundle-id>/
```

Keep `summary.md` short and human-readable:

- identify the target surface and scenario
- list only the evidence items worth reusing
- mark each item as `clean`, `redacted`, or `local-only`
- keep raw browser artifacts in the browser directory and reference them from
  the summary instead of copying them

### Phase 5: Report

Return a concise browser-proof brief:

1. **Target surface** - URL, route, or app surface tested
2. **Scenarios run** - what was exercised
3. **Verdict** - passed, failed, or blocked
4. **Evidence** - sanitized artifacts, plus the shared evidence-bundle path
   when one was created; clean payload, trace, or network evidence only when
   confidence is high enough, otherwise use redacted or dummy-substituted
   examples
5. **Observed issues** - concrete failures, regressions, or surprises
6. **Next move** - `$fw:work`, `$fw:review`, `$fw:commit`, or another test pass

If the browser-visible change passed, call that out plainly so review and
commit can reuse the evidence.

If the run is blocked because browser tooling is missing, say that plainly and
route to `$fw:setup browser` instead of implying the app or test flow failed.

---

## Included References

@./references/dev-server-detection.md
@./references/scenario-shape.md
@./references/evidence-contract.md
@../commit/references/evidence-bundle.md
