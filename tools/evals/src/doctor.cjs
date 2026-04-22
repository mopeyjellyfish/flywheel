const fs = require("fs");
const path = require("path");
const toml = require("@iarna/toml");
const { listSuites } = require("./lib/suites.cjs");
const { repoRoot } = require("./lib/paths.cjs");
const { runCommand } = require("./lib/commands.cjs");

async function binaryVersion(command, args = ["--version"]) {
  const result = await runCommand(command, args, {
    cwd: repoRoot,
    timeoutMs: 10 * 1000,
  });
  return {
    ok: result.ok,
    text: result.ok ? (result.stdout || result.stderr).trim() : result.stderr.trim(),
  };
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

function readCodexConfig() {
  const configPath = path.join(process.env.HOME || "", ".codex", "config.toml");
  if (!fs.existsSync(configPath)) {
    return { ok: false, error: `missing ${configPath}` };
  }

  try {
    return {
      ok: true,
      value: toml.parse(fs.readFileSync(configPath, "utf8")),
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

function findFlywheelCodexPlugin(config) {
  const plugins = config.plugins || {};
  return Object.entries(plugins).find(([name, value]) => name.startsWith("flywheel@") && value.enabled !== false);
}

function getCodexFlywheelStatus() {
  const codexConfig = readCodexConfig();
  if (!codexConfig.ok) {
    return {
      ok: false,
      detail: codexConfig.error,
    };
  }

  const plugin = findFlywheelCodexPlugin(codexConfig.value);
  return {
    ok: Boolean(plugin),
    detail: plugin ? `found ${plugin[0]}` : "no enabled flywheel@... plugin entry found in ~/.codex/config.toml",
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

async function getClaudeFlywheelStatus() {
  const result = await runCommand("claude", ["plugin", "list", "--json"], {
    cwd: repoRoot,
    timeoutMs: 10 * 1000,
  });

  if (!result.ok) {
    return {
      ok: false,
      detail: result.stderr.trim() || "claude plugin list --json failed",
    };
  }

  const plugins = parseJson(result.stdout);
  if (!Array.isArray(plugins)) {
    return {
      ok: false,
      detail: "claude plugin list --json did not return valid JSON",
    };
  }

  const plugin = findFlywheelClaudePlugin(plugins);
  return {
    ok: Boolean(plugin),
    detail: plugin
      ? `found ${plugin.id} at ${plugin.scope} scope`
      : "no enabled flywheel@flywheel install found for this repo in claude plugin list",
  };
}

async function validateClaudePlugin() {
  const result = await runCommand("claude", ["plugin", "validate", "."], {
    cwd: repoRoot,
    timeoutMs: 10 * 1000,
  });
  return {
    ok: result.ok,
    detail: result.ok
      ? "claude plugin validate . passed"
      : result.stderr.trim() || result.stdout.trim() || "claude plugin validate . failed",
  };
}

async function getClaudeFlywheelCommands() {
  const result = await runCommand(process.execPath, ["scripts/claude-slash-commands.js", "--plugin", "flywheel"], {
    cwd: repoRoot,
    timeoutMs: 60 * 1000,
  });

  if (!result.ok) {
    return {
      ok: false,
      detail: result.stderr.trim() || result.stdout.trim() || "claude command inspection failed",
    };
  }

  const payload = parseJson(result.stdout);
  if (!payload || !Array.isArray(payload.pluginCommands) || !Array.isArray(payload.missingSkillCommands)) {
    return {
      ok: false,
      detail: "claude command inspection did not return valid JSON",
    };
  }

  const ok = Boolean(payload.plugin) && payload.missingSkillCommands.length === 0;
  const sample = payload.pluginCommands.slice(0, 3).join(", ");
  return {
    ok,
    detail: ok
      ? `registered ${payload.pluginCommands.length} flywheel:* commands (${sample})`
      : payload.missingSkillCommands.length > 0
        ? `missing ${payload.missingSkillCommands.join(", ")}`
        : "flywheel plugin metadata did not include registered commands",
  };
}

async function smokeClaudeFlywheelInvocation() {
  const result = await runCommand(
    "claude",
    [
      "-p",
      "--no-session-persistence",
      "--output-format",
      "json",
      "--permission-mode",
      "plan",
      "/flywheel:start route this small bugfix into the right Flywheel stage",
    ],
    {
      cwd: repoRoot,
      timeoutMs: 2 * 60 * 1000,
    },
  );

  const payload = parseJson(result.stdout);
  const output =
    typeof payload?.result === "string"
      ? payload.result.trim()
      : result.stdout.trim();

  const ok = result.ok && !/Unknown command:\s*\/flywheel:start/i.test(output);
  return {
    ok,
    detail: ok
      ? "/flywheel:start executed through the installed Claude plugin"
      : output || result.stderr.trim() || "claude invocation failed",
  };
}

async function runDoctor({ smoke = false, host = "all" } = {}) {
  const normalizedHost = ["all", "codex", "claude"].includes(host) ? host : "all";
  const includeCodex = normalizedHost === "all" || normalizedHost === "codex";
  const includeClaude = normalizedHost === "all" || normalizedHost === "claude";
  const requireClaudeInstall = normalizedHost === "claude";

  const codexVersion = includeCodex ? await binaryVersion("codex") : { ok: true, text: "skipped" };
  const claudeVersion = includeClaude ? await binaryVersion("claude") : { ok: true, text: "skipped" };
  const codexConfig = includeCodex ? readCodexConfig() : { ok: true, value: null };
  const claudePluginValidation = includeClaude && claudeVersion.ok
    ? await validateClaudePlugin()
    : { ok: !includeClaude, detail: includeClaude ? "claude not available" : "skipped" };
  const claudeFlywheelStatus = includeClaude && claudeVersion.ok
    ? await getClaudeFlywheelStatus()
    : { ok: !includeClaude, detail: includeClaude ? "claude not available" : "skipped" };
  const claudeFlywheelCommands = includeClaude && claudeVersion.ok
    ? await getClaudeFlywheelCommands()
    : { ok: !includeClaude, detail: includeClaude ? "claude not available" : "skipped" };

  const checks = [
    {
      name: "Suites discovered",
      ok: listSuites().length > 0,
      detail: `${listSuites().join(", ")}`,
    },
  ];

  if (includeCodex) {
    checks.push({
      name: "codex binary",
      ok: codexVersion.ok,
      detail: codexVersion.text || "codex not available",
    });
  }

  if (includeClaude) {
    const claudeInstalled = claudeFlywheelStatus;
    checks.push({
      name: "claude binary",
      ok: claudeVersion.ok,
      detail: claudeVersion.text || "claude not available",
    });
    checks.push({
      name: "Claude plugin manifest",
      ok: claudePluginValidation.ok,
      detail: claudePluginValidation.detail,
    });
    checks.push({
      name: "Flywheel enabled in Claude",
      ok: claudeInstalled.ok || !requireClaudeInstall,
      detail: claudeInstalled.ok
        ? claudeInstalled.detail
        : requireClaudeInstall
          ? claudeInstalled.detail
          : `${claudeInstalled.detail}; skipped in broad verification because this checkout is not currently installed in Claude. Run \`make dev/claude\` and rerun \`node scripts/flywheel-doctor.js --host claude --smoke\` to require the installed Claude path.`,
    });
    checks.push({
      name: "Flywheel commands registered in Claude",
      ok: claudeFlywheelCommands.ok || !requireClaudeInstall && !claudeInstalled.ok,
      detail: claudeFlywheelCommands.ok
        ? claudeFlywheelCommands.detail
        : !requireClaudeInstall && !claudeInstalled.ok
          ? `${claudeFlywheelCommands.detail}; skipped in broad verification because this checkout is not currently installed in Claude. Run \`make dev/claude\` and rerun \`node scripts/flywheel-doctor.js --host claude --smoke\` to require the installed Claude path.`
          : claudeFlywheelCommands.detail,
    });
  }

  if (includeCodex) {
    checks.push({
      name: "codex config",
      ok: codexConfig.ok,
      detail: codexConfig.ok ? "read ~/.codex/config.toml" : codexConfig.error,
    });
  }

  if (includeCodex && codexConfig.ok) {
    const plugin = findFlywheelCodexPlugin(codexConfig.value);
    checks.push({
      name: "Flywheel enabled in Codex",
      ok: Boolean(plugin),
      detail: plugin ? `found ${plugin[0]}` : "no enabled flywheel@... plugin entry found in ~/.codex/config.toml",
    });
  }

  if (smoke && includeClaude) {
    const claudeHelp = await runCommand("claude", ["-p", "--help"], {
      cwd: repoRoot,
      timeoutMs: 10 * 1000,
    });
    checks.push({
      name: "Claude plugin-dir support",
      ok: claudeHelp.ok && /--plugin-dir/.test(claudeHelp.stdout),
      detail: claudeHelp.ok ? "help output includes --plugin-dir" : claudeHelp.stderr.trim(),
    });

    const claudeSmoke = claudeFlywheelStatus.ok
      ? await smokeClaudeFlywheelInvocation()
      : {
          ok: !requireClaudeInstall,
          detail: requireClaudeInstall
            ? "skipped because this checkout is not currently installed in Claude"
            : "skipped in broad verification because this checkout is not currently installed in Claude",
        };
    checks.push({
      name: "Flywheel callable in Claude",
      ok: claudeSmoke.ok,
      detail: claudeSmoke.detail,
    });
  }

  const ok = checks.every((check) => check.ok);
  return { ok, checks };
}

module.exports = {
  getClaudeFlywheelStatus,
  getCodexFlywheelStatus,
  runDoctor,
};
