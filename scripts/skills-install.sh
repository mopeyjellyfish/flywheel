#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  skills-install.sh [--scope global|project] [--source auto|local|published] [--dry-run]

Install Flywheel through the `skills` CLI for Codex, Claude Code, and OpenCode.

Options:
  --scope <scope>    Install scope: global or project (default: global)
  --source <source>  Source selection: auto, local, or published (default: auto)
  --dry-run          Print the command without changing anything
  -h, --help         Show this help

Notes:
  - local source uses the repo's `skills/` directory directly
  - auto prefers local source and falls back to the published GitHub package
  - project scope installs into the current working directory's `skills/`
  - project scope is a no-op when that directory is this repo's authored source tree
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd -P)"
LOCAL_SOURCE="$REPO_ROOT/skills"
PROJECT_SKILLS_DIR="$(pwd -P)/skills"
PUBLISHED_SOURCE="mopeyjellyfish/flywheel"
INSTALL_SCOPE="global"
SOURCE_MODE="auto"
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

same_existing_dir() {
  local left="$1"
  local right="$2"

  [ -d "$left" ] || return 1
  [ -d "$right" ] || return 1

  [ "$(cd "$left" && pwd -P)" = "$(cd "$right" && pwd -P)" ]
}

has_local_skills_source() {
  [ -d "$LOCAL_SOURCE" ] || return 1
  find "$LOCAL_SOURCE" -mindepth 2 -maxdepth 2 -name SKILL.md -print -quit | grep -q .
}

resolve_source() {
  case "$SOURCE_MODE" in
    local)
      if has_local_skills_source; then
        printf '%s\n' "$LOCAL_SOURCE"
        return 0
      fi

      echo "ERROR: no installable local skills source found at $LOCAL_SOURCE" >&2
      echo "The local checkout needs real \`skills/*/SKILL.md\` entries for local-source installs." >&2
      return 1
      ;;
    published)
      printf '%s\n' "$PUBLISHED_SOURCE"
      ;;
    auto)
      if has_local_skills_source; then
        printf '%s\n' "$LOCAL_SOURCE"
      else
        echo "WARN  local skills source unavailable at $LOCAL_SOURCE; falling back to $PUBLISHED_SOURCE" >&2
        printf '%s\n' "$PUBLISHED_SOURCE"
      fi
      ;;
    *)
      echo "ERROR: unsupported source mode: $SOURCE_MODE" >&2
      return 1
      ;;
  esac
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
        global|project)
          INSTALL_SCOPE="$1"
          ;;
        *)
          echo "ERROR: unsupported scope: $1" >&2
          usage >&2
          exit 1
          ;;
      esac
      ;;
    --source)
      shift
      if [ "$#" -eq 0 ]; then
        echo "ERROR: --source requires a value" >&2
        usage >&2
        exit 1
      fi
      case "$1" in
        auto|local|published)
          SOURCE_MODE="$1"
          ;;
        *)
          echo "ERROR: unsupported source mode: $1" >&2
          usage >&2
          exit 1
          ;;
      esac
      ;;
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

SOURCE="$(resolve_source)"

if [ "$INSTALL_SCOPE" = "project" ] && same_existing_dir "$PROJECT_SKILLS_DIR" "$LOCAL_SOURCE"; then
  if same_existing_dir "$SOURCE" "$LOCAL_SOURCE"; then
    echo "OK  project-scope Flywheel skills are served directly from $LOCAL_SOURCE"
    echo "OK  not running \`skills add\` because project scope would write back into this repo's authored skills source"
    exit 0
  fi

  echo "ERROR: refusing project-scope install into $PROJECT_SKILLS_DIR because it is this checkout's authored skills source" >&2
  echo "Use --source local from the Flywheel repo, or run project-scope installs from a target repo." >&2
  exit 1
fi

CMD=(npx -y skills add "$SOURCE" --skill '*' --agent codex --agent claude-code --agent opencode --yes)

if [ "$INSTALL_SCOPE" = "global" ]; then
  CMD+=(--global)
fi

echo "OK  installing Flywheel skills from $SOURCE at $INSTALL_SCOPE scope"
run "${CMD[@]}"
