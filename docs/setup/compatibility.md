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
| Local plugin development from this checkout | Supported | Supported | Codex uses installed local plugin config; Claude supports `--plugin-dir` on this machine |
| Eval harness validation | Supported | Supported | Requires local CLI install and auth for the relevant runner |
| Side-by-side live comparison | Supported | Supported | Run from `tools/evals/` after installing workspace deps |

## Local Development Loop

Claude local checkout:

```bash
claude --plugin-dir /absolute/path/to/flywheel
```

Codex local checkout from this repository:

```bash
make dev
```

`make dev` refreshes the local Flywheel plugin install shape for this checkout,
clears the local cache, ensures the local `flywheel@flywheel-local` Codex
plugin entry is enabled, runs the repo doctor, and validates all eval suites.
Start a fresh Codex session afterward so the refreshed plugin state is loaded.

To switch to another Flywheel checkout or worktree:

Claude:

```bash
claude --plugin-dir /path/to/other/flywheel
```

Codex, from that checkout:

```bash
make dev-force-link
```

Use the narrower targets when you only need one part of the loop:

```bash
make codex-refresh-local
make codex-refresh-local-force-link
make doctor
make validate
```

For live local comparisons:

```bash
npm --prefix tools/evals install
npm --prefix tools/evals run doctor
npm --prefix tools/evals run compare -- --suite flywheel
```

## Intentional Non-Goals For Now

- broad editor or marketplace packaging beyond Codex and Claude Code
- always-loaded host-wide instruction files
- host-specific workflow forks when a shared skill surface is sufficient

## Related Docs

- [Troubleshooting](troubleshooting.md)
- [README](../../README.md)
