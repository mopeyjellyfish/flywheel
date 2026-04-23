#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  claude-refresh-local.sh [--scope local|project|user] [--force-source]

Refresh the local Flywheel plugin install for Claude Code development by:
  1. ensuring the Flywheel marketplace points at this repo
  2. refreshing that marketplace
  3. reinstalling flywheel@flywheel at the chosen scope, including the bundled
     hook pack at hooks/hooks.json

This is a development helper for working on Flywheel itself. It does not hot
reload an already-running Claude session.

Options:
  --scope <scope>   Install scope: local, project, or user (default: local)
  --force-source    Replace an existing flywheel marketplace if it points
                    somewhere else
  -h, --help        Show this help
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd -P)"
MARKETPLACE_NAME="flywheel"
PRIMARY_PLUGIN_ID="flywheel@flywheel"
LEGACY_PLUGIN_ID="fw@flywheel"
CLAUDE_SCOPE="local"
FORCE_SOURCE=0

ensure_repo_shape() {
  if [ ! -f "$REPO_ROOT/.claude-plugin/plugin.json" ]; then
    echo "ERROR: expected .claude-plugin/plugin.json under $REPO_ROOT" >&2
    exit 1
  fi

  if [ ! -f "$REPO_ROOT/.claude-plugin/marketplace.json" ]; then
    echo "ERROR: expected .claude-plugin/marketplace.json under $REPO_ROOT" >&2
    exit 1
  fi

  if [ ! -f "$REPO_ROOT/hooks/hooks.json" ]; then
    echo "ERROR: expected hooks/hooks.json under $REPO_ROOT" >&2
    exit 1
  fi
}

marketplace_state() {
  local json
  json="$(claude plugin marketplace list --json 2>/dev/null || echo '[]')"

  MARKETPLACE_LIST_JSON="$json" REPO_ROOT="$REPO_ROOT" MARKETPLACE_NAME="$MARKETPLACE_NAME" node <<'NODE'
const path = require("path");

const items = JSON.parse(process.env.MARKETPLACE_LIST_JSON || "[]");
const repoRoot = path.resolve(process.env.REPO_ROOT || ".");
const marketplaceName = process.env.MARKETPLACE_NAME;
const match = items.find((item) => item.name === marketplaceName);

if (!match) {
  console.log("missing");
  process.exit(0);
}

const source = String(match.source || "");
const sourcePath = match.path || match.directory || match.sourcePath || "";
if (source === "directory" || sourcePath) {
  const normalized = path.resolve(sourcePath);
  console.log(normalized === repoRoot ? "matching" : `different:${normalized}`);
  process.exit(0);
}

const detail = match.repo || match.url || match.installLocation || source || "unknown";
console.log(`different:${detail}`);
NODE
}

plugin_installed_at_scope() {
  local plugin_id="$1"
  local json
  json="$(claude plugin list --json 2>/dev/null || echo '[]')"

  CLAUDE_PLUGIN_LIST_JSON="$json" PLUGIN_ID="$plugin_id" CLAUDE_SCOPE="$CLAUDE_SCOPE" node <<'NODE'
const items = JSON.parse(process.env.CLAUDE_PLUGIN_LIST_JSON || "[]");
const pluginId = process.env.PLUGIN_ID;
const scope = process.env.CLAUDE_SCOPE;
const match = items.find((item) => item.id === pluginId && item.scope === scope);
process.stdout.write(match ? "yes" : "no");
NODE
}

ensure_marketplace() {
  local state
  state="$(marketplace_state)"

  case "$state" in
    missing)
      claude plugin marketplace add "$REPO_ROOT" --scope "$CLAUDE_SCOPE"
      echo "OK  added Flywheel marketplace from $REPO_ROOT"
      ;;
    matching)
      claude plugin marketplace update "$MARKETPLACE_NAME"
      echo "OK  refreshed Flywheel marketplace from $REPO_ROOT"
      ;;
    different:*)
      if [ "$FORCE_SOURCE" -ne 1 ]; then
        echo "ERROR: marketplace $MARKETPLACE_NAME points somewhere else (${state#different:})" >&2
        echo "Re-run with --force-source to replace it with $REPO_ROOT." >&2
        exit 1
      fi

      claude plugin marketplace remove "$MARKETPLACE_NAME"
      claude plugin marketplace add "$REPO_ROOT" --scope "$CLAUDE_SCOPE"
      echo "OK  replaced Flywheel marketplace source with $REPO_ROOT"
      ;;
    *)
      echo "ERROR: unexpected marketplace state: $state" >&2
      exit 1
      ;;
  esac
}

reinstall_plugin() {
  if [ "$(plugin_installed_at_scope "$PRIMARY_PLUGIN_ID")" = "yes" ]; then
    claude plugin uninstall "$PRIMARY_PLUGIN_ID" --scope "$CLAUDE_SCOPE" >/dev/null
    echo "OK  removed existing $PRIMARY_PLUGIN_ID install at $CLAUDE_SCOPE scope"
  fi

  if [ "$(plugin_installed_at_scope "$LEGACY_PLUGIN_ID")" = "yes" ]; then
    claude plugin uninstall "$LEGACY_PLUGIN_ID" --scope "$CLAUDE_SCOPE" >/dev/null
    echo "OK  removed legacy $LEGACY_PLUGIN_ID install at $CLAUDE_SCOPE scope"
  fi

  claude plugin install "$PRIMARY_PLUGIN_ID" --scope "$CLAUDE_SCOPE"
  echo "OK  installed $PRIMARY_PLUGIN_ID at $CLAUDE_SCOPE scope"
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --scope)
      shift
      if [ "$#" -eq 0 ]; then
        echo "ERROR: --scope requires a value" >&2
        usage >&2
        exit 1
      fi
      case "$1" in
        local|project|user)
          CLAUDE_SCOPE="$1"
          ;;
        *)
          echo "ERROR: unsupported scope: $1" >&2
          usage >&2
          exit 1
          ;;
      esac
      ;;
    --force-source)
      FORCE_SOURCE=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

ensure_repo_shape
ensure_marketplace
reinstall_plugin

echo
echo "Next step: run /reload-plugins in Claude Code or start a fresh Claude session."
