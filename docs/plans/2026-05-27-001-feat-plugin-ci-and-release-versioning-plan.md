---
title: Plugin CI and Release Please Versioning Plan
type: feat
status: implemented
date: 2026-05-27
origin: "User request: validate Flywheel plugin packaging in PRs, then release automatically from main merges"
---

# Plugin CI and Release Please Versioning Plan

## Overview

Add a simple CI and release path for Flywheel:

- On every pull request, validate plugin formatting and host compatibility.
- Use Claude's plugin command to prove the plugin is valid for Claude Code.
- Use Codex's plugin command path to prove the marketplace package installs in
  Codex.
- Report precise PR errors with the failing file, field or command, expected
  value, and actual value.
- On `main`, run the same validation before Release Please opens or updates the
  release PR.
- When the Release Please PR is merged, run the same validation again before
  Release Please creates the `fw--vX.Y.Z` tag and GitHub Release.

## Requirements

- R1. Validate plugin formatting and cross-file consistency in PRs.
- R2. Run `claude plugin validate .` in CI.
- R3. Run Codex plugin marketplace/install validation in CI.
- R4. Use specific error output in PR checks so contributors can see what is
  invalid without reproducing locally.
- R5. On `main`, run the same validation before any release PR, tag, or release
  operation.
- R6. Bump semver from Conventional Commits, update plugin manifests, update
  `CHANGELOG.md`, tag `fw--vX.Y.Z`, and create a GitHub Release automatically.

## Scope Boundaries

- Do not require a developer's local `~/.codex` or `~/.claude` state in CI.
- Do not require Claude or Codex authentication for PR validation.
- Do not publish to an external package registry in this pass.
- Do not change Flywheel's runtime command surface.
- Do not add a bespoke semver/changelog script while Release Please can own
  versioning, changelog, tag, and release creation.

## Research Decision

Use the EveryInc plugin pattern as the model:

- `.github/release-please-config.json`
- `.github/.release-please-manifest.json`
- `googleapis/release-please-action@v4.4.0`
- `release-type: simple`
- `extra-files` JSON updaters for plugin manifests

Why Release Please:

- It is designed for Conventional Commits, changelog generation, release PRs,
  tags, and GitHub Releases.
- Its manifest mode updates arbitrary JSON fields through `extra-files`.
- It gives a reviewable release PR instead of direct same-commit mutation on
  every merge to `main`.

Why not GoReleaser for this slice:

- GoReleaser is strongest for packaging binaries and release artifacts after a
  version/tag exists.
- Flywheel's current need is version-file mutation, changelog generation, tag
  creation, and GitHub Release creation for plugin manifests.

Tag-format spike:

- Release Please 17.6.1 renders `component=fw`, `tag-separator=--`, and
  `include-v-in-tag=true` as `fw--v0.2.0`.
- Release Please also backfills exact expected tags from the manifest, so the
  manifest must remain checked and synchronized with plugin versions.
- The repository has no existing `fw--v*` release tag yet, so the initial
  config includes `bootstrap-sha` at the current `main` baseline to keep the
  first generated release PR scoped to commits after this setup lands.

## Repo Truth

- Current version-bearing plugin files are:
  - `.codex-plugin/plugin.json`
  - `.claude-plugin/plugin.json`
  - `.claude-plugin/marketplace.json`
  - `plugins/fw/.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json` points Codex marketplace installs to
  `./plugins/fw`.
- `plugins/fw/` is the Codex marketplace package. Its `.codex-plugin` manifest,
  `skills/`, and `hooks/` must match the repo-root source.
- `claude plugin validate .` validates Claude plugin and marketplace manifests.
- `claude plugin tag --dry-run --force .` reports the Claude plugin release tag
  shape as `fw--vX.Y.Z`.
- `codex plugin` currently has marketplace/list/add/remove commands, but no
  standalone `validate` subcommand. A CI-safe Codex validation therefore needs
  both a repo-owned manifest checker and a Codex CLI install smoke using an
  isolated `CODEX_HOME`.

## Validation Design

Add one small repo-owned validator:

```bash
node scripts/plugin-ci-check.js --host all
```

The validator checks repository files only and emits GitHub
annotation-friendly errors. Each failure includes:

- check name
- file path
- JSON field or package path when applicable
- expected value
- actual value
- suggested fix when obvious

The validator covers:

- all plugin, marketplace, and Release Please manifests parse as JSON
- version fields are valid SemVer
- all version-bearing plugin manifests agree
- `.github/.release-please-manifest.json` matches the current plugin version
- Release Please config uses `include-component-in-tag: true` and
  `tag-separator: "--"`
- Release Please config has an initial `bootstrap-sha` while Flywheel has no
  prior `fw--v*` tag
- Release Please root package uses `release-type: simple`, `component: fw`, and
  `package-name: fw`
- Release Please `extra-files` includes JSON updaters for all plugin
  version-bearing files
- `.codex-plugin/plugin.json` has required fields: `name`, `version`,
  `description`, `skills`, `hooks`, and `interface`
- `.claude-plugin/plugin.json` has required fields: `name`, `version`, and
  `description`
- `.claude-plugin/marketplace.json` has a plugin entry whose version matches
  `.claude-plugin/plugin.json`
- `.agents/plugins/marketplace.json` has one `fw` entry pointing at
  `./plugins/fw`
- `plugins/fw/.codex-plugin/plugin.json` exactly matches
  `.codex-plugin/plugin.json`
- `plugins/fw/skills` matches `skills`
- `plugins/fw/hooks` matches `hooks`
- stale `plugins/flywheel` does not exist

## Host CLI Checks

Claude:

```bash
claude plugin validate .
claude plugin tag --dry-run --force .
```

Codex:

```bash
tmpdir="$(mktemp -d)"
CODEX_HOME="$tmpdir" codex plugin marketplace add "$PWD"
CODEX_HOME="$tmpdir" codex plugin list --marketplace flywheel
CODEX_HOME="$tmpdir" codex plugin add fw@flywheel
rm -rf "$tmpdir"
```

## CI Workflow

Add `.github/workflows/plugin-validation.yml`.

Triggers:

- `pull_request`
- `push` to `main`
- `workflow_dispatch`

Jobs:

- `conventional-pr`
  - validate PR title as a Conventional Commit subject
- `plugin-format`
  - checkout repo
  - set up Node
  - run `node scripts/plugin-ci-check.js --host all`
  - run `node scripts/plugin-ci-check.test.js`
  - run `node scripts/flywheel-eval.js validate`
  - run `node scripts/flywheel-hook-policy.test.js`
- `claude-plugin`
  - checkout repo
  - set up Node
  - install Claude Code CLI
  - run `claude plugin validate .`
  - run `claude plugin tag --dry-run --force .`
- `codex-plugin`
  - checkout repo
  - set up Node
  - install Codex CLI
  - run the isolated `CODEX_HOME` marketplace/list/add smoke

## Release Workflow

Add `.github/workflows/release-please.yml`.

Triggers:

- `push` to `main`
- `workflow_dispatch`

Permissions:

- `contents: write`
- `pull-requests: write`
- `issues: write`

Sequence:

1. Checkout with full history and tags.
2. Set up Node.
3. Install Claude Code CLI and Codex CLI.
4. Run the same plugin-format, Claude, and Codex validation checks.
5. Run `googleapis/release-please-action@v4.4.0` with the `.github`
   config and manifest files.
6. On normal feature/fix merges to `main`, Release Please opens or updates the
   release PR containing manifest version bumps and `CHANGELOG.md`.
7. On merge of that release PR, the workflow validates the already-bumped files
   again, then Release Please creates the `fw--vX.Y.Z` tag and GitHub Release.

Token note:

- `GITHUB_TOKEN` can create release PRs and releases with the listed
  permissions.
- If release-please-created PRs must trigger further workflow runs
  immediately, use a GitHub App token or PAT because events created by
  `GITHUB_TOKEN` do not trigger new workflow runs. The workflow reads optional
  `secrets.RELEASE_PLEASE_TOKEN` first and falls back to `github.token`.

## Implementation Units

### Unit 1: Plugin Formatting Validator

Add `scripts/plugin-ci-check.js` and `scripts/plugin-ci-check.test.js`.

Test posture: `tdd`

Done when:

- `node scripts/plugin-ci-check.js --host all` passes on the repo
- deliberate fixture failures produce specific file and field errors
- Release Please config and manifest drift produce specific errors

### Unit 2: Host CLI Validation Workflow

Add `.github/workflows/plugin-validation.yml`.

Test posture: `configuration with targeted command validation`

Done when:

- PR workflow has separate conventional-pr, plugin-format, claude-plugin, and
  codex-plugin jobs
- Claude job runs `claude plugin validate .`
- Codex job installs `fw@flywheel` from this repo through isolated `CODEX_HOME`
- failed repo-owned checks produce GitHub annotations and step-summary details

### Unit 3: Release Please Manifest Workflow

Add `.github/release-please-config.json`,
`.github/.release-please-manifest.json`, and
`.github/workflows/release-please.yml`.

Test posture: `configuration with release-please tag-format spike`

Done when:

- Release Please config updates every plugin version-bearing JSON field
- Release Please manifest matches the current plugin version
- Release Please config produces `fw--vX.Y.Z` tags
- release workflow validates plugin formatting, Claude, and Codex before
  invoking Release Please

## Acceptance Criteria

- PRs fail on invalid plugin formatting with precise error output.
- PRs fail when Claude rejects the plugin.
- PRs fail when Codex cannot install the plugin from the repo marketplace.
- PRs fail when the PR title is not a Conventional Commit subject.
- `main` release automation runs the same checks before release work.
- Release Please bumps semver from Conventional Commits.
- Release Please updates plugin manifests and `CHANGELOG.md`.
- Release Please creates the `fw--vX.Y.Z` tag and GitHub Release.
