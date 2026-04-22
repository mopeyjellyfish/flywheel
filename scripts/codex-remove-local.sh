#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  codex-remove-local.sh [--dry-run]

Remove Flywheel from the local Codex development install by:
  1. removing ~/.codex/plugins/flywheel
  2. removing ~/.codex/plugins/cache/flywheel-local
  3. removing Flywheel plugin entries from ~/.codex/config.toml
  4. removing the Flywheel hook guardrail from ~/.codex/hooks.json

Options:
  --dry-run     Print the actions without changing anything
  -h, --help    Show this help
EOF
}

CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
PLUGIN_LINK="$CODEX_HOME_DIR/plugins/flywheel"
CACHE_ROOT="$CODEX_HOME_DIR/plugins/cache/flywheel-local"
CONFIG_FILE="$CODEX_HOME_DIR/config.toml"
HOOKS_FILE="$CODEX_HOME_DIR/hooks.json"
DRY_RUN=0

run() {
  if [ "$DRY_RUN" -eq 1 ]; then
    printf 'DRY_RUN:'
    printf ' %q' "$@"
    printf '\n'
    return 0
  fi

  "$@"
}

remove_path() {
  local path="$1"
  local found_detail="$2"
  local missing_detail="$3"

  if [ -e "$path" ] || [ -L "$path" ]; then
    run rm -rf "$path"
    echo "OK  $found_detail"
  else
    echo "OK  $missing_detail"
  fi
}

remove_plugin_config() {
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

  if (/^\[plugins\."flywheel@[^"]+"\]$/.test(trimmed)) {
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
    missing)
      echo "OK  no Codex config file found at $CONFIG_FILE"
      ;;
    none)
      echo "OK  no Flywheel Codex plugin entry found in $CONFIG_FILE"
      ;;
    removed:*)
      echo "OK  removed Flywheel Codex plugin entries from $CONFIG_FILE"
      ;;
    *)
      echo "ERROR: unexpected Codex config cleanup result: $outcome" >&2
      exit 1
      ;;
  esac
}

remove_hooks_config() {
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
} catch (error) {
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
if (Array.isArray(payload.hooks.PreToolUse)) {
  payload.hooks.PreToolUse = payload.hooks.PreToolUse.flatMap((group) => {
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

  if (payload.hooks.PreToolUse.length === 0) {
    delete payload.hooks.PreToolUse;
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
      echo "OK  no Codex hooks file found at $HOOKS_FILE"
      ;;
    none)
      echo "OK  no Flywheel Codex hook guardrail found in $HOOKS_FILE"
      ;;
    removed:*)
      echo "OK  removed Flywheel Codex hook guardrail from $HOOKS_FILE"
      ;;
    parse-error)
      echo "WARN  could not parse $HOOKS_FILE; remove Flywheel hook entries manually"
      ;;
    *)
      echo "ERROR: unexpected Codex hooks cleanup result: $outcome" >&2
      exit 1
      ;;
  esac
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
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

remove_path "$PLUGIN_LINK" \
  "removed Codex plugin link at $PLUGIN_LINK" \
  "no Codex plugin link found at $PLUGIN_LINK"
remove_path "$CACHE_ROOT" \
  "removed Codex plugin cache at $CACHE_ROOT" \
  "no Codex plugin cache found at $CACHE_ROOT"
remove_plugin_config
remove_hooks_config

echo
echo "Next step: run \`make install/codex\` to reinstall Flywheel for Codex, then start a fresh Codex session."
