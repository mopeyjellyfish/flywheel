---
title: Treat Claude Auth as Environmental in Broad Doctor Smoke
date: 2026-04-23
category: developer-experience
module: flywheel-doctor-smoke
problem_type: developer_experience
component: test_harness
severity: medium
doc_status: active
files_touched:
  - scripts/flywheel-doctor.js
  - tools/evals/src/doctor.cjs
  - README.md
  - docs/setup/compatibility.md
  - docs/setup/troubleshooting.md
applies_when:
  - broad install or verify targets run doctor smoke checks for multiple hosts
  - a live Claude invocation fails because Claude API credentials are invalid
  - explicit host-specific smoke should still prove the Claude callable path
symptoms:
  - `make install/all` fails even though Codex and Claude plugin installation succeeded
  - `Flywheel callable in Claude` reports `Failed to authenticate. API Error: 401`
  - the same auth failure appears in both top-level doctor output and `tools/evals` doctor output
root_cause: wrong_api_assumption
resolution_type: workflow_improvement
tags:
  - doctor-smoke
  - claude-auth
  - install-all
  - eval-harness
  - host-verification
related_docs:
  - docs/solutions/developer-experience/protect-authored-skills-during-npx-skills-cleanup-2026-04-23.md
  - docs/solutions/workflow-issues/use-install-and-uninstall-for-local-plugin-make-targets-2026-04-22.md
---

# Treat Claude Auth as Environmental in Broad Doctor Smoke

## Context

Flywheel's broad install and verification paths run doctor checks across Codex
and Claude. During local install work, `make install/all` successfully refreshed
the local skills package, Codex plugin state, Claude marketplace, and Claude
plugin registration, but still failed because the live Claude prompt invocation
returned `401 authentication_error`.

That was not an install failure. It was an environment-auth failure in the
developer's Claude account state. Treating it as an install failure made the
broad target noisy and blocked unrelated install verification.

## Guidance

Separate install-surface verification from live account-auth verification.

Use this policy:

- broad `--host all --smoke`, `make verify`, and `make install/all` should
  verify repository packaging, plugin installation, command registration, Codex
  hooks, and eval-suite validity
- broad verification may downgrade only Claude API-auth failures from the live
  callable smoke when the plugin install and `/fw:*` command registration are
  already verified
- explicit `node scripts/flywheel-doctor.js --host claude --smoke` remains
  strict and must fail until Claude can complete a live invocation
- top-level `scripts/flywheel-doctor.js` and `tools/evals/src/doctor.cjs` must
  use the same classification so one doctor does not pass while the other fails

Only skip failures that clearly match Claude authentication, such as:

```text
Failed to authenticate
API Error: 401
authentication_error
Invalid authentication credentials
```

Do not skip unknown-command failures, missing plugin registration, missing
`--plugin-dir` support, malformed command metadata, or other install-surface
failures. Those still indicate Flywheel may not be available in Claude.

## Why This Matters

Broad verification answers "is the Flywheel repo install shape healthy across
hosts?" It should not require every developer's Claude account token to be
valid before proving Codex setup, plugin metadata, or eval-suite structure.

The explicit Claude smoke answers a different question: "can this machine invoke
Flywheel through Claude right now?" That path must remain strict because it is
the only check that proves live Claude execution.

Keeping those two questions separate makes `make install/all` useful for local
setup loops while preserving a strict command for Claude-specific validation.

## When to Apply

- when changing `scripts/flywheel-doctor.js`
- when changing `tools/evals/src/doctor.cjs`
- when a broad Make target fails only because Claude returned a 401
- when adding new host-specific smoke checks that depend on account auth

## Examples

Broad verification should pass with a clear skip when only Claude auth is bad:

```text
OK  Flywheel callable in Claude - skipped in broad verification because Claude returned an API authentication error (401). Plugin install and /fw:* command registration were verified.
```

Explicit Claude verification should still fail until auth is fixed:

```text
node scripts/flywheel-doctor.js --host claude --smoke
FAIL  Flywheel callable in Claude - Failed to authenticate. API Error: 401
```

After `claude auth login`, the same explicit check should prove the callable
surface:

```text
OK  Flywheel callable in Claude - /fw:start executed through the installed Claude plugin
```

## Related

- [Protect authored skills during npx skills cleanup](docs/solutions/developer-experience/protect-authored-skills-during-npx-skills-cleanup-2026-04-23.md)
- [Use install and uninstall for local plugin Make targets](docs/solutions/workflow-issues/use-install-and-uninstall-for-local-plugin-make-targets-2026-04-22.md)
