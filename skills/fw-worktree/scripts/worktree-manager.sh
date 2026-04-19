#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  worktree-manager.sh create <branch-name> [base-branch]
  worktree-manager.sh list
  worktree-manager.sh path <branch-name>
  worktree-manager.sh switch <branch-name>
  worktree-manager.sh copy-env <branch-name>
  worktree-manager.sh cleanup <branch-name>
EOF
}

require_git_repo() {
  git rev-parse --show-toplevel >/dev/null 2>&1 || {
    echo "ERROR: not inside a git repository" >&2
    exit 1
  }
}

repo_root() {
  git rev-parse --show-toplevel
}

default_branch() {
  local branch=""
  branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || true)
  if [ -z "$branch" ]; then
    branch=$(git remote show origin 2>/dev/null | sed -n '/HEAD branch/s/.*: //p' | head -n1 || true)
  fi
  if [ -z "$branch" ] && command -v gh >/dev/null 2>&1; then
    branch=$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name 2>/dev/null || true)
  fi
  if [ -z "$branch" ]; then
    echo "ERROR: unable to determine the repository default branch safely; pass the base branch explicitly." >&2
    exit 1
  fi
  printf '%s\n' "$branch"
}

worktree_root() {
  printf '%s/.worktrees\n' "$(repo_root)"
}

env_copy_mode() {
  local mode
  mode="${FW_WORKTREE_ENV_COPY_MODE:-templates-only}"
  case "$mode" in
    none|templates-only|real-files)
      printf '%s\n' "$mode"
      ;;
    *)
      echo "ERROR: unsupported FW_WORKTREE_ENV_COPY_MODE '$mode' (expected none, templates-only, or real-files)" >&2
      exit 1
      ;;
  esac
}

ensure_ignore() {
  local root gitignore line
  root=$(repo_root)
  gitignore="$root/.gitignore"
  line=".worktrees/"
  mkdir -p "$(dirname "$gitignore")"
  touch "$gitignore"
  if ! grep -Fxq "$line" "$gitignore"; then
    printf '\n%s\n' "$line" >>"$gitignore"
    echo "Added $line to .gitignore"
  fi
}

copy_template_env_files_to() {
  local dest root copied src base
  dest="$1"
  root=$(repo_root)
  copied=0
  while IFS= read -r -d '' src; do
    base=$(basename "$src")
    case "$base" in
      .env.example|.env.sample|.env.template|.env.defaults|.env.dist|*.example|*.sample|*.template|*.defaults|*.dist)
        cp -f "$src" "$dest/$base"
        copied=1
        ;;
      *)
        continue
        ;;
    esac
  done < <(find "$root" -maxdepth 1 -type f \( -name '.env' -o -name '.env.*' \) -print0)

  if [ "$copied" -eq 1 ]; then
    echo "Copied top-level template env files into $dest"
  else
    echo "No top-level template env files found to copy"
  fi
}

copy_real_env_files_to() {
  local dest root copied src base
  dest="$1"
  root=$(repo_root)
  copied=0
  while IFS= read -r -d '' src; do
    base=$(basename "$src")
    case "$base" in
      .env.example|.env.sample|.env.template|.env.defaults|.env.dist|*.example|*.sample|*.template|*.defaults|*.dist)
        continue
        ;;
    esac
    cp -f "$src" "$dest/$base"
    copied=1
  done < <(find "$root" -maxdepth 1 -type f \( -name '.env' -o -name '.env.*' \) -print0)

  if [ "$copied" -eq 1 ]; then
    echo "Copied top-level real env files into $dest"
  else
    echo "No top-level real env files found to copy"
  fi
}

warn_about_real_env_files() {
  local branch root found src base files
  branch="$1"
  root=$(repo_root)
  found=0
  files=""
  while IFS= read -r -d '' src; do
    base=$(basename "$src")
    case "$base" in
      .env.example|.env.sample|.env.template|.env.defaults|.env.dist|*.example|*.sample|*.template|*.defaults|*.dist)
        continue
        ;;
    esac
    if [ "$found" -eq 1 ]; then
      files="$files, "
    fi
    files="$files$base"
    found=1
  done < <(find "$root" -maxdepth 1 -type f \( -name '.env' -o -name '.env.*' \) -print0)

  if [ "$found" -eq 1 ]; then
    echo "WARNING: real env files were not copied by default: $files"
    echo "NEXT: bash \"$(repo_root)/skills/fw-worktree/scripts/worktree-manager.sh\" copy-env \"$branch\""
  fi

  if [ -f "$root/.envrc" ] || [ -f "$root/.mise.toml" ] || [ -f "$root/mise.toml" ]; then
    echo "NOTE: review and trust direnv/mise files manually in the new worktree if needed."
  fi
}

resolve_branch_path() {
  local branch path
  branch="$1"
  path="$(worktree_root)/$branch"
  if [ -d "$path" ]; then
    printf '%s\n' "$path"
    return 0
  fi
  return 1
}

command_create() {
  local branch base wt_root path start_ref mode
  branch="${1:-}"
  base="${2:-}"
  if [ -z "$branch" ]; then
    echo "ERROR: create requires <branch-name>" >&2
    usage
    exit 1
  fi

  require_git_repo
  wt_root=$(worktree_root)
  path="$wt_root/$branch"
  base="${base:-$(default_branch)}"
  start_ref="$base"

  ensure_ignore
  mkdir -p "$(dirname "$path")"

  if [ -d "$path" ]; then
    echo "ERROR: worktree already exists at $path" >&2
    exit 1
  fi

  if git remote get-url origin >/dev/null 2>&1; then
    git fetch --no-tags origin "$base" >/dev/null 2>&1 || true
    if git rev-parse --verify "origin/$base" >/dev/null 2>&1; then
      start_ref="origin/$base"
    fi
  fi

  if git show-ref --verify --quiet "refs/heads/$branch"; then
    git worktree add "$path" "$branch"
  else
    git worktree add "$path" -b "$branch" "$start_ref"
  fi

  mode=$(env_copy_mode)
  case "$mode" in
    none)
      echo "Skipped env-file copy by policy (FW_WORKTREE_ENV_COPY_MODE=none)"
      ;;
    templates-only)
      copy_template_env_files_to "$path"
      warn_about_real_env_files "$branch"
      ;;
    real-files)
      copy_template_env_files_to "$path"
      copy_real_env_files_to "$path"
      echo "Copied real env files by policy (FW_WORKTREE_ENV_COPY_MODE=real-files)"
      ;;
  esac

  echo "WORKTREE_PATH:$path"
  echo "BRANCH:$branch"
  echo "BASE:$base"
  echo "ENV_COPY_MODE:$mode"
  echo "NEXT: cd \"$path\""
}

command_list() {
  require_git_repo
  git worktree list
}

command_path() {
  local branch path
  branch="${1:-}"
  if [ -z "$branch" ]; then
    echo "ERROR: path requires <branch-name>" >&2
    usage
    exit 1
  fi
  require_git_repo
  path=$(resolve_branch_path "$branch") || {
    echo "ERROR: no worktree found for $branch" >&2
    exit 1
  }
  echo "$path"
  echo "NEXT: cd \"$path\""
}

command_copy_env() {
  local branch path
  branch="${1:-}"
  if [ -z "$branch" ]; then
    echo "ERROR: copy-env requires <branch-name>" >&2
    usage
    exit 1
  fi
  require_git_repo
  path=$(resolve_branch_path "$branch") || {
    echo "ERROR: no worktree found for $branch" >&2
    exit 1
  }
  copy_real_env_files_to "$path"
}

command_cleanup() {
  local branch path current_top base
  branch="${1:-}"
  if [ -z "$branch" ]; then
    echo "ERROR: cleanup requires <branch-name>" >&2
    usage
    exit 1
  fi
  require_git_repo
  path=$(resolve_branch_path "$branch") || {
    echo "ERROR: no worktree found for $branch" >&2
    exit 1
  }

  current_top=$(git rev-parse --show-toplevel)
  if [ "$current_top" = "$path" ]; then
    echo "ERROR: cannot remove the current worktree; run cleanup from another checkout" >&2
    exit 1
  fi

  if [ -n "$(git -C "$path" status --porcelain)" ]; then
    echo "ERROR: worktree $branch has uncommitted changes; clean or commit them first" >&2
    exit 1
  fi

  git worktree remove "$path"
  echo "Removed worktree at $path"

  base=$(default_branch)
  if git show-ref --verify --quiet "refs/heads/$branch" && git rev-parse --verify "$base" >/dev/null 2>&1; then
    if git merge-base --is-ancestor "$branch" "$base"; then
      git branch -d "$branch" || true
    fi
  fi
}

main() {
  local command
  command="${1:-}"
  shift || true

  case "$command" in
    create)
      command_create "$@"
      ;;
    list|ls)
      command_list
      ;;
    path|switch|go)
      command_path "$@"
      ;;
    copy-env)
      command_copy_env "$@"
      ;;
    cleanup|clean)
      command_cleanup "$@"
      ;;
    ""|-h|--help|help)
      usage
      ;;
    *)
      echo "ERROR: unknown command: $command" >&2
      usage
      exit 1
      ;;
  esac
}

main "$@"
