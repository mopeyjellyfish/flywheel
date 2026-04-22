#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  claude-remove-local.sh [--dry-run]

Remove Flywheel from Claude Code by:
  1. uninstalling flywheel@flywheel from every installed scope
  2. removing the flywheel marketplace entry

Options:
  --dry-run     Print the actions without changing anything
  -h, --help    Show this help
EOF
}

PLUGIN_ID="flywheel@flywheel"
MARKETPLACE_NAME="flywheel"
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

installed_scopes() {
  local json
  json="$(claude plugin list --json 2>/dev/null || echo '[]')"

  CLAUDE_PLUGIN_LIST_JSON="$json" PLUGIN_ID="$PLUGIN_ID" node <<'NODE'
const items = JSON.parse(process.env.CLAUDE_PLUGIN_LIST_JSON || "[]");
const pluginId = process.env.PLUGIN_ID;
const order = { local: 0, project: 1, user: 2 };

const scopes = [...new Set(
  items
    .filter((item) => item && item.id === pluginId)
    .map((item) => item.scope)
    .filter((scope) => typeof scope === "string"),
)].sort((left, right) => (order[left] ?? 99) - (order[right] ?? 99));

console.log(scopes.join("\n"));
NODE
}

marketplace_present() {
  local json
  json="$(claude plugin marketplace list --json 2>/dev/null || echo '[]')"

  CLAUDE_MARKETPLACE_LIST_JSON="$json" MARKETPLACE_NAME="$MARKETPLACE_NAME" node <<'NODE'
const items = JSON.parse(process.env.CLAUDE_MARKETPLACE_LIST_JSON || "[]");
const marketplaceName = process.env.MARKETPLACE_NAME;
const found = items.some((item) => item && item.name === marketplaceName);
process.stdout.write(found ? "yes" : "no");
NODE
}

remove_installed_plugins() {
  local scopes=()
  local scope
  while IFS= read -r scope; do
    if [ -n "$scope" ]; then
      scopes+=("$scope")
    fi
  done < <(installed_scopes)

  if [ "${#scopes[@]}" -eq 0 ]; then
    echo "OK  no installed $PLUGIN_ID plugin found in Claude"
    return 0
  fi

  for scope in "${scopes[@]}"; do
    run claude plugin uninstall "$PLUGIN_ID" --scope "$scope"
    echo "OK  removed $PLUGIN_ID install at $scope scope"
  done
}

remove_marketplace() {
  if [ "$(marketplace_present)" != "yes" ]; then
    echo "OK  no $MARKETPLACE_NAME marketplace entry found in Claude"
    return 0
  fi

  run claude plugin marketplace remove "$MARKETPLACE_NAME"
  echo "OK  removed $MARKETPLACE_NAME marketplace from Claude"
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

remove_installed_plugins
remove_marketplace

echo
echo "Next step: run \`make install/claude\` to reinstall Flywheel for Claude, then run /reload-plugins or start a fresh Claude session."
