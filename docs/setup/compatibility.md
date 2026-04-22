# Flywheel Compatibility

Flywheel is currently optimized for local development and validation in:

- Codex CLI
- Claude Code

Other hosts are not first-class in this repository yet. That is a deliberate
product choice while the workflow and operational surfaces are still evolving.

## Current Support Posture

| Surface | Codex CLI | Claude Code | Notes |
| --- | --- | --- | --- |
| Core Flywheel skill workflow | Supported | Supported | Skills are authored to stay host-compatible and low-context |
| Repeatable installed usage from this checkout | Supported | Supported | Codex installs from `.codex-plugin/plugin.json`; Claude installs from this repo through `.claude-plugin/marketplace.json` |
| Dev-only direct loading from this checkout | Supported | Supported | Codex uses the local plugin config + cache refresh loop; Claude also supports `--plugin-dir` for direct local runs |
| Risky-edge hook guardrails | Supported with global `~/.codex/hooks.json` | Supported with bundled `hooks/hooks.json` | Codex hooks are experimental and currently Bash-focused; Claude supports bundled plugin hooks directly |
| Eval harness validation | Supported | Supported | Requires local CLI install and auth for the relevant runner |
| Side-by-side live comparison | Supported | Supported | Run from `tools/evals/` after installing workspace deps |

Flywheel is authored once in the repo-root `skills/` tree. `.codex-plugin/`
and `.claude-plugin/` package that same workflow for different hosts; they are
not separate workflow forks.

The interaction contract is also shared: Claude Code should use
`AskUserQuestion`, Codex should use `request_user_input` when the active
runtime exposes it, and OpenCode should use `question`. Interactive skills
should avoid raw-number reply prompts and rely on the host's native freeform
final path when it exists.

## Local Development Loop

Claude installed local checkout:

```bash
make claude-dev
```

The narrower Claude refresh helper is:

```bash
make claude-refresh-local
```

For dev-only direct Claude loading:

```bash
claude --plugin-dir /absolute/path/to/flywheel
```

Claude's canonical Flywheel contract is `/flywheel:<stage>`. Bare slash
commands such as `/plan`, `/run`, or `/commit` may be built-ins or come from
other plugins, so verify Flywheel through the namespaced surface and the doctor
commands rather than menu overlap.

Codex local checkout from this repository:

```bash
make dev
```

`make dev` refreshes the local Flywheel plugin install shape for this checkout,
clears the local cache, ensures the local `flywheel@flywheel-local` Codex
plugin entry is enabled, turns on the experimental Codex hooks feature, merges
the Flywheel PreToolUse guardrail into `~/.codex/hooks.json`, runs the repo
doctor, and validates all eval suites. Start a fresh Codex session afterward
so the refreshed plugin and hook state is loaded.

To switch to another Flywheel checkout or worktree:

Claude:

```bash
make claude-dev-force-source
```

Codex, from that checkout:

```bash
make dev-force-link
```

Use the narrower targets when you only need one part of the loop:

```bash
make codex-refresh-local
make codex-refresh-local-force-link
make claude-refresh-local
make claude-refresh-local-force-source
make claude-refresh-project
make doctor
make validate
```

To confirm a freshly restarted Codex session has loaded the live Flywheel
surface:

```bash
node scripts/flywheel-doctor.js --host codex --codex-session-smoke
```

For live local comparisons:

```bash
npm --prefix tools/evals install
npm --prefix tools/evals run doctor
npm --prefix tools/evals run compare -- --suite flywheel
```

To verify the installed Claude command surface from this checkout:

```bash
node scripts/flywheel-doctor.js --host claude --smoke
```

## Intentional Non-Goals For Now

- broad editor or public marketplace distribution beyond Codex and Claude Code
- always-loaded host-wide instruction files
- host-specific workflow forks when a shared skill surface is sufficient
- pretending Codex hook enforcement is as complete as Claude's richer hook
  surface when current Codex support is still Bash-only guardrails

## Related Docs

- [Troubleshooting](troubleshooting.md)
- [README](../../README.md)
