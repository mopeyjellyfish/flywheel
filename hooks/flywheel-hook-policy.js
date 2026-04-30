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

function unique(values) {
  return [...new Set(values.filter(Boolean))];
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

function isExampleSecretPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  const base = path.basename(normalized);
  return (
    /\.example(?:\.|$)/.test(normalized) ||
    /\.sample(?:\.|$)/.test(normalized) ||
    /\.template(?:\.|$)/.test(normalized) ||
    base === ".envrc" ||
    base === ".env.example" ||
    base === ".env.sample" ||
    base === ".env.template"
  );
}

function looksSensitivePath(filePath) {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  const base = path.basename(normalized);
  if (isExampleSecretPath(normalized)) {
    return false;
  }
  return (
    /^\.env(?:\.|$)/.test(base) ||
    /\.(?:pem|key|p12|pfx|crt|cer)$/i.test(base) ||
    /(?:^|\/)(?:id_rsa|id_dsa|id_ecdsa|id_ed25519|credentials|secrets?)(?:$|\.)/i.test(normalized)
  );
}

function looksInstalledFlywheelPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return (
    /\/\.codex\/plugins\/(?:cache\/fw-local|fw)(?:\/|$)/.test(normalized) ||
    /\/\.claude\/(?:plugins|marketplaces)\/(?:[^/]+\/)*flywheel(?:\/|$)/.test(normalized)
  );
}

function parseApplyPatchPaths(command) {
  const files = [];
  const pattern = /^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm;
  let match;
  while ((match = pattern.exec(command))) {
    files.push(match[1].trim());
  }
  return files;
}

function toolInputPaths(payload) {
  const input = payload?.tool_input || {};
  const direct = [
    input.file_path,
    input.path,
    input.notebook_path,
    input.absolute_path,
    input.relative_path,
  ];
  const command = String(input.command || "");
  return unique([...direct, ...parseApplyPatchPaths(command)]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim()));
}

function resolveHookPath(repoRoot, cwd, filePath) {
  if (!filePath) {
    return "";
  }
  if (path.isAbsolute(filePath)) {
    return path.normalize(filePath);
  }
  return path.normalize(path.join(repoRoot || cwd || process.cwd(), filePath));
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
  const reviewRoot = path.join(repoRoot, ".context", "flywheel", "review");
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

function toolName(payload) {
  return String(payload?.tool_name || "");
}

function isBashTool(payload) {
  const name = toolName(payload);
  return name === "Bash" || (!name && typeof payload?.tool_input?.command === "string");
}

function isEditTool(payload) {
  const name = toolName(payload);
  return /^(?:apply_patch|Edit|Write|MultiEdit)$/i.test(name);
}

function isMcpWriteTool(payload) {
  const name = toolName(payload);
  return /^mcp__.*__(?:create|write|update|delete|remove|upsert|merge|replace|set|add)/i.test(name);
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

function buildWriteDenyReason({ payload, repoRoot, cwd }) {
  if (!isEditTool(payload)) {
    return null;
  }

  const targets = toolInputPaths(payload).map((filePath) => resolveHookPath(repoRoot, cwd, filePath));
  const sensitive = targets.find(looksSensitivePath);
  if (sensitive) {
    return `Flywheel blocked a write to sensitive-looking path \`${sensitive}\`. Use an example/template file or ask for explicit approval with the secret-handling plan.`;
  }

  const installed = targets.find(looksInstalledFlywheelPath);
  if (installed) {
    return `Flywheel blocked a write to installed Flywheel plugin state \`${installed}\`. Edit the source checkout instead, then refresh the install.`;
  }

  return null;
}

function buildPreToolCheckpointReasons({ payload }) {
  const reasons = [];
  if (isMcpWriteTool(payload)) {
    reasons.push(`MCP write-like tool \`${toolName(payload)}\` may modify external state`);
  }
  return reasons;
}

function newestFile(rootDir, predicate = () => true) {
  if (!fs.existsSync(rootDir)) {
    return "";
  }
  const entries = fs.readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && predicate(entry.name))
    .map((entry) => {
      const fullPath = path.join(rootDir, entry.name);
      return { fullPath, mtime: fs.statSync(fullPath).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  return entries[0]?.fullPath || "";
}

function realPathPrefix(filePath) {
  const resolved = path.resolve(filePath);
  if (fs.existsSync(resolved)) {
    return fs.realpathSync.native(resolved);
  }
  const parent = path.dirname(resolved);
  if (parent === resolved) {
    return resolved;
  }
  return path.join(realPathPrefix(parent), path.basename(resolved));
}

function repoRelative(repoRoot, fullPath) {
  if (!repoRoot || !fullPath) {
    return "";
  }
  return path.relative(realPathPrefix(repoRoot), realPathPrefix(fullPath)).replace(/\\/g, "/");
}

function buildSessionContext(repoRoot, currentBranch) {
  if (!repoRoot) {
    return "";
  }

  const status = safeGit(repoRoot, ["status", "--short"]);
  const statusLine = status ? `dirty tree (${status.split(/\r?\n/).length} changed path(s))` : "clean tree";
  const newestPlan = newestFile(path.join(repoRoot, "docs", "plans"), (name) => /-plan\.md$/.test(name));
  const planLine = newestPlan ? ` Latest plan: \`${repoRelative(repoRoot, newestPlan)}\`.` : "";

  return [
    `Flywheel session context: branch \`${currentBranch || "unknown"}\`, ${statusLine}.`,
    "Use `fw:start`/`fw:shape`/`fw:work`/`fw:review`/`fw:commit` according to the earliest missing stage.",
    "Do not cross from a plan or spec into implementation without host-question confirmation, unless the user explicitly asked to implement in the same turn.",
    planLine,
  ].join(" ").trim();
}

function buildPromptContext(prompt) {
  const text = String(prompt || "");
  const notes = [];

  if (/(?:^|\s)(?:\$|\/)?fw:work\b/i.test(text) || /\b(?:plan|spec|specification)\b[\s\S]{0,80}\b(?:implement|work|execute|start)\b/i.test(text)) {
    notes.push("If work starts from a plan or spec, confirm the user is happy with that artifact as the implementation basis using the host question tool unless this prompt explicitly asks to implement it now.");
  }

  if (/\b(?:commit|push|pull request|pr)\b/i.test(text)) {
    notes.push("For branch finishing, use the `fw:commit` flow: verify readiness, commit honestly, push, and create or refresh the PR with testing and monitoring notes.");
  }

  if (/\b(?:review|code review)\b/i.test(text)) {
    notes.push("For review requests, lead with severity-ranked findings and include file/line evidence before summaries.");
  }

  return notes.length ? `Flywheel prompt routing context: ${notes.join(" ")}` : "";
}

function normalizeRepoPath(filePath) {
  return String(filePath || "").replace(/\\/g, "/");
}

function pathsNeedValidation(files) {
  return files.some((file) => {
    const normalized = normalizeRepoPath(file);
    return (
      /^(?:src|app|lib|server|client|web|frontend|backend|api|components|pages|packages|services|tests?|spec|e2e)\//i.test(normalized) ||
      /(?:^|\/)(?:package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb|Makefile|Dockerfile|docker-compose\.ya?ml|.*config\.(?:js|cjs|mjs|ts|json|ya?ml|toml))$/i.test(normalized) ||
      /^(?:\.github\/workflows|infra|terraform|migrations)\//i.test(normalized)
    );
  });
}

function toolTargetPaths(payload, repoRoot) {
  return toolInputPaths(payload).map((filePath) =>
    repoRoot ? repoRelative(repoRoot, resolveHookPath(repoRoot, payload?.cwd, filePath)) : filePath,
  );
}

function buildPostToolContext({ payload, repoRoot, policy }) {
  const notes = [];
  const name = toolName(payload);
  const responseText = JSON.stringify(payload?.tool_response || {});
  const paths = toolTargetPaths(payload, repoRoot);

  if (name === "Bash" && /(?:exit[_ ]?code|status|code)["']?\s*[:=]\s*[1-9]/i.test(responseText)) {
    notes.push("The previous Bash command appears to have failed; explain the failure and rerun or mark the validation gap before claiming completion.");
  }

  if (isEditTool(payload) && pathsNeedValidation(paths)) {
    notes.push("This edit touched project source, test, dependency, build, CI, infra, or config files; run the project-relevant targeted checks before completion, or explicitly report the validation gap.");
  }

  if (
    policy?.browserProofRequired &&
    isEditTool(payload) &&
    looksBrowserVisible(paths) &&
    !hasBrowserProof(repoRoot)
  ) {
    notes.push("This project requires browser proof for browser-visible changes and no reusable browser proof was found yet.");
  }

  if (paths.some((filePath) => /(?:^|\/)docs\/(?:plans|specs)\/.*(?:-plan|-spec)?\.md$/i.test(normalizeRepoPath(filePath)))) {
    notes.push("A project plan/spec artifact changed; run or report `fw:document-review` before handing it to implementation.");
  }

  return notes.length ? `Flywheel post-tool context: ${notes.join(" ")}` : "";
}

function claimsCompletion(message) {
  return /\b(?:done|complete|completed|finished|implemented|fixed|committed|pushed|opened PR|validation passed|tests passed)\b/i.test(message);
}

function hasHandoffOrEvidence(message) {
  return /Flywheel handoff/i.test(message) || (/\bEvidence:/i.test(message) && /\bNext:/i.test(message));
}

function buildStopReason({ payload, changedFiles }) {
  if (payload?.stop_hook_active) {
    return "";
  }
  if (changedFiles.length === 0) {
    return "";
  }

  const message = String(payload?.last_assistant_message || "");
  if (!claimsCompletion(message) || hasHandoffOrEvidence(message)) {
    return "";
  }

  return "Flywheel stop checkpoint: changed files remain and the last message looks like a completion claim. Continue once to report validation evidence, changed-file status, and a Flywheel handoff with the next stage.";
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

function additionalContext(eventName, context) {
  return {
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: context,
    },
  };
}

function blockStop(reason) {
  return {
    decision: "block",
    reason,
  };
}

function normalizeEvent(event, payload) {
  if (payload?.hook_event_name) {
    return payload.hook_event_name;
  }
  const eventMap = {
    "pre-tool": "PreToolUse",
    "post-tool": "PostToolUse",
    "user-prompt": "UserPromptSubmit",
    stop: "Stop",
    "session-start": "SessionStart",
    "permission-request": "PermissionRequest",
  };
  return eventMap[event] || event;
}

function main() {
  return readStdin().then((stdinText) => {
    const event = process.argv[2];
    const host = process.argv[3];
    const payload = safeJson(stdinText);
    const eventName = normalizeEvent(process.argv[2], payload);
    const command = String(payload?.tool_input?.command || "");
    const cwd = payload?.cwd || process.cwd();
    const repoRoot = findRepoRoot(cwd);
    const policy = loadPolicy(repoRoot);
    const currentBranch = repoRoot ? safeGit(repoRoot, ["branch", "--show-current"]) : "";
    const defaultBranch = repoRoot ? resolveDefaultBranch(repoRoot) : "";
    const changedFiles = repoRoot ? listChangedFiles(repoRoot) : [];

    if (eventName === "SessionStart") {
      const context = buildSessionContext(repoRoot, currentBranch);
      if (context) {
        process.stdout.write(JSON.stringify(additionalContext("SessionStart", context)));
      }
      return;
    }

    if (eventName === "UserPromptSubmit") {
      const context = buildPromptContext(payload?.prompt);
      if (context) {
        process.stdout.write(JSON.stringify(additionalContext("UserPromptSubmit", context)));
      }
      return;
    }

    if (eventName === "PostToolUse") {
      const context = repoRoot ? buildPostToolContext({ payload, repoRoot, policy }) : "";
      if (context) {
        process.stdout.write(JSON.stringify(additionalContext("PostToolUse", context)));
      }
      return;
    }

    if (eventName === "Stop") {
      const reason = buildStopReason({ payload, changedFiles });
      if (reason) {
        process.stdout.write(JSON.stringify(blockStop(reason)));
      }
      return;
    }

    if (eventName !== "PreToolUse" && eventName !== "PermissionRequest") {
      return;
    }

    const writeDenyReason = buildWriteDenyReason({ payload, repoRoot, cwd });
    if (writeDenyReason) {
      const response = host === "claude" ? claudeDeny(writeDenyReason) : codexDeny(writeDenyReason);
      process.stdout.write(JSON.stringify(response));
      return;
    }

    if (isBashTool(payload) && command) {
      const destructive = dangerousReason(command, currentBranch, defaultBranch);
      if (destructive) {
        const response = host === "claude" ? claudeDeny(destructive) : codexDeny(destructive);
        process.stdout.write(JSON.stringify(response));
        return;
      }
    }

    if (!repoRoot) {
      return;
    }

    const checkpointReasons = [
      ...buildCheckpointReasons({
        command,
        repoRoot,
        policy,
        currentBranch,
        defaultBranch,
        changedFiles,
      }),
      ...buildPreToolCheckpointReasons({ payload }),
    ];

    if (checkpointReasons.length > 0) {
      const reason = `Flywheel checkpoint: ${checkpointReasons.join("; ")}.`;
      const response = host === "claude" ? claudeAsk(reason) : codexWarn(reason);
      process.stdout.write(JSON.stringify(response));
    }
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
