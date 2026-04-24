#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const smoke = process.argv.includes("--smoke");
const codexSessionSmoke = process.argv.includes("--codex-session-smoke");
const hostArgIndex = process.argv.indexOf("--host");
const requestedHost = hostArgIndex >= 0 ? process.argv[hostArgIndex + 1] : "all";
const host = ["all", "codex", "claude"].includes(requestedHost) ? requestedHost : "all";
const includeCodex = host === "all" || host === "codex";
const includeClaude = host === "all" || host === "claude";
const requireClaudeInstall = host === "claude";
const claudePluginName = "fw";
const claudeInstalledPluginName = "flywheel";
const claudeMarketplaceName = "flywheel";
const claudePluginId = `${claudeInstalledPluginName}@${claudeMarketplaceName}`;
const claudeCommandPrefix = `/${claudePluginName}:`;

function optionalClaudeInstallDetail(detail) {
  return `${detail}; skipped in broad verification because this checkout is not currently installed in Claude. Run \`make install/claude\` and rerun \`node scripts/flywheel-doctor.js --host claude --smoke\` to require the installed Claude path.`;
}

function isClaudeAuthenticationFailure(detail) {
  return /(?:API Error:\s*401|authentication_error|Invalid authentication credentials|Failed to authenticate)/i.test(
    String(detail || ""),
  );
}

function optionalClaudeAuthenticationDetail(detail) {
  const errorKind = /\b401\b/.test(String(detail || "")) ? "API authentication error (401)" : "API authentication error";
  return `skipped in broad verification because Claude returned an ${errorKind}. Plugin install and /fw:* command registration were verified. Run \`claude auth status\`, fix Claude auth, then rerun \`node scripts/flywheel-doctor.js --host claude --smoke\` to require live Claude invocation.`;
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: options.timeoutMs,
    maxBuffer: options.maxBuffer,
  });
}

function parseJson(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return null;
  }
}

function checkFile(name, relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  return {
    name,
    ok: fs.existsSync(fullPath),
    detail: fs.existsSync(fullPath) ? relativePath : `missing ${relativePath}`,
  };
}

function skillDescriptions() {
  const skillsDir = path.join(repoRoot, "skills");
  if (!fs.existsSync(skillsDir)) {
    return [];
  }

  return fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map((skillName) => {
      const skillPath = path.join(skillsDir, skillName, "SKILL.md");
      if (!fs.existsSync(skillPath)) {
        return null;
      }

      const text = fs.readFileSync(skillPath, "utf8");
      const match = text.match(/^description:\s*(.*)$/m);
      if (!match) {
        return { skillName, description: "", length: 0 };
      }

      const description = match[1].trim().replace(/^["']|["']$/g, "");
      return { skillName, description, length: description.length };
    })
    .filter(Boolean);
}

function checkSkillDescriptionBudget() {
  const descriptions = skillDescriptions();
  const count = descriptions.length;
  const total = descriptions.reduce((sum, item) => sum + item.length, 0);
  const average = count === 0 ? 0 : Math.round(total / count);
  const longest = descriptions.reduce(
    (current, item) => item.length > current.length ? item : current,
    { skillName: "none", length: 0 },
  );
  const maxSingle = 180;
  const maxAverage = 150;
  const maxTotal = 4800;
  const missing = descriptions.filter((item) => item.length === 0).map((item) => item.skillName);
  const ok = count > 0 &&
    missing.length === 0 &&
    longest.length <= maxSingle &&
    average <= maxAverage &&
    total <= maxTotal;

  return {
    name: "Skill description context budget",
    ok,
    detail: ok
      ? `${count} descriptions, ${total} chars total, avg ${average}, max ${longest.length} (${longest.skillName})`
      : `keep SKILL.md descriptions concise: total ${total}/${maxTotal}, avg ${average}/${maxAverage}, max ${longest.length}/${maxSingle} (${longest.skillName})${missing.length ? `, missing: ${missing.join(", ")}` : ""}`,
  };
}

function checkSkillDescriptionDiscriminators() {
  const descriptions = new Map(skillDescriptions().map((item) => [item.skillName, item.description]));
  const requirements = {
    "architecture-strategy": [/architecture/i, /boundar|service|distributed|dependency/i],
    brainstorm: [/requirements|scope|fuzzy|idea/i, /planning|before planning/i],
    "browser-test": [/browser/i, /proof|acceptance|playwright/i],
    commit: [/branch|commit/i, /push|PR|pull request/i],
    "commit-message": [/Conventional Commit/i, /header|footer|breaking/i],
    debug: [/bugs?|regression|stack trace|broken/i, /evidence|fix/i],
    deepen: [/plan/i, /before implementation|before work|strengthen/i],
    docs: [/docs?|documentation|Diataxis/i, /setup|API|CLI|config|workflow|behavior/i],
    "document-review": [/requirements|plan/i, /review|fix queue|ranked/i],
    ideate: [/ideas?|next bets?/i, /ranked|chosen|before brainstorming/i],
    incident: [/incident|live evidence/i, /mitigation|rollback|blast radius|patch/i],
    logging: [/logging/i, /events?|fields?|correlation/i],
    maintainability: [/edit cost|future edit|maintain/i, /wrappers?|helpers?|naming|cohesion|ownership/i],
    observability: [/observability|logs?|metrics?|traces?|dashboards?/i, /validation|supportability|runtime/i],
    optimize: [/optimization|latency|throughput|cost|query|build/i, /measured|proof|improvements/i],
    "pattern-recognition": [/pattern/i, /DTO|repositories|ports|builders|DDD/i],
    plan: [/implementation plans?/i, /read-only|before execution/i],
    polish: [/browser/i, /polish|tighten|live feedback/i],
    research: [/research|topic/i, /current-source|evidence|current/i],
    review: [/code review|review/i, /bugs?|regressions?|missing tests?|readiness/i],
    rollout: [/rollout|release/i, /rollback|validation|runtime-risky|blast radius/i],
    run: [/remaining Flywheel stages|remaining stages/i, /coordinated|shape-to-commit|manual stages/i],
    setup: [/setup|bootstrap|onboarding/i, /tool|readiness|host posture|workflow/i],
    shape: [/shape|before implementation/i, /ideation|brainstorming|planning|plan-deepening/i],
    simplify: [/accidental complexity|simpl/i, /wrappers?|abstractions?|orchestration/i],
    spin: [/docs\/solutions|durable lessons/i, /completed work|verified fixes|patterns/i],
    start: [/route|earliest useful stage/i, /shape|work|review|commit|spin/i],
    "test-driven-development": [/red-green-refactor|test-driven|TDD/i, /feature|bugfix|refactor|behavior/i],
    verify: [/fresh evidence|verify/i, /claiming|claims?|tests|lint|builds|fixes/i],
    work: [/implementation work|execute/i, /plans?|specs?|todos?|validation|tracked changes/i],
    worktree: [/worktrees?|isolated/i, /branch|parallel checkouts?|cleanup|review targets/i],
  };
  const failures = [];

  for (const [skillName, patterns] of Object.entries(requirements)) {
    const description = descriptions.get(skillName);
    if (!description) {
      failures.push(`${skillName}: missing description`);
      continue;
    }

    const missing = patterns.filter((pattern) => !pattern.test(description));
    if (missing.length > 0) {
      failures.push(`${skillName}: ${description}`);
    }
  }

  return {
    name: "Skill description discriminators",
    ok: failures.length === 0,
    detail: failures.length === 0
      ? `${Object.keys(requirements).length} skill descriptions keep their routing triggers`
      : `descriptions lost key routing triggers: ${failures.join("; ")}`,
  };
}

function checkHostInteractionQuestionToolContract() {
  const contractPath = path.join(repoRoot, "skills", "references", "host-interaction-contract.md");
  if (!fs.existsSync(contractPath)) {
    return {
      name: "Host question tool contract",
      ok: false,
      detail: "missing skills/references/host-interaction-contract.md",
    };
  }

  const text = fs.readFileSync(contractPath, "utf8");
  const requirements = [
    ["blocking tool call", /blocking tool call/i],
    ["Claude AskUserQuestion", /AskUserQuestion/i],
    ["Codex request_user_input", /request_user_input/i],
    ["Codex 2-3 options", /2-3[\s\S]{0,120}Codex|Codex[\s\S]{0,160}2-3/i],
    ["Claude multiSelect guidance", /multiSelect/i],
    ["fallback waits for reply", /fallback[\s\S]{0,200}wait/i],
    ["allowed-tools caveat", /allowed-tools[\s\S]{0,220}does not/i],
  ];
  const missing = requirements
    .filter(([, pattern]) => !pattern.test(text))
    .map(([label]) => label);
  const ok = missing.length === 0;

  return {
    name: "Host question tool contract",
    ok,
    detail: ok
      ? "contract requires real question tool calls for Claude Code and Codex"
      : `host interaction contract is missing: ${missing.join(", ")}`,
  };
}

function checkSpinBeforeCommitContract() {
  const files = [
    ["README workflow", "README.md", /shape -> work -> review -> optional spin -> commit/i],
    ["start backbone", "skills/start/SKILL.md", /optional fw:spin -> fw:commit|optional `fw:spin`, and `fw:commit`|optional spin -> fw:commit/i],
    ["run backbone", "skills/run/SKILL.md", /shape -> work -> review -> optional spin -> commit/i],
    ["commit checkpoint", "skills/commit/SKILL.md", /Pre-Commit Spin Checkpoint/i],
    ["work handoff", "skills/work/references/commit-workflow.md", /Pre-Commit Spin Checkpoint/i],
    ["commit eval case", "evals/fw-commit/cases.jsonl", /pre_commit_spin_checkpoint/i],
  ];
  const missing = files
    .filter(([, relativePath, pattern]) => {
      const fullPath = path.join(repoRoot, relativePath);
      return !fs.existsSync(fullPath) || !pattern.test(fs.readFileSync(fullPath, "utf8"));
    })
    .map(([label]) => label);

  return {
    name: "Spin before commit contract",
    ok: missing.length === 0,
    detail: missing.length === 0
      ? "workflow surfaces keep optional spin before final commit"
      : `spin-before-commit contract missing from: ${missing.join(", ")}`,
  };
}

function checkWorkflowGatesContract() {
  const files = [
    ["shared reference", "skills/references/workflow-gates.md", /Flywheel handoff[\s\S]*Stage:[\s\S]*Artifact:[\s\S]*Ready:[\s\S]*Open decisions:[\s\S]*Evidence:[\s\S]*Next:/i],
    ["plan-ready gate", "skills/references/workflow-gates.md", /Plan-Ready/i],
    ["work-ready gate", "skills/references/workflow-gates.md", /Work-Ready/i],
    ["review-ready gate", "skills/references/workflow-gates.md", /Review-Ready/i],
    ["commit-ready gate", "skills/references/workflow-gates.md", /Commit-Ready/i],
    ["start handoff", "skills/start/SKILL.md", /workflow-gates\.md[\s\S]*Stage, Artifact, Ready, Open decisions,\s*Evidence, and Next/i],
    ["shape handoff", "skills/shape/SKILL.md", /Shape-Ready[\s\S]*canonical handoff/i],
    ["plan handoff", "skills/plan/SKILL.md", /Plan-Ready[\s\S]*handoff card/i],
    ["work handoff", "skills/work/SKILL.md", /Work-Ready[\s\S]*handoff card/i],
    ["review handoff", "skills/review/SKILL.md", /Review-Ready[\s\S]*Flywheel handoff/i],
    ["commit gate", "skills/commit/SKILL.md", /Commit-Ready[\s\S]*committing, pushing, or creating a PR/i],
    ["journey eval", "evals/flywheel-handoff-gates/manifest.json", /flywheel-handoff-gates/i],
  ];
  const missing = files
    .filter(([, relativePath, pattern]) => {
      const fullPath = path.join(repoRoot, relativePath);
      return !fs.existsSync(fullPath) || !pattern.test(fs.readFileSync(fullPath, "utf8"));
    })
    .map(([label]) => label);

  return {
    name: "Workflow handoff and gates contract",
    ok: missing.length === 0,
    detail: missing.length === 0
      ? "main workflow surfaces use the shared handoff card and readiness gates"
      : `handoff/gates contract missing from: ${missing.join(", ")}`,
  };
}

function checkCommitDefaultPublishContract() {
  const files = [
    ["publish-by-default principle", "skills/commit/SKILL.md", /Publish by default[\s\S]*commit through push and PR creation or refresh/i],
    ["full finish path", "skills/commit/SKILL.md", /default non-local path is publish[\s\S]*commit[\s\S]*push[\s\S]*create or refresh the PR/i],
    ["push command", "skills/commit/SKILL.md", /git push --set-upstream origin HEAD/i],
    ["existing PR refresh", "skills/commit/SKILL.md", /Existing open PR[\s\S]*refresh the title and body/i],
    ["finish closeout", "skills/commit/SKILL.md", /finish summary[\s\S]*branch name, push result, and PR URL/i],
    ["commit rubric", "evals/fw-commit/rubric.md", /push plus PR creation or refresh as the default finish path/i],
  ];
  const missing = files
    .filter(([, relativePath, pattern]) => {
      const fullPath = path.join(repoRoot, relativePath);
      return !fs.existsSync(fullPath) || !pattern.test(fs.readFileSync(fullPath, "utf8"));
    })
    .map(([label]) => label);

  return {
    name: "Commit default publish contract",
    ok: missing.length === 0,
    detail: missing.length === 0
      ? "commit defaults to push plus PR creation or refresh with a clear close-out summary"
      : `commit publish contract missing from: ${missing.join(", ")}`,
  };
}

function checkCodexRootRouterPrompt() {
  const manifestPath = path.join(repoRoot, ".codex-plugin", "plugin.json");
  const manifest = fs.existsSync(manifestPath)
    ? parseJson(fs.readFileSync(manifestPath, "utf8"))
    : null;
  const defaultPrompt = manifest?.interface?.defaultPrompt;
  const promptText = Array.isArray(defaultPrompt) ? defaultPrompt.join("\n") : "";
  const hasRootFw = /\$fw\b/.test(promptText);
  const hasStart = /\$fw:start\b/.test(promptText);
  const hasFlywheelAlias = /\$flywheel\b/.test(promptText);
  const ok = hasRootFw && hasStart && hasFlywheelAlias;

  return {
    name: "Codex root router prompt",
    ok,
    detail: ok
      ? ".codex-plugin/plugin.json maps $fw and bare $flywheel to $fw:start"
      : ".codex-plugin/plugin.json should describe $fw and bare $flywheel as root aliases for $fw:start",
  };
}

function findStandaloneGlobalFlywheelSkills() {
  const agentsHome = process.env.AGENTS_HOME || path.join(process.env.HOME || "", ".agents");
  const installDir = path.join(agentsHome, "skills");
  if (!fs.existsSync(installDir)) {
    return [];
  }

  const localSource = path.join(repoRoot, "skills");
  const localSkillNames = fs.existsSync(localSource)
    ? new Set(fs.readdirSync(localSource, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => fs.existsSync(path.join(localSource, name, "SKILL.md"))))
    : new Set();

  return fs.readdirSync(installDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => {
      const skillDir = path.join(installDir, name);
      const candidateFiles = [
        path.join(skillDir, "SKILL.md"),
        path.join(skillDir, "agents", "openai.yaml"),
      ];
      const text = candidateFiles
        .filter((file) => fs.existsSync(file))
        .map((file) => fs.readFileSync(file, "utf8"))
        .join("\n");
      const hasBrand = /\bFlywheel\b/i.test(text);
      const hasCommand = /(?:\$|\/)(?:flywheel|fw)(?::[a-z0-9-]+)?\b/i.test(text);
      return localSkillNames.has(name) ? hasBrand || hasCommand : hasBrand && hasCommand;
    })
    .sort();
}

function checkNoStandaloneGlobalFlywheelSkillsForCodex() {
  const matches = findStandaloneGlobalFlywheelSkills();
  const ok = matches.length === 0;
  return {
    name: "No standalone Flywheel skills in Codex",
    ok,
    detail: ok
      ? "no ~/.agents/skills Flywheel entries that would appear as unnamespaced $start-style skills"
      : `remove standalone Flywheel skills from ~/.agents/skills (${matches.join(", ")}); run make install/codex to clean them up`,
  };
}

function checkCodexHooksFeatureEnabled() {
  const codexHome = process.env.CODEX_HOME || path.join(process.env.HOME || "", ".codex");
  const configPath = path.join(codexHome, "config.toml");
  if (!fs.existsSync(configPath)) {
    return {
      name: "Codex hooks feature flag",
      ok: false,
      detail: `missing ${configPath}`,
    };
  }

  const text = fs.readFileSync(configPath, "utf8");
  const ok = /\[features\][\s\S]*?^\s*codex_hooks\s*=\s*true\s*$/m.test(text);
  return {
    name: "Codex hooks feature flag",
    ok,
    detail: ok ? "config.toml enables codex_hooks" : "config.toml is missing [features].codex_hooks = true",
  };
}

function checkCodexHooksInstalled() {
  const codexHome = process.env.CODEX_HOME || path.join(process.env.HOME || "", ".codex");
  const hooksPath = path.join(codexHome, "hooks.json");
  if (!fs.existsSync(hooksPath)) {
    return {
      name: "Flywheel Codex hook guardrail",
      ok: false,
      detail: `missing ${hooksPath}`,
    };
  }

  const payload = parseJson(fs.readFileSync(hooksPath, "utf8"));
  const groups = Array.isArray(payload?.hooks?.PreToolUse) ? payload.hooks.PreToolUse : [];
  const present = groups.some((group) =>
    Array.isArray(group?.hooks) &&
    group.hooks.some((hook) => typeof hook?.command === "string" && hook.command.includes("flywheel-hook-policy.js")),
  );

  return {
    name: "Flywheel Codex hook guardrail",
    ok: present,
    detail: present
      ? "hooks.json contains the Flywheel PreToolUse guardrail"
      : "hooks.json is missing the Flywheel PreToolUse guardrail",
  };
}

function checkFlywheelVisibleToCodex() {
  const promptInput = run("codex", ["debug", "prompt-input", "test"]);
  if (promptInput.error) {
    return {
      name: "Flywheel visible to Codex",
      ok: false,
      detail: promptInput.error.message,
    };
  }

  const output = `${promptInput.stdout || ""}\n${promptInput.stderr || ""}`;
  const visible = /\bfw:start\b/.test(output);

  return {
    name: "Flywheel visible to Codex",
    ok: promptInput.status === 0 && visible,
    detail:
      promptInput.status !== 0
        ? output.trim() || "codex debug prompt-input failed"
        : visible
          ? "codex debug prompt-input includes fw:start"
          : "codex debug prompt-input is missing fw:start; refresh the local cache and restart Codex",
  };
}

function codexSessionSmokeCheck() {
  if (!codexSessionSmoke) {
    return {
      name: "Flywheel visible to current Codex session",
      ok: true,
      detail: "skipped; rerun with --codex-session-smoke after restarting Codex to verify live prompt visibility",
    };
  }

  const visibility = checkFlywheelVisibleToCodex();
  return {
    ...visibility,
    name: "Flywheel visible to current Codex session",
  };
}

function findFlywheelClaudePlugin(plugins) {
  return plugins.find((plugin) => {
    if (!plugin || plugin.id !== claudePluginId || plugin.enabled === false) {
      return false;
    }

    if ((plugin.scope === "local" || plugin.scope === "project") && plugin.projectPath) {
      return path.resolve(plugin.projectPath) === repoRoot;
    }

    return true;
  });
}

function checkClaudePluginValidation() {
  const validate = run("claude", ["plugin", "validate", "."]);
  return {
    name: "Claude plugin manifest",
    ok: validate.status === 0,
    detail:
      validate.status === 0
        ? "claude plugin validate . passed"
        : (validate.stdout || validate.stderr).trim() || "claude plugin validate . failed",
  };
}

function checkFlywheelVisibleToClaude() {
  const list = run("claude", ["plugin", "list", "--json"]);
  if (list.error) {
    return {
      name: "Flywheel visible to Claude",
      ok: false,
      detail: list.error.message,
    };
  }

  const plugins = parseJson(list.stdout);
  if (!Array.isArray(plugins)) {
    return {
      name: "Flywheel visible to Claude",
      ok: false,
      detail: "claude plugin list --json did not return valid JSON",
    };
  }

  const plugin = findFlywheelClaudePlugin(plugins);
  return {
    name: "Flywheel visible to Claude",
    ok: Boolean(plugin),
    detail: plugin
      ? `found ${plugin.id} at ${plugin.scope} scope`
      : `no enabled ${claudePluginId} install found for this repo in claude plugin list`,
  };
}

function checkFlywheelCallableInClaude() {
  const prompt = `${claudeCommandPrefix}start route this small bugfix into the right Flywheel stage`;
  const invoke = run(
    "claude",
    [
      "-p",
      "--no-session-persistence",
      "--output-format",
      "json",
      "--permission-mode",
      "plan",
      prompt,
    ],
    {
      timeoutMs: 2 * 60 * 1000,
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  if (invoke.error) {
    return {
      name: "Flywheel callable in Claude",
      ok: false,
      detail: invoke.error.message,
    };
  }

  const payload = parseJson(invoke.stdout);
  const output = typeof payload?.result === "string" ? payload.result : String(invoke.stdout || "").trim();
  const unknownCommand = new RegExp(`Unknown command:\\s*${claudeCommandPrefix.replace("/", "\\/")}start`, "i");
  const ok = invoke.status === 0 && !unknownCommand.test(output);

  return {
    name: "Flywheel callable in Claude",
    ok,
    detail: ok
      ? `${claudeCommandPrefix}start executed through the installed Claude plugin`
      : output || String(invoke.stderr || "").trim() || "claude invocation failed",
  };
}

function checkClaudeFlywheelCommands() {
  const inspect = run(process.execPath, ["scripts/claude-slash-commands.js", "--plugin", claudePluginName], {
    timeoutMs: 60 * 1000,
    maxBuffer: 10 * 1024 * 1024,
  });

  if (inspect.error) {
    return {
      name: "Flywheel commands registered in Claude",
      ok: false,
      detail: inspect.error.message,
    };
  }

  if (inspect.status !== 0) {
    return {
      name: "Flywheel commands registered in Claude",
      ok: false,
      detail: String(inspect.stderr || inspect.stdout || "").trim() || "claude command inspection failed",
    };
  }

  const payload = parseJson(inspect.stdout);
  if (!payload || !Array.isArray(payload.pluginCommands) || !Array.isArray(payload.missingSkillCommands)) {
    return {
      name: "Flywheel commands registered in Claude",
      ok: false,
      detail: "claude command inspection did not return valid JSON",
    };
  }

  const ok = Boolean(payload.plugin) && payload.missingSkillCommands.length === 0;
  const sample = payload.pluginCommands.slice(0, 3).join(", ");
  return {
    name: "Flywheel commands registered in Claude",
    ok,
    detail: ok
      ? `registered ${payload.pluginCommands.length} ${claudePluginName}:* commands (${sample})`
      : payload.missingSkillCommands.length > 0
        ? `missing ${payload.missingSkillCommands.join(", ")}`
        : `${claudePluginName} plugin metadata did not include registered commands`,
  };
}

function main() {
  const checks = [
    checkFile("Local config example", ".flywheel/config.local.example.yaml"),
    checkFile("Setup compatibility doc", "docs/setup/compatibility.md"),
    checkFile("Setup troubleshooting doc", "docs/setup/troubleshooting.md"),
    checkSkillDescriptionBudget(),
    checkSkillDescriptionDiscriminators(),
    checkHostInteractionQuestionToolContract(),
    checkSpinBeforeCommitContract(),
    checkWorkflowGatesContract(),
    checkCommitDefaultPublishContract(),
  ];

  if (includeCodex) {
    checks.unshift(checkFile("Plugin manifest", ".codex-plugin/plugin.json"));
    checks.unshift(checkFile("Shared hook policy script", "hooks/flywheel-hook-policy.js"));
    checks.push(checkCodexRootRouterPrompt());
    checks.push(checkNoStandaloneGlobalFlywheelSkillsForCodex());
  }
  if (includeClaude) {
    checks.unshift(checkFile("Claude hook pack", "hooks/hooks.json"));
    checks.unshift(checkFile("Claude marketplace manifest", ".claude-plugin/marketplace.json"));
    checks.unshift(checkFile("Claude plugin manifest", ".claude-plugin/plugin.json"));
  }

  const validate = run(process.execPath, ["scripts/flywheel-eval.js", "validate"]);
  checks.push({
    name: "Eval suite validation",
    ok: validate.status === 0,
    detail:
      validate.status === 0
        ? "all eval suites validated"
        : (validate.stdout || validate.stderr).trim() || "validation failed",
  });

  const evalWorkspaceReady = fs.existsSync(path.join(repoRoot, "tools/evals/node_modules"));
  checks.push({
    name: "Eval workspace dependencies",
    ok: evalWorkspaceReady,
    detail: evalWorkspaceReady
      ? "tools/evals dependencies installed"
      : "run `npm --prefix tools/evals install`",
  });

  if (evalWorkspaceReady) {
    const args = ["--prefix", "tools/evals", "run", "doctor"];
    if (smoke) {
      args.push("--", "--smoke", "--host", host);
    } else {
      args.push("--", "--host", host);
    }
    const workspaceDoctor = run("npm", args);
    checks.push({
      name: "Eval workspace doctor",
      ok: workspaceDoctor.status === 0,
      detail:
        workspaceDoctor.status === 0
          ? (workspaceDoctor.stdout || workspaceDoctor.stderr).trim().split(/\r?\n/).slice(-1)[0] || "doctor passed"
          : (workspaceDoctor.stdout || workspaceDoctor.stderr).trim() || "doctor failed",
    });
  }

  if (includeCodex) {
    checks.push(checkCodexHooksFeatureEnabled());
    checks.push(checkCodexHooksInstalled());
    checks.push(codexSessionSmokeCheck());
  }
  if (includeClaude) {
    const claudeInstalled = checkFlywheelVisibleToClaude();
    const claudeCommands = checkClaudeFlywheelCommands();
    checks.push(checkClaudePluginValidation());
    checks.push({
      name: claudeInstalled.name,
      ok: claudeInstalled.ok || !requireClaudeInstall,
      detail: claudeInstalled.ok
        ? claudeInstalled.detail
        : requireClaudeInstall
          ? claudeInstalled.detail
          : optionalClaudeInstallDetail(claudeInstalled.detail),
    });
    checks.push({
      name: claudeCommands.name,
      ok: claudeCommands.ok || !requireClaudeInstall && !claudeInstalled.ok,
      detail: claudeCommands.ok
        ? claudeCommands.detail
        : !requireClaudeInstall && !claudeInstalled.ok
          ? optionalClaudeInstallDetail(claudeCommands.detail)
          : claudeCommands.detail,
    });
    if (smoke) {
      const claudeCallable = claudeInstalled.ok
        ? checkFlywheelCallableInClaude()
        : {
            name: "Flywheel callable in Claude",
            ok: !requireClaudeInstall,
            detail: requireClaudeInstall
              ? "skipped because this checkout is not currently installed in Claude"
              : "skipped in broad verification because this checkout is not currently installed in Claude",
          };
      const authSkipped = !requireClaudeInstall && isClaudeAuthenticationFailure(claudeCallable.detail);
      checks.push({
        name: claudeCallable.name,
        ok: claudeCallable.ok || authSkipped,
        detail: claudeCallable.ok
          ? claudeCallable.detail
          : authSkipped
            ? optionalClaudeAuthenticationDetail(claudeCallable.detail)
            : claudeCallable.detail,
      });
    }
  }

  const ok = checks.every((check) => check.ok);
  for (const check of checks) {
    console.log(`${check.ok ? "OK" : "FAIL"}  ${check.name} - ${check.detail}`);
  }

  if (!ok) {
    console.log("");
    console.log("Next step: fix the failing checks above, then rerun `node scripts/flywheel-doctor.js`.");
  }

  process.exit(ok ? 0 : 1);
}

main();
