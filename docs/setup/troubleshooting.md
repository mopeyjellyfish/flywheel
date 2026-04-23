# Flywheel Troubleshooting

Use this page when Flywheel itself is the repo you are working on and something
in the local product shell is not ready.

## First Checks

Run:

```bash
make install/codex
```

If you need live CLI comparisons too:

```bash
npm --prefix tools/evals install
npm --prefix tools/evals run doctor
```

If a clean host state is more useful than a repair pass:

```bash
make uninstall/all
```

## Common Problems

### Flywheel is not enabled in Codex

Symptom:
- eval doctor reports no enabled `flywheel@...` plugin entry

Check:
- `~/.codex/config.toml`
- `node scripts/flywheel-doctor.js --host codex`

Fix:
- rerun `make install/codex` so Flywheel can create or repair the local plugin entry, then
  start a fresh Codex session

### Codex still shows stale Flywheel skill text after local edits

Symptom:
- Codex still surfaces an older Flywheel router or older skill wording after
  you changed this repository

Check:
- `~/.codex/plugins/fw` points at this repo
- `~/.codex/plugins/cache/fw-local/` still contains an older cached copy

Fix:

```bash
make install/codex
```

If you only need the relink-and-cache-refresh step, use:

```bash
make install/codex/refresh
```

Then start a fresh Codex session.

To verify the restarted session now exposes Flywheel:

```bash
node scripts/flywheel-doctor.js --host codex --codex-session-smoke
```

### Codex hook guardrails are not active

Symptom:
- dangerous Bash commands are not blocked
- Codex does not show Flywheel policy reminders before commit or push

Check:
- `~/.codex/config.toml` contains `[features]` with `codex_hooks = true`
- `~/.codex/hooks.json` contains the Flywheel `flywheel-hook-policy.js` entry
- `node scripts/flywheel-doctor.js --host codex`

Fix:

```bash
make install/codex/refresh
```

Then start a fresh Codex session.

Note:
- current Codex hooks are experimental and Bash-focused
- Codex can hard-block destructive Bash commands, but commit and push policy
  checkpoints may degrade to warnings when the host cannot honestly enforce an
  ask gate

### Need a clean Flywheel install state before retesting

Symptom:
- `make install/codex`, `make install/claude`, or direct host checks are picking up earlier
  Flywheel install state
- a clean reinstall is easier than debugging the current host state

Fix:

```bash
make uninstall/all
```

If only one host needs cleanup:

```bash
make uninstall/codex
make uninstall/claude
```

Then rerun `make install/codex` or `make install/claude` and restart the relevant host
session.

### Flywheel skills still appear after uninstall

Symptom:
- Flywheel still appears in Codex or Claude after `make uninstall/all`
- `npx skills remove ... --all` did not remove the expected install

Check:
- `npx skills ls -g`
- `npx skills ls`
- `~/.agents/.skill-lock.json`
- `./skills-lock.json`

Fix:

```bash
make uninstall/skills
```

If a full cleanup is easier:

```bash
make uninstall/all
```

Note:
- `skills remove --all` means “all skills in that scope,” not “all skills from one package”
- Flywheel's uninstall helper reads the `skills` lock files and also removes
  stale unlocked global Flywheel directories when their skill text fingerprints
  match this repo's local skills
- inside the Flywheel repo, project-scope removal is skipped because `./skills`
  is the authored product source tree, not disposable installed output
- inside the Flywheel repo, project-scope install validates `./skills` and then
  exits without running `skills add` back into the same tree

### Local `make install/all` fell back to the published skills package

Symptom:
- `make install/skills/global` installs `mopeyjellyfish/flywheel`
  instead of the current checkout
- local edits under this repo are not reflected in the `npx skills` install

Check:
- `find skills -maxdepth 2 -name SKILL.md`
- `git status --short skills`

Fix:
- restore or regenerate the local `skills/` tree so this checkout actually has
  installable `skills/*/SKILL.md` entries
- rerun `make install/skills/global`

Note:
- local development targets now fail fast when `skills/` is missing or empty
- use the published `npx skills add mopeyjellyfish/flywheel ...` command only
  when the goal is explicitly to test the remote package
- Codex should use `make install/codex`; standalone global Flywheel skills show
  up in Codex as unnamespaced commands such as `$start`

### Codex still shows `$start`

Symptom:
- Codex lists a plain `start` skill from `~/.agents/skills/start`
- the same session also sees the correct plugin skill at
  `~/.codex/plugins/cache/fw-local/fw/local/skills/start/SKILL.md`

Cause:
- standalone global Flywheel skills were installed through the `skills` CLI,
  usually from the published package, and Codex loads them as unnamespaced
  skills

Fix:
- run `make install/codex`
- start a fresh Codex session
- verify with `node scripts/flywheel-doctor.js --host codex`; the
  `No standalone Flywheel skills in Codex` check should pass

### Claude installed Flywheel is not available

Symptom:
- `claude plugin list --json` does not show `flywheel@flywheel`
- Claude reports `Unknown command: /fw:start`
- Claude shows `/plan` or `/run`, but you are not sure whether Flywheel itself
  is registered

Check:
- `claude plugin validate .`
- `claude plugin list --json`
- `node scripts/flywheel-doctor.js --host claude --smoke`

Fix:
- rerun `make install/claude`
- if the `flywheel` marketplace points at another checkout, rerun
  `make install/claude/force-source`
- for a project-scoped install from this repo, run `make install/claude/refresh/project`
- then run `/reload-plugins` in Claude Code or start a fresh Claude session

Note:
- Flywheel's Claude contract is `/fw:<stage>`
- bare `/plan`, `/run`, or `/commit` commands can come from Claude built-ins or
  other plugins and are not proof of Flywheel registration by themselves
- broad `make verify` skips the installed Claude smoke if this checkout is not
  currently enabled in Claude; use the explicit `--host claude --smoke` path to
  require the installed Claude surface

### Claude callable smoke fails with 401

Symptom:
- `node scripts/flywheel-doctor.js --host claude --smoke` fails with
  `Failed to authenticate. API Error: 401`
- `make install/all` or broad `make verify` has already verified the Claude
  plugin install and `/fw:*` command registration

Check:
- `claude auth status`

Fix:
- run `claude auth login`, then rerun
  `node scripts/flywheel-doctor.js --host claude --smoke`

Note:
- broad verification treats Claude API auth failure as an environment-auth
  skip, not an install failure
- explicit `--host claude --smoke` remains strict and fails until Claude can
  complete a live invocation

### Claude hook guardrails are missing

Symptom:
- Claude loads Flywheel skills, but risky-edge confirmations do not appear
- local plugin validation passes, but hook behavior is absent

Check:
- `hooks/hooks.json` exists in this checkout
- `claude plugin validate .`
- `/hooks` in Claude Code shows Flywheel plugin hooks after install

Fix:
- rerun `make install/claude`
- then run `/reload-plugins` in Claude Code or start a fresh Claude session

Note:
- Claude plugin hooks are bundled from the plugin root `hooks/hooks.json`
- Flywheel keeps those hooks thin: destructive-deny plus confirm gates at
  commit or push checkpoints when repo-local policy requires them

### Claude direct `--plugin-dir` runs are not available

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
- run `$fw:setup browser` in Codex, or `/fw:setup browser` in Claude,
  inside the target repo
- prefer the repo-native install path first

### GitHub review or PR work is blocked

Symptom:
- review or commit cannot fetch or update PR state

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
`$fw:setup <focus>` in Codex, or `/fw:setup <focus>` in Claude, in the
target repo instead of patching the environment ad hoc inside that later stage.
