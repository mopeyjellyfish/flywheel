SHELL := /bin/bash

.PHONY: dev dev-force-link doctor validate codex-refresh-local codex-refresh-local-force-link codex-refresh-local-dry-run

dev:
	bash scripts/codex-refresh-local.sh
	node scripts/flywheel-doctor.js
	node scripts/flywheel-eval.js validate

dev-force-link:
	bash scripts/codex-refresh-local.sh --force-link
	node scripts/flywheel-doctor.js
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
