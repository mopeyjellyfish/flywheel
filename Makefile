SHELL := /bin/bash

.PHONY: dev dev-force-link dev-all claude-dev claude-dev-force-source doctor validate codex-refresh-local codex-refresh-local-force-link codex-refresh-local-dry-run claude-refresh-local claude-refresh-local-force-source claude-refresh-project

dev:
	bash scripts/codex-refresh-local.sh
	node scripts/flywheel-doctor.js --host codex
	node scripts/flywheel-eval.js validate

dev-force-link:
	bash scripts/codex-refresh-local.sh --force-link
	node scripts/flywheel-doctor.js --host codex
	node scripts/flywheel-eval.js validate

dev-all:
	bash scripts/codex-refresh-local.sh
	bash scripts/claude-refresh-local.sh --scope local
	node scripts/flywheel-doctor.js --smoke
	node scripts/flywheel-eval.js validate

claude-dev:
	bash scripts/claude-refresh-local.sh --scope local
	node scripts/flywheel-doctor.js --host claude --smoke
	node scripts/flywheel-eval.js validate

claude-dev-force-source:
	bash scripts/claude-refresh-local.sh --scope local --force-source
	node scripts/flywheel-doctor.js --host claude --smoke
	node scripts/flywheel-eval.js validate

doctor:
	node scripts/flywheel-doctor.js

validate:
	node scripts/flywheel-eval.js validate

codex-refresh-local:
	bash scripts/codex-refresh-local.sh

codex-refresh-local-force-link:
	bash scripts/codex-refresh-local.sh --force-link

codex-refresh-local-dry-run:
	bash scripts/codex-refresh-local.sh --dry-run

claude-refresh-local:
	bash scripts/claude-refresh-local.sh --scope local

claude-refresh-local-force-source:
	bash scripts/claude-refresh-local.sh --scope local --force-source

claude-refresh-project:
	bash scripts/claude-refresh-local.sh --scope project
