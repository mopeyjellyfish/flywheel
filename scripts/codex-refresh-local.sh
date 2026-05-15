#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  codex-refresh-local.sh [--dry-run] [--force-link]

Refresh the local Flywheel plugin install for Codex development by:
  1. removing standalone global Flywheel skills that Codex would expose as $start
  2. ensuring ~/.codex/plugins/fw points at this repo
  3. refreshing the local Flywheel plugin cache
  4. ensuring ~/.codex/config.toml enables fw@fw-local, hooks, and plugin hooks
  5. removing old user-level Flywheel hook entries while preserving unrelated hooks

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
PLUGIN_SOURCE_NAME="fw"
PLUGIN_LINK="$CODEX_HOME_DIR/plugins/$PLUGIN_SOURCE_NAME"
CACHE_ROOT="$CODEX_HOME_DIR/plugins/cache/${PLUGIN_SOURCE_NAME}-local"
CACHE_PLUGIN_DIR="$CACHE_ROOT/$PLUGIN_SOURCE_NAME/local"
STALE_PLUGIN_LINK="$CODEX_HOME_DIR/plugins/flywheel"
STALE_CACHE_ROOT="$CODEX_HOME_DIR/plugins/cache/flywheel-local"
CONFIG_FILE="$CODEX_HOME_DIR/config.toml"
HOOKS_FILE="$CODEX_HOME_DIR/hooks.json"
PLUGIN_CONFIG_SECTION='[plugins."fw@fw-local"]'
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

  if [ ! -f "$REPO_ROOT/hooks/codex-hooks.json" ]; then
    echo "ERROR: expected hooks/codex-hooks.json under $REPO_ROOT" >&2
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

remove_stale_install_paths() {
  if [ -L "$STALE_PLUGIN_LINK" ] || [ -e "$STALE_PLUGIN_LINK" ]; then
    run rm -rf "$STALE_PLUGIN_LINK"
    echo "OK  removed old Codex plugin link at $STALE_PLUGIN_LINK"
  fi

  if [ -e "$STALE_CACHE_ROOT" ]; then
    run rm -rf "$STALE_CACHE_ROOT"
    echo "OK  removed old Codex plugin cache at $STALE_CACHE_ROOT"
  fi
}

remove_standalone_global_skills() {
  local args=("--scope" "global")
  if [ "$DRY_RUN" -eq 1 ]; then
    args+=("--dry-run")
  fi

  bash "$REPO_ROOT/scripts/skills-remove.sh" "${args[@]}"
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

remove_old_plugin_config() {
  local outcome outcome_file
  outcome_file="$(mktemp)"

  CONFIG_FILE="$CONFIG_FILE" DRY_RUN="$DRY_RUN" node <<'NODE' > "$outcome_file"
const fs = require("fs");

const configFile = process.env.CONFIG_FILE;
const dryRun = process.env.DRY_RUN === "1";

if (!fs.existsSync(configFile)) {
  process.stdout.write("missing");
  process.exit(0);
}

const text = fs.readFileSync(configFile, "utf8");
const lines = text.split(/\r?\n/);
const output = [];
let removing = false;
let removedSections = 0;

for (const line of lines) {
  const trimmed = line.trim();
  const isSectionHeader = /^\[.*\]$/.test(trimmed);

  if (/^\[plugins\."(?:flywheel@[^"]+|fw@flywheel-local)"\]$/.test(trimmed)) {
    removing = true;
    removedSections += 1;
    continue;
  }

  if (removing && isSectionHeader) {
    removing = false;
  }

  if (!removing) {
    output.push(line);
  }
}

if (removedSections === 0) {
  process.stdout.write("none");
  process.exit(0);
}

let nextText = output.join("\n")
  .replace(/\n{3,}/g, "\n\n")
  .replace(/^\n+/, "");
if (nextText.length > 0 && !nextText.endsWith("\n")) {
  nextText += "\n";
}

if (!dryRun) {
  fs.writeFileSync(configFile, nextText);
}

process.stdout.write(`removed:${removedSections}`);
NODE
  outcome="$(cat "$outcome_file")"
  rm -f "$outcome_file"

  case "$outcome" in
    missing|none)
      return 0
      ;;
    removed:*)
      echo "OK  removed old [plugins.\"flywheel@...\"] or [plugins.\"fw@flywheel-local\"] entries from $CONFIG_FILE"
      ;;
    *)
      echo "ERROR: unexpected Codex old-plugin cleanup result: $outcome" >&2
      exit 1
      ;;
  esac
}

ensure_plugin_config() {
  run mkdir -p "$(dirname "$CONFIG_FILE")"
  remove_old_plugin_config

  if config_section_enabled; then
    echo "OK  Codex config enables [plugins.\"fw@fw-local\"]"
    return 0
  fi

  if [ ! -f "$CONFIG_FILE" ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      echo "DRY_RUN: create $CONFIG_FILE with [plugins.\"fw@fw-local\"] enabled"
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
  echo "OK  updated $CONFIG_FILE to enable [plugins.\"fw@fw-local\"]"
}

features_section_enabled() {
  if [ ! -f "$CONFIG_FILE" ]; then
    return 1
  fi

  awk -v section="$FEATURES_SECTION" '
    $0 == section { in_section=1; next }
    /^\[/ {
      if (in_section) {
        exit hooks_enabled && plugin_hooks_enabled ? 0 : 1
      }
      next
    }
    in_section && $0 ~ /^[[:space:]]*hooks[[:space:]]*=[[:space:]]*true[[:space:]]*$/ {
      hooks_enabled=1
    }
    in_section && $0 ~ /^[[:space:]]*plugin_hooks[[:space:]]*=[[:space:]]*true[[:space:]]*$/ {
      plugin_hooks_enabled=1
    }
    END {
      if (in_section) {
        exit hooks_enabled && plugin_hooks_enabled ? 0 : 1
      }
      exit 1
    }
  ' "$CONFIG_FILE"
}

write_features_block() {
  local temp_file outcome_file
  temp_file="$(mktemp)"
  outcome_file="$(mktemp)"

  CONFIG_FILE="$CONFIG_FILE" TEMP_FILE="$temp_file" node <<'NODE' > "$outcome_file"
const fs = require("fs");

const configFile = process.env.CONFIG_FILE;
const tempFile = process.env.TEMP_FILE;
const text = fs.existsSync(configFile) ? fs.readFileSync(configFile, "utf8") : "";
const lines = text.split(/\r?\n/);
if (lines.length > 0 && lines[lines.length - 1] === "") {
  lines.pop();
}

const output = [];
let inFeatures = false;
let foundFeatures = false;

function isSection(line) {
  return /^\s*\[.*\]\s*$/.test(line);
}

function isFeatures(line) {
  return line.trim() === "[features]";
}

function isManagedFeature(line) {
  return /^\s*(?:hooks|plugin_hooks)\s*=/.test(line);
}

function appendFeatureFlags() {
  output.push("hooks = true");
  output.push("plugin_hooks = true");
}

for (const line of lines) {
  if (isFeatures(line)) {
    foundFeatures = true;
    inFeatures = true;
    output.push(line);
    continue;
  }

  if (inFeatures && isSection(line)) {
    appendFeatureFlags();
    inFeatures = false;
  }

  if (inFeatures && isManagedFeature(line)) {
    continue;
  }

  output.push(line);
}

if (inFeatures) {
  appendFeatureFlags();
}

if (!foundFeatures) {
  if (output.length > 0) {
    output.push("");
  }
  output.push("[features]");
  appendFeatureFlags();
}

fs.writeFileSync(tempFile, `${output.join("\n")}\n`);
process.stdout.write("ok");
NODE
  local outcome
  outcome="$(cat "$outcome_file")"
  rm -f "$outcome_file"
  if [ "$outcome" != "ok" ]; then
    rm -f "$temp_file"
    echo "ERROR: unexpected Codex features update result: $outcome" >&2
    exit 1
  fi

  run mv "$temp_file" "$CONFIG_FILE"
}

ensure_hooks_features() {
  run mkdir -p "$(dirname "$CONFIG_FILE")"

  if features_section_enabled; then
    echo "OK  Codex config enables [features].hooks and [features].plugin_hooks"
    return 0
  fi

  if [ ! -f "$CONFIG_FILE" ]; then
    if [ "$DRY_RUN" -eq 1 ]; then
      echo "DRY_RUN: create $CONFIG_FILE with [features] hooks = true and plugin_hooks = true"
    else
      cat > "$CONFIG_FILE" <<EOF
[features]
hooks = true
plugin_hooks = true
EOF
    fi
    echo "OK  wrote [features] hooks = true and plugin_hooks = true to $CONFIG_FILE"
    return 0
  fi

  write_features_block
  echo "OK  updated $CONFIG_FILE to enable [features].hooks and [features].plugin_hooks"
}

remove_user_hook_entries() {
  local outcome outcome_file
  outcome_file="$(mktemp)"

  HOOKS_FILE="$HOOKS_FILE" DRY_RUN="$DRY_RUN" node <<'NODE' > "$outcome_file"
const fs = require("fs");

const hooksFile = process.env.HOOKS_FILE;
const dryRun = process.env.DRY_RUN === "1";
const hookNeedle = "flywheel-hook-policy.js";

if (!fs.existsSync(hooksFile)) {
  process.stdout.write("missing");
  process.exit(0);
}

let payload;
try {
  payload = JSON.parse(fs.readFileSync(hooksFile, "utf8"));
} catch {
  process.stdout.write("parse-error");
  process.exit(0);
}

if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
  process.stdout.write("none");
  process.exit(0);
}

if (!payload.hooks || typeof payload.hooks !== "object" || Array.isArray(payload.hooks)) {
  process.stdout.write("none");
  process.exit(0);
}

let removedHooks = 0;
for (const eventName of Object.keys(payload.hooks)) {
  if (!Array.isArray(payload.hooks[eventName])) {
    continue;
  }

  payload.hooks[eventName] = payload.hooks[eventName].flatMap((group) => {
    if (!group || !Array.isArray(group.hooks)) {
      return [group];
    }

    const hooks = group.hooks.filter((hook) => {
      const matches = hook && typeof hook.command === "string" && hook.command.includes(hookNeedle);
      if (matches) {
        removedHooks += 1;
      }
      return !matches;
    });

    return hooks.length > 0 ? [{ ...group, hooks }] : [];
  });

  if (payload.hooks[eventName].length === 0) {
    delete payload.hooks[eventName];
  }
}

if (removedHooks === 0) {
  process.stdout.write("none");
  process.exit(0);
}

if (!dryRun) {
  fs.writeFileSync(hooksFile, `${JSON.stringify(payload, null, 2)}\n`);
}

process.stdout.write(`removed:${removedHooks}`);
NODE
  outcome="$(cat "$outcome_file")"
  rm -f "$outcome_file"

  case "$outcome" in
    missing)
      echo "OK  no user-level Codex hook config found at $HOOKS_FILE"
      ;;
    none)
      echo "OK  no user-level Flywheel Codex hook entries found in $HOOKS_FILE"
      ;;
    removed:*)
      if [ "$DRY_RUN" -eq 1 ]; then
        echo "DRY_RUN: remove ${outcome#removed:} user-level Flywheel Codex hook entries from $HOOKS_FILE"
      else
        echo "OK  removed ${outcome#removed:} user-level Flywheel Codex hook entries from $HOOKS_FILE"
      fi
      ;;
    parse-error)
      echo "WARN  could not parse $HOOKS_FILE; remove Flywheel hook entries manually"
      ;;
    *)
      echo "ERROR: unexpected Codex hook cleanup result: $outcome" >&2
      exit 1
      ;;
  esac
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
remove_standalone_global_skills
remove_stale_install_paths
ensure_plugin_link
refresh_plugin_cache
ensure_plugin_config
ensure_hooks_features
remove_user_hook_entries
echo "OK  using plugin-bundled Codex hooks"

echo
echo "Next step: start a fresh Codex session."
echo "Running sessions may keep stale plugin or hook state even after refresh."
