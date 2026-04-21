#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function safeJson(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return {};
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return {};
  }
}

function safeGit(cwd, args) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

function findRepoRoot(startCwd) {
  const resolved = path.resolve(startCwd || process.cwd());
  const gitRoot = safeGit(resolved, ["rev-parse", "--show-toplevel"]);
  if (gitRoot) {
    return gitRoot;
  }

  let current = resolved;
  while (true) {
    if (fs.existsSync(path.join(current, ".git"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

function stripInlineComment(line) {
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (char === "#" && !inSingle && !inDouble) {
      return line.slice(0, index);
    }
  }

  return line;
}

function parseScalar(rawValue) {
  const value = rawValue.trim();
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (value === "[]") {
    return [];
  }
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  if (/^-?\d+$/.test(value)) {
    return Number(value);
  }
  return value;
}

function parseYamlSubset(text) {
  const root = {};
  const stack = [{ indent: -1, object: root }];

  for (const originalLine of String(text || "").split(/\r?\n/)) {
    const withoutComment = stripInlineComment(originalLine);
    if (!withoutComment.trim()) {
      continue;
    }

    const match = withoutComment.match(/^(\s*)([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!match) {
      continue;
    }

    const indent = match[1].length;
    const key = match[2];
    const rawValue = match[3] ?? "";

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].object;
    if (!rawValue.trim()) {
      parent[key] = {};
      stack.push({ indent, object: parent[key] });
      continue;
    }

    parent[key] = parseScalar(rawValue);
  }

  return root;
}

function get(object, dottedPath) {
  return dottedPath.split(".").reduce((value, key) => {
    if (value && Object.prototype.hasOwnProperty.call(value, key)) {
      return value[key];
    }
    return undefined;
  }, object);
}

function loadPolicy(repoRoot) {
  const configPath = repoRoot ? path.join(repoRoot, ".flywheel", "config.local.yaml") : null;
  let config = {};

  if (configPath && fs.existsSync(configPath)) {
    config = parseYamlSubset(fs.readFileSync(configPath, "utf8"));
  }

  return {
    reviewRequired: get(config, "review.require_review_before_commit") === true,
    browserProofRequired:
      get(config, "commit.require_browser_proof_for_browser_visible_changes") === true ||
      get(config, "browser.require_proof_for_browser_visible_changes") === true,
    confirmPushToDefaultBranch:
      get(config, "commit.confirm_push_to_default_branch") === true,
  };
}

function listChangedFiles(repoRoot) {
  const commands = [
    ["diff", "--name-only", "--cached", "--"],
    ["diff", "--name-only", "--"],
    ["ls-files", "--others", "--exclude-standard"],
  ];

  const files = new Set();
  for (const args of commands) {
    const output = safeGit(repoRoot, args);
    for (const line of output.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed) {
        files.add(trimmed);
      }
    }
  }
  return [...files];
}

function looksBrowserVisible(files) {
  const browserExtension = /\.(?:tsx?|jsx?|vue|svelte|astro|html?|css|scss|sass|less)$/i;
  const browserPath = /(^|\/)(frontend|web|client|public|components|pages|ui)\//i;
  return files.some((file) => browserExtension.test(file) || browserPath.test(file));
}

function walkHasFiles(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return false;
  }

  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      const fullPath = path.join(current, entry.name);
      if (entry.isFile()) {
        return true;
      }
      if (entry.isDirectory()) {
        stack.push(fullPath);
      }
    }
  }

  return false;
}

function hasBrowserProof(repoRoot) {
  const evidenceRoot = path.join(repoRoot, ".context", "flywheel", "evidence");
  if (fs.existsSync(evidenceRoot)) {
    for (const bundle of fs.readdirSync(evidenceRoot, { withFileTypes: true })) {
      if (!bundle.isDirectory()) {
        continue;
      }
      const summaryPath = path.join(evidenceRoot, bundle.name, "summary.md");
      if (!fs.existsSync(summaryPath)) {
        continue;
      }
      const summary = fs.readFileSync(summaryPath, "utf8");
      if (/\|\s*browser\s*\|/i.test(summary) || /\.context\/flywheel\/browser\//i.test(summary)) {
        return true;
      }
    }
  }

  return walkHasFiles(path.join(repoRoot, ".context", "flywheel", "browser"));
}

function hasReviewArtifact(repoRoot, currentBranch) {
  const reviewRoot = path.join(repoRoot, ".context", "flywheel$flywheel:review");
  if (!fs.existsSync(reviewRoot)) {
    return false;
  }

  for (const runDir of fs.readdirSync(reviewRoot, { withFileTypes: true })) {
    if (!runDir.isDirectory()) {
      continue;
    }
    const metadataPath = path.join(reviewRoot, runDir.name, "metadata.json");
    if (!fs.existsSync(metadataPath)) {
      continue;
    }
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
      if (!currentBranch || metadata.branch === currentBranch) {
        return true;
      }
    } catch {
      // Ignore malformed metadata and keep searching.
    }
  }

  return false;
}

function resolveDefaultBranch(repoRoot) {
  return (
    safeGit(repoRoot, ["symbolic-ref", "refs/remotes/origin/HEAD"]).replace(/^refs\/remotes\/origin\//, "") ||
    safeGit(repoRoot, ["remote", "show", "origin"]).match(/HEAD branch:\s+([^\n]+)/)?.[1] ||
    ""
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function commandMentionsBranch(command, branch) {
  if (!branch) {
    return false;
  }
  const escaped = escapeRegExp(branch);
  return new RegExp(`(^|\\s|:|/|=)${escaped}(?=$|\\s)`).test(command);
}

function targetsDefaultBranch(command, currentBranch, defaultBranch) {
  if (!defaultBranch) {
    return false;
  }
  return currentBranch === defaultBranch || commandMentionsBranch(command, defaultBranch);
}

function isForcePush(command) {
  return /\bgit\s+push\b[\s\S]*?(?:--force-with-lease|--force|\s-f(?:\s|$))/i.test(command);
}

function dangerousReason(command, currentBranch, defaultBranch) {
  if (/\bgit\s+reset\s+--hard\b/i.test(command)) {
    return "Flywheel blocked `git reset --hard` because it discards work destructively.";
  }
  if (/\bgit\s+clean\b(?=[^\n]*\s-f)(?=[^\n]*\s-d)(?=[^\n]*\s-x)\b/i.test(command)) {
    return "Flywheel blocked `git clean -fdx` because it removes untracked files destructively.";
  }
  if (/\b(?:sudo\s+)?rm\b(?=[^\n]*\s-rf?\b)(?=[^\n]*\s\/(?:\s|$))/i.test(command)) {
    return "Flywheel blocked a recursive delete against the filesystem root.";
  }
  if (targetsDefaultBranch(command, currentBranch, defaultBranch) && isForcePush(command)) {
    return `Flywheel blocked a force push to the default branch \`${defaultBranch}\`.`;
  }
  return null;
}

function buildCheckpointReasons({ command, repoRoot, policy, currentBranch, defaultBranch, changedFiles }) {
  const reasons = [];

  if (/\bgit\s+commit\b/i.test(command)) {
    if (policy.reviewRequired && !hasReviewArtifact(repoRoot, currentBranch)) {
      reasons.push("no recent Flywheel review artifact was found for this branch");
    }
    if (
      policy.browserProofRequired &&
      looksBrowserVisible(changedFiles) &&
      !hasBrowserProof(repoRoot)
    ) {
      reasons.push("this diff looks browser-visible and no reusable browser proof was found");
    }
  }

  if (
    /\bgit\s+push\b/i.test(command) &&
    policy.confirmPushToDefaultBranch &&
    targetsDefaultBranch(command, currentBranch, defaultBranch)
  ) {
    reasons.push(`this push targets the default branch \`${defaultBranch}\``);
  }

  return reasons;
}

function claudeAsk(reason) {
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: reason,
    },
  };
}

function claudeDeny(reason) {
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  };
}

function codexDeny(reason) {
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  };
}

function codexWarn(reason) {
  return {
    systemMessage: `${reason} Codex's current Bash hook support cannot enforce an ask gate here yet, so confirm manually before proceeding.`,
  };
}

function main() {
  return readStdin().then((stdinText) => {
    const event = process.argv[2];
    const host = process.argv[3];
    const payload = safeJson(stdinText);
    const command = String(payload?.tool_input?.command || "");
    const cwd = payload?.cwd || process.cwd();
    const repoRoot = findRepoRoot(cwd);
    const policy = loadPolicy(repoRoot);
    const currentBranch = repoRoot ? safeGit(repoRoot, ["branch", "--show-current"]) : "";
    const defaultBranch = repoRoot ? resolveDefaultBranch(repoRoot) : "";
    const changedFiles = repoRoot ? listChangedFiles(repoRoot) : [];

    if (event !== "pre-tool" || !command) {
      return;
    }

    const destructive = dangerousReason(command, currentBranch, defaultBranch);
    if (destructive) {
      const response = host === "claude" ? claudeDeny(destructive) : codexDeny(destructive);
      process.stdout.write(JSON.stringify(response));
      return;
    }

    if (!repoRoot) {
      return;
    }

    const checkpointReasons = buildCheckpointReasons({
      command,
      repoRoot,
      policy,
      currentBranch,
      defaultBranch,
      changedFiles,
    });

    if (checkpointReasons.length === 0) {
      return;
    }

    const reason = `Flywheel checkpoint: ${checkpointReasons.join("; ")}.`;
    const response = host === "claude" ? claudeAsk(reason) : codexWarn(reason);
    process.stdout.write(JSON.stringify(response));
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
