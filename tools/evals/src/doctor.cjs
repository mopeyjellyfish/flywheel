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

async function runDoctor({ smoke = false } = {}) {
  const codexVersion = await binaryVersion("codex");
  const claudeVersion = await binaryVersion("claude");
  const codexConfig = readCodexConfig();

  const checks = [
    {
      name: "Suites discovered",
      ok: listSuites().length > 0,
      detail: `${listSuites().join(", ")}`,
    },
    {
      name: "codex binary",
      ok: codexVersion.ok,
      detail: codexVersion.text || "codex not available",
    },
    {
      name: "claude binary",
      ok: claudeVersion.ok,
      detail: claudeVersion.text || "claude not available",
    },
    {
      name: "codex config",
      ok: codexConfig.ok,
      detail: codexConfig.ok ? "read ~/.codex/config.toml" : codexConfig.error,
    },
  ];

  if (codexConfig.ok) {
    const plugin = findFlywheelCodexPlugin(codexConfig.value);
    checks.push({
      name: "Flywheel enabled in Codex",
      ok: Boolean(plugin),
      detail: plugin ? `found ${plugin[0]}` : "no enabled flywheel@... plugin entry found in ~/.codex/config.toml",
    });
  }

  if (smoke) {
    const claudeHelp = await runCommand("claude", ["-p", "--help"], {
      cwd: repoRoot,
      timeoutMs: 10 * 1000,
    });
    checks.push({
      name: "Claude plugin-dir support",
      ok: claudeHelp.ok && /--plugin-dir/.test(claudeHelp.stdout),
      detail: claudeHelp.ok ? "help output includes --plugin-dir" : claudeHelp.stderr.trim(),
    });
  }

  const ok = checks.every((check) => check.ok);
  return { ok, checks };
}

module.exports = {
  getCodexFlywheelStatus,
  runDoctor,
};
