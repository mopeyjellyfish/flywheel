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

function optionalClaudeInstallDetail(detail) {
  return `${detail}; skipped in broad verification because this checkout is not currently installed in Claude. Run \`make dev/claude\` and rerun \`node scripts/flywheel-doctor.js --host claude --smoke\` to require the installed Claude path.`;
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
  const visible = /\bflywheel:start\b/.test(output);

  return {
    name: "Flywheel visible to Codex",
    ok: promptInput.status === 0 && visible,
    detail:
      promptInput.status !== 0
        ? output.trim() || "codex debug prompt-input failed"
        : visible
          ? "codex debug prompt-input includes flywheel:start"
          : "codex debug prompt-input is missing flywheel:start; refresh the local cache and restart Codex",
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
    if (!plugin || plugin.id !== "flywheel@flywheel" || plugin.enabled === false) {
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
      : "no enabled flywheel@flywheel install found for this repo in claude plugin list",
  };
}

function checkFlywheelCallableInClaude() {
  const prompt = "/flywheel:start route this small bugfix into the right Flywheel stage";
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
  const ok = invoke.status === 0 && !/Unknown command:\s*\/flywheel:start/i.test(output);

  return {
    name: "Flywheel callable in Claude",
    ok,
    detail: ok
      ? "/flywheel:start executed through the installed Claude plugin"
      : output || String(invoke.stderr || "").trim() || "claude invocation failed",
  };
}

function checkClaudeFlywheelCommands() {
  const inspect = run(process.execPath, ["scripts/claude-slash-commands.js", "--plugin", "flywheel"], {
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
      ? `registered ${payload.pluginCommands.length} flywheel:* commands (${sample})`
      : payload.missingSkillCommands.length > 0
        ? `missing ${payload.missingSkillCommands.join(", ")}`
        : "flywheel plugin metadata did not include registered commands",
  };
}

function main() {
  const checks = [
    checkFile("Local config example", ".flywheel/config.local.example.yaml"),
    checkFile("Setup compatibility doc", "docs/setup/compatibility.md"),
    checkFile("Setup troubleshooting doc", "docs/setup/troubleshooting.md"),
  ];

  if (includeCodex) {
    checks.unshift(checkFile("Plugin manifest", ".codex-plugin/plugin.json"));
    checks.unshift(checkFile("Shared hook policy script", "hooks/flywheel-hook-policy.js"));
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
      checks.push(claudeCallable);
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
