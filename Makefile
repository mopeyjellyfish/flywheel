SHELL := /bin/bash

.PHONY: install/all install/codex install/codex/force-link install/codex/refresh install/codex/refresh/force-link install/codex/refresh/dry-run install/claude install/claude/force-source install/claude/refresh install/claude/refresh/force-source install/claude/refresh/project install/skills/global install/skills/project uninstall/all uninstall/codex uninstall/claude uninstall/skills uninstall/skills/global uninstall/skills/project doctor validate verify

install/codex:
	bash scripts/codex-refresh-local.sh
	node scripts/flywheel-doctor.js --host codex
	node scripts/flywheel-eval.js validate

install/codex/force-link:
	bash scripts/codex-refresh-local.sh --force-link
	node scripts/flywheel-doctor.js --host codex
	node scripts/flywheel-eval.js validate

install/all:
	bash scripts/skills-install.sh --scope global --source local
	bash scripts/codex-refresh-local.sh
	bash scripts/claude-refresh-local.sh --scope local
	node scripts/flywheel-doctor.js --smoke
	node scripts/flywheel-eval.js validate

install/claude:
	bash scripts/claude-refresh-local.sh --scope local
	node scripts/flywheel-doctor.js --host claude --smoke
	node scripts/flywheel-eval.js validate

install/claude/force-source:
	bash scripts/claude-refresh-local.sh --scope local --force-source
	node scripts/flywheel-doctor.js --host claude --smoke
	node scripts/flywheel-eval.js validate

doctor:
	node scripts/flywheel-doctor.js

validate:
	node scripts/flywheel-eval.js validate

verify:
	node scripts/flywheel-doctor.js --smoke

uninstall/all:
	bash scripts/skills-remove.sh --scope all
	bash scripts/codex-remove-local.sh
	bash scripts/claude-remove-local.sh

install/skills/global:
	bash scripts/skills-install.sh --scope global --source local

install/skills/project:
	bash scripts/skills-install.sh --scope project --source local

install/codex/refresh:
	bash scripts/codex-refresh-local.sh

install/codex/refresh/force-link:
	bash scripts/codex-refresh-local.sh --force-link

install/codex/refresh/dry-run:
	bash scripts/codex-refresh-local.sh --dry-run

uninstall/codex:
	bash scripts/codex-remove-local.sh

uninstall/skills:
	bash scripts/skills-remove.sh --scope all

uninstall/skills/global:
	bash scripts/skills-remove.sh --scope global

uninstall/skills/project:
	bash scripts/skills-remove.sh --scope project

install/claude/refresh:
	bash scripts/claude-refresh-local.sh --scope local

install/claude/refresh/force-source:
	bash scripts/claude-refresh-local.sh --scope local --force-source

install/claude/refresh/project:
	bash scripts/claude-refresh-local.sh --scope project

uninstall/claude:
	bash scripts/claude-remove-local.sh
