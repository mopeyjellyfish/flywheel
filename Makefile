SHELL := /bin/bash

.PHONY: dev/all dev/codex dev/codex/force-link dev/claude dev/claude/force-source doctor validate verify remove/all refresh/codex refresh/codex/force-link refresh/codex/dry-run remove/codex refresh/claude refresh/claude/force-source refresh/claude/project remove/claude

dev/codex:
	bash scripts/codex-refresh-local.sh
	node scripts/flywheel-doctor.js --host codex
	node scripts/flywheel-eval.js validate

dev/codex/force-link:
	bash scripts/codex-refresh-local.sh --force-link
	node scripts/flywheel-doctor.js --host codex
	node scripts/flywheel-eval.js validate

dev/all:
	bash scripts/codex-refresh-local.sh
	bash scripts/claude-refresh-local.sh --scope local
	node scripts/flywheel-doctor.js --smoke
	node scripts/flywheel-eval.js validate

dev/claude:
	bash scripts/claude-refresh-local.sh --scope local
	node scripts/flywheel-doctor.js --host claude --smoke
	node scripts/flywheel-eval.js validate

dev/claude/force-source:
	bash scripts/claude-refresh-local.sh --scope local --force-source
	node scripts/flywheel-doctor.js --host claude --smoke
	node scripts/flywheel-eval.js validate

doctor:
	node scripts/flywheel-doctor.js

validate:
	node scripts/flywheel-eval.js validate

verify:
	node scripts/flywheel-doctor.js --smoke

remove/all:
	bash scripts/codex-remove-local.sh
	bash scripts/claude-remove-local.sh

refresh/codex:
	bash scripts/codex-refresh-local.sh

refresh/codex/force-link:
	bash scripts/codex-refresh-local.sh --force-link

refresh/codex/dry-run:
	bash scripts/codex-refresh-local.sh --dry-run

remove/codex:
	bash scripts/codex-remove-local.sh

refresh/claude:
	bash scripts/claude-refresh-local.sh --scope local

refresh/claude/force-source:
	bash scripts/claude-refresh-local.sh --scope local --force-source

refresh/claude/project:
	bash scripts/claude-refresh-local.sh --scope project

remove/claude:
	bash scripts/claude-remove-local.sh
