#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  codex-refresh-local.sh [--dry-run] [--force-link]

Refresh the local Flywheel plugin install for Codex development by:
  1. ensuring ~/.codex/plugins/flywheel points at this repo
  2. refreshing the local Flywheel plugin cache
  3. ensuring ~/.codex/config.toml enables flywheel@flywheel-local and codex hooks
  4. merging the Flywheel Codex hook guardrail into ~/.codex/hooks.json

This is a development helper for working on Flywheel itself. It does not hot
reload an already-running Codex session.

Options:
  --dry-run     Print the actions without changing anything
  --force-link  Replace an existing plugin path if it points somewhere else
  -h, --help    Show this help
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd -P)"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
PLUGIN_NAME="flywheel"
PLUGIN_LINK="$CODEX_HOME_DIR/plugins/$PLUGIN_NAME"
CACHE_ROOT="$CODEX_HOME_DIR/plugins/cache/${PLUGIN_NAME}-local"
CACHE_PLUGIN_DIR="$CACHE_ROOT/$PLUGIN_NAME/local"
CONFIG_FILE="$CODEX_HOME_DIR/config.toml"
HOOKS_FILE="$CODEX_HOME_DIR/hooks.json"
PLUGIN_CONFIG_SECTION='[plugins."flywheel@flywheel-local"]'
FEATURES_SECTION='[features]'
DRY_RUN=0
FORCE_LINK=0

run() {
  if [ "$DRY_RUN" -eq 1 ]; then
    printf 'DRY_RUN:'
    printf ' %q' "$@"
    printf '\n'
    return 0
  fi

  "$@"
}

canonicalize_existing_path() {
  local path="$1"

  if [ -d "$path" ]; then
    (cd "$path" && pwd -P)
    return 0
  fi

  if [ -e "$path" ]; then
    local parent base
    parent="$(dirname "$path")"
    base="$(basename "$path")"
    (cd "$parent" && cd "$base" && pwd -P)
    return 0
  fi

  return 1
}

ensure_repo_shape() {
  if [ ! -f "$REPO_ROOT/.codex-plugin/plugin.json" ]; then
    echo "ERROR: expected .codex-plugin/plugin.json under $REPO_ROOT" >&2
    exit 1
  fi

  if [ ! -f "$REPO_ROOT/hooks/flywheel-hook-policy.js" ]; then
    echo "ERROR: expected hooks/flywheel-hook-policy.js under $REPO_ROOT" >&2
    exit 1
  fi
}

ensure_plugin_link() {
  local current_target=""

  run mkdir -p "$(dirname "$PLUGIN_LINK")"

  if [ -L "$PLUGIN_LINK" ]; then
    current_target="$(canonicalize_existing_path "$PLUGIN_LINK")"
    if [ "$current_target" = "$REPO_ROOT" ]; then
      echo "OK  local plugin link already points at this repo"
      return 0
    fi

    if [ "$FORCE_LINK" -ne 1 ]; then
      echo "ERROR: $PLUGIN_LINK points at $current_target, not $REPO_ROOT" >&2
      echo "Re-run with --force-link to replace it." >&2
      exit 1
    fi
  elif [ -e "$PLUGIN_LINK" ]; then
    if [ "$FORCE_LINK" -ne 1 ]; then
      echo "ERROR: $PLUGIN_LINK exists and is not a symlink" >&2
      echo "Re-run with --force-link to replace it." >&2
      exit 1
    fi
  fi

  run rm -rf "$PLUGIN_LINK"
  run ln -s "$REPO_ROOT" "$PLUGIN_LINK"
  echo "OK  local plugin link now points at $REPO_ROOT"
}

refresh_plugin_cache() {
  if [ -e "$CACHE_ROOT" ]; then
    run rm -rf "$CACHE_ROOT"
    echo "OK  cleared local Flywheel plugin cache at $CACHE_ROOT"
  else
    echo "OK  no local Flywheel plugin cache found at $CACHE_ROOT"
  fi

  run mkdir -p "$CACHE_PLUGIN_DIR"
  run rsync -a \
    --exclude '.git/' \
    --exclude '.context/' \
    --exclude 'tools/evals/node_modules/' \
    "$REPO_ROOT/" "$CACHE_PLUGIN_DIR/"
  echo "OK  refreshed local Flywheel plugin cache at $CACHE_PLUGIN_DIR"
}

config_section_enabled() {
  if [ ! -f "$CONFIG_FILE" ]; then
    return 1
  fi

  awk -v section="$PLUGIN_CONFIG_SECTION" '
    $0 == section { in_section=1; next }
    /^\[/ {
      if (in_section) {
        exit enabled ? 0 : 1
      }
      next
    }
    in_section && $0 ~ /^[[:space:]]*enabled[[:space:]]*=[[:space:]]*true[[:space:]]*$/ {
      enabled=1
    }
    END {
      if (in_section) {
        exit enabled ? 0 : 1
      }
      exit 1
    }
  ' "$CONFIG_FILE"
}

write_plugin_config_block() {
  local temp_file
  temp_file="$(mktemp)"

  awk -v section="$PLUGIN_CONFIG_SECTION" '
    {
      if ($0 == section) {
        in_section=1
        section_found=1
        enabled_written=0
        print
        next
      }

      if (in_section && $0 ~ /^\[/) {
        if (!enabled_written) {
          print "enabled = true"
          enabled_written=1
        }
        in_section=0
      }

      if (in_section && $0 ~ /^[[:space:]]*enabled[[:space:]]*=/) {
        if (!enabled_written) {
          print "enabled = true"
          enabled_written=1
        }
        next
      }

      print
    }

  END {
    if (in_section && !enabled_written) {
      print "enabled = true"
    }

    if (!section_found) {
      if (NR > 0) {
        print ""
      }
      print section
      print "enabled = true"
    }
  }
  ' "$CONFIG_FILE" > "$temp_file"

  run mv "$temp_file" "$CONFIG_FILE"
}

ensure_plugin_config() {
  run mkdir -p "$(dirname "$CONFIG_FILE")"

  if config_section_enabled; then
    echo "OK  Codex config enables [plugins.\"flywheel@flywheel-local\"]"
    return 0
  fi

  if [ ! -f "$CONFIG_FILE" ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      echo "DRY_RUN: create $CONFIG_FILE with [plugins.\"flywheel@flywheel-local\"] enabled"
    else
      cat > "$CONFIG_FILE" <<EOF
$PLUGIN_CONFIG_SECTION
enabled = true
EOF
    fi
    echo "OK  wrote local Flywheel plugin entry to $CONFIG_FILE"
    return 0
  fi

  write_plugin_config_block
  echo "OK  updated $CONFIG_FILE to enable [plugins.\"flywheel@flywheel-local\"]"
}

features_section_enabled() {
  if [ ! -f "$CONFIG_FILE" ]; then
    return 1
  fi

  awk -v section="$FEATURES_SECTION" '
    $0 == section { in_section=1; next }
    /^\[/ {
      if (in_section) {
        exit enabled ? 0 : 1
      }
      next
    }
    in_section && $0 ~ /^[[:space:]]*codex_hooks[[:space:]]*=[[:space:]]*true[[:space:]]*$/ {
      enabled=1
    }
    END {
      if (in_section) {
        exit enabled ? 0 : 1
      }
      exit 1
    }
  ' "$CONFIG_FILE"
}

write_features_block() {
  local temp_file
  temp_file="$(mktemp)"

  awk -v section="$FEATURES_SECTION" '
    {
      if ($0 == section) {
        in_section=1
        section_found=1
        hooks_written=0
        print
        next
      }

      if (in_section && $0 ~ /^\[/) {
        if (!hooks_written) {
          print "codex_hooks = true"
          hooks_written=1
        }
        in_section=0
      }

      if (in_section && $0 ~ /^[[:space:]]*codex_hooks[[:space:]]*=/) {
        if (!hooks_written) {
          print "codex_hooks = true"
          hooks_written=1
        }
        next
      }

      print
    }

    END {
      if (in_section && !hooks_written) {
        print "codex_hooks = true"
      }

      if (!section_found) {
        if (NR > 0) {
          print ""
        }
        print section
        print "codex_hooks = true"
      }
    }
  ' "$CONFIG_FILE" > "$temp_file"

  run mv "$temp_file" "$CONFIG_FILE"
}

ensure_codex_hooks_feature() {
  run mkdir -p "$(dirname "$CONFIG_FILE")"

  if features_section_enabled; then
    echo "OK  Codex config enables [features].codex_hooks"
    return 0
  fi

  if [ ! -f "$CONFIG_FILE" ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      echo "DRY_RUN: create $CONFIG_FILE with [features] codex_hooks = true"
    else
      cat > "$CONFIG_FILE" <<EOF
[features]
codex_hooks = true
EOF
    fi
    echo "OK  wrote [features] codex_hooks = true to $CONFIG_FILE"
    return 0
  fi

  write_features_block
  echo "OK  updated $CONFIG_FILE to enable [features].codex_hooks"
}

merge_hooks_config() {
  local hook_command
  hook_command="node \"$PLUGIN_LINK/hooks/flywheel-hook-policy.js\" pre-tool codex"

  if [ "$DRY_RUN" -eq 1 ]; then
    echo "DRY_RUN: merge Flywheel hook into $HOOKS_FILE"
    return 0
  fi

  run mkdir -p "$(dirname "$HOOKS_FILE")"

  HOOKS_FILE="$HOOKS_FILE" HOOK_COMMAND="$hook_command" node <<'NODE'
const fs = require("fs");

const hooksFile = process.env.HOOKS_FILE;
const hookCommand = process.env.HOOK_COMMAND;
const hookNeedle = "flywheel-hook-policy.js";

let payload = { hooks: {} };
if (fs.existsSync(hooksFile)) {
  try {
    payload = JSON.parse(fs.readFileSync(hooksFile, "utf8"));
  } catch {
    payload = { hooks: {} };
  }
}

if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
  payload = { hooks: {} };
}
if (!payload.hooks || typeof payload.hooks !== "object" || Array.isArray(payload.hooks)) {
  payload.hooks = {};
}
if (!Array.isArray(payload.hooks.PreToolUse)) {
  payload.hooks.PreToolUse = [];
}

for (const matcherGroup of payload.hooks.PreToolUse) {
  if (!matcherGroup || !Array.isArray(matcherGroup.hooks)) {
    continue;
  }
  matcherGroup.hooks = matcherGroup.hooks.filter((hook) => {
    return !(hook && typeof hook.command === "string" && hook.command.includes(hookNeedle));
  });
}

payload.hooks.PreToolUse = payload.hooks.PreToolUse.filter((matcherGroup) => {
  return matcherGroup && Array.isArray(matcherGroup.hooks) && matcherGroup.hooks.length > 0;
});

let bashGroup = payload.hooks.PreToolUse.find((matcherGroup) => matcherGroup.matcher === "Bash");
if (!bashGroup) {
  bashGroup = { matcher: "Bash", hooks: [] };
  payload.hooks.PreToolUse.push(bashGroup);
}

bashGroup.hooks.push({
  type: "command",
  command: hookCommand,
  statusMessage: "Checking Flywheel policy",
});

fs.writeFileSync(hooksFile, `${JSON.stringify(payload, null, 2)}\n`);
NODE

  echo "OK  merged Flywheel hook guardrail into $HOOKS_FILE"
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      ;;
    --force-link)
      FORCE_LINK=1
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
ensure_plugin_link
refresh_plugin_cache
ensure_plugin_config
ensure_codex_hooks_feature
merge_hooks_config

echo
echo "Next step: start a fresh Codex session."
echo "Running sessions may keep stale plugin or hook state even after refresh."
