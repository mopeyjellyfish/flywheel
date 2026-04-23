#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  skills-remove.sh [--scope global|project|all] [--dry-run]

Remove Flywheel-installed skills managed by the `skills` CLI.

Options:
  --scope <scope>  Removal scope: global, project, or all (default: all)
  --dry-run        Print the commands without changing anything
  -h, --help       Show this help

Notes:
  - global scope reads `~/.agents/.skill-lock.json`
  - project scope reads `./skills-lock.json`
  - only skills whose recorded source matches Flywheel are removed
  - stale unlocked Flywheel installs are detected by on-disk skill fingerprints
  - project scope is skipped when `./skills` is this repo's authored source tree
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd -P)"
AGENTS_HOME_DIR="${AGENTS_HOME:-$HOME/.agents}"
GLOBAL_LOCK_FILE="$AGENTS_HOME_DIR/.skill-lock.json"
GLOBAL_SKILLS_DIR="$AGENTS_HOME_DIR/skills"
PROJECT_LOCK_FILE="skills-lock.json"
PROJECT_SKILLS_DIR="$(pwd -P)/skills"
LOCAL_SOURCE="$REPO_ROOT/skills"
PUBLISHED_SOURCE="mopeyjellyfish/flywheel"
REMOVE_SCOPE="all"
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

project_scope_uses_local_source_tree() {
  same_existing_dir "$PROJECT_SKILLS_DIR" "$LOCAL_SOURCE"
}

skill_names_for_scope() {
  local lock_file="$1"
  local install_dir="$2"

  LOCK_FILE="$lock_file" INSTALL_DIR="$install_dir" LOCAL_SOURCE="$LOCAL_SOURCE" PUBLISHED_SOURCE="$PUBLISHED_SOURCE" node <<'NODE'
const fs = require("fs");
const path = require("path");

const lockFile = process.env.LOCK_FILE;
const installDir = process.env.INSTALL_DIR;
const localSource = process.env.LOCAL_SOURCE;
const publishedSource = process.env.PUBLISHED_SOURCE;
const matches = new Set();

function sourceMatchesFlywheel(meta) {
  const source = meta && typeof meta.source === "string" ? meta.source : "";
  const sourceUrl = meta && typeof meta.sourceUrl === "string" ? meta.sourceUrl : "";
  if (source === publishedSource || /github\.com\/mopeyjellyfish\/flywheel(?:\.git)?$/i.test(sourceUrl)) {
    return true;
  }

  if (!source || !localSource) {
    return false;
  }

  try {
    return path.resolve(source) === path.resolve(localSource);
  } catch (error) {
    return source === localSource;
  }
}

function localSkillNames() {
  if (!localSource || !fs.existsSync(localSource)) {
    return [];
  }

  return fs.readdirSync(localSource, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(localSource, name, "SKILL.md")))
    .sort();
}

function installedSkillLooksLikeFlywheel(name) {
  if (!installDir) {
    return false;
  }

  const skillDir = path.join(installDir, name);
  const candidateFiles = [
    path.join(skillDir, "SKILL.md"),
    path.join(skillDir, "agents", "openai.yaml"),
  ];
  const text = candidateFiles
    .filter((file) => fs.existsSync(file))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");

  return /\bFlywheel\b|\$flywheel:|\/flywheel:|\$fw:|\/fw:/i.test(text);
}

if (lockFile && fs.existsSync(lockFile)) {
  try {
    const payload = JSON.parse(fs.readFileSync(lockFile, "utf8"));
    const skills = payload && payload.skills && typeof payload.skills === "object" ? payload.skills : {};
    for (const [name, meta] of Object.entries(skills)) {
      if (meta && typeof meta === "object" && sourceMatchesFlywheel(meta)) {
        matches.add(name);
      }
    }
  } catch (error) {
    // Ignore unreadable locks and fall back to on-disk detection.
  }
}

for (const name of localSkillNames()) {
  if (installedSkillLooksLikeFlywheel(name)) {
    matches.add(name);
  }
}

if (matches.size > 0) {
  process.stdout.write(`${Array.from(matches).sort().join("\n")}\n`);
}
NODE
}

scrub_lock_file() {
  local lock_file="$1"

  LOCK_FILE="$lock_file" LOCAL_SOURCE="$LOCAL_SOURCE" PUBLISHED_SOURCE="$PUBLISHED_SOURCE" node <<'NODE'
const fs = require("fs");
const path = require("path");

const lockFile = process.env.LOCK_FILE;
const localSource = process.env.LOCAL_SOURCE;
const publishedSource = process.env.PUBLISHED_SOURCE;

if (!lockFile || !fs.existsSync(lockFile)) {
  process.exit(0);
}

let payload;
try {
  payload = JSON.parse(fs.readFileSync(lockFile, "utf8"));
} catch (error) {
  process.exit(0);
}

const skills = payload && payload.skills && typeof payload.skills === "object" ? payload.skills : null;
if (!skills) {
  process.exit(0);
}

function sourceMatchesFlywheel(meta) {
  const source = meta && typeof meta.source === "string" ? meta.source : "";
  const sourceUrl = meta && typeof meta.sourceUrl === "string" ? meta.sourceUrl : "";
  if (source === publishedSource || /github\.com\/mopeyjellyfish\/flywheel(?:\.git)?$/i.test(sourceUrl)) {
    return true;
  }

  if (!source || !localSource) {
    return false;
  }

  try {
    return path.resolve(source) === path.resolve(localSource);
  } catch (error) {
    return source === localSource;
  }
}

for (const [name, meta] of Object.entries(skills)) {
  if (sourceMatchesFlywheel(meta)) {
    delete skills[name];
  }
}

if (Object.keys(skills).length === 0 && path.basename(lockFile) === "skills-lock.json") {
  fs.unlinkSync(lockFile);
  process.exit(0);
}

fs.writeFileSync(lockFile, `${JSON.stringify(payload, null, 2)}\n`);
NODE
}

remove_scope() {
  local scope="$1"
  local lock_file="$2"
  local install_dir="$3"
  local -a skill_names=()
  local skill_name

  if [ "$scope" = "project" ] && project_scope_uses_local_source_tree; then
    echo "OK  skipping project-scope skills removal because $PROJECT_SKILLS_DIR is this checkout's authored skills source"
    if [ -f "$lock_file" ]; then
      if [ "$DRY_RUN" -eq 1 ]; then
        echo "DRY_RUN: would scrub Flywheel entries from $lock_file without deleting local source files"
      else
        scrub_lock_file "$lock_file"
        echo "OK  scrubbed Flywheel entries from $lock_file without deleting local source files"
      fi
    fi
    return 0
  fi

  while IFS= read -r skill_name; do
    if [ -n "$skill_name" ]; then
      skill_names+=("$skill_name")
    fi
  done < <(skill_names_for_scope "$lock_file" "$install_dir")

  if [ "${#skill_names[@]}" -eq 0 ]; then
    echo "OK  no Flywheel skills recorded at $scope scope"
    return 0
  fi

  local -a cmd=(npx -y skills remove "${skill_names[@]}" --yes)
  if [ "$scope" = "global" ]; then
    cmd+=(--global)
  fi

  echo "OK  removing ${#skill_names[@]} Flywheel skill(s) from $scope scope"
  run "${cmd[@]}"
  if [ "$DRY_RUN" -eq 0 ]; then
    scrub_lock_file "$lock_file"
  fi
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
        global|project|all)
          REMOVE_SCOPE="$1"
          ;;
        *)
          echo "ERROR: unsupported scope: $1" >&2
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

case "$REMOVE_SCOPE" in
  global)
    remove_scope "global" "$GLOBAL_LOCK_FILE" "$GLOBAL_SKILLS_DIR"
    ;;
  project)
    remove_scope "project" "$PROJECT_LOCK_FILE" "$PROJECT_SKILLS_DIR"
    ;;
  all)
    remove_scope "global" "$GLOBAL_LOCK_FILE" "$GLOBAL_SKILLS_DIR"
    remove_scope "project" "$PROJECT_LOCK_FILE" "$PROJECT_SKILLS_DIR"
    ;;
esac
