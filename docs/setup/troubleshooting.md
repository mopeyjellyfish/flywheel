# Flywheel Troubleshooting

Use this page when Flywheel itself is the repo you are working on and something
in the local product shell is not ready.

## First Checks

Run:

```bash
make dev
```

If you need live CLI comparisons too:

```bash
npm --prefix tools/evals install
npm --prefix tools/evals run doctor
```

## Common Problems

### Flywheel is not enabled in Codex

Symptom:
- eval doctor reports no enabled `flywheel@...` plugin entry

Check:
- `~/.codex/config.toml`

Fix:
- rerun `make dev` so Flywheel can create or repair the local plugin entry, then
  start a fresh Codex session

### Codex still shows stale Flywheel skill text after local edits

Symptom:
- Codex still surfaces an older Flywheel router or older skill wording after
  you changed this repository

Check:
- `~/.codex/plugins/flywheel` points at this repo
- `~/.codex/plugins/cache/flywheel-local/` still contains an older cached copy

Fix:

```bash
make dev
```

If you only need the relink-and-cache-refresh step, use:

```bash
make codex-refresh-local
```

Then start a fresh Codex session.

### Claude local plugin runs are not available

Symptom:
- Claude-based eval runs fail before prompt execution

Check:
- `claude -p --help` includes `--plugin-dir`

Fix:
- update Claude Code, then rerun the doctor command

### Browser proof is blocked in target repos

Symptom:
- `/fw:browser-test` or `/fw:polish` reports missing `playwright-cli`

Fix:
- run `$flywheel:setup browser` in Codex, or `/fw:setup browser` in Claude,
  inside the target repo
- prefer the repo-native install path first

### GitHub review or PR work is blocked

Symptom:
- review or ship cannot fetch or update PR state

Check:
- `gh auth status`

Fix:
- authenticate `gh`, then rerun the affected Flywheel stage

### Live eval workspace is missing dependencies

Symptom:
- `npm --prefix tools/evals run doctor` fails before running checks

Fix:

```bash
npm --prefix tools/evals install
```

### Local config is not being ignored

Symptom:
- `.flywheel/config.local.yaml` appears in git status

Check:
- `.gitignore` contains `.flywheel/*.local.yaml`

Fix:
- restore that ignore rule, then keep machine-local values in the copied local
  config file rather than the tracked example

## Recovery Principle

When a later Flywheel stage discovers a missing surface, prefer routing back to
`$flywheel:setup <focus>` in Codex, or `/fw:setup <focus>` in Claude, in the
target repo instead of patching the environment ad hoc inside that later stage.
