#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const pluginName = process.argv.includes("--plugin")
  ? process.argv[process.argv.indexOf("--plugin") + 1]
  : "flywheel";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function loadClaudeSdk() {
  const packagePath = path.join(repoRoot, "tools", "evals", "node_modules", "@anthropic-ai", "claude-agent-sdk");
  if (!fs.existsSync(packagePath)) {
    fail("Missing tools/evals dependency `@anthropic-ai/claude-agent-sdk`. Run `npm --prefix tools/evals install`.");
  }

  return require(packagePath);
}

function expectedPluginCommands() {
  const skillsDir = path.join(repoRoot, "skills");
  if (!fs.existsSync(skillsDir)) {
    return [];
  }

  return fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${pluginName}:${entry.name}`)
    .sort();
}

async function inspectCommands() {
  const { query } = loadClaudeSdk();
  const expectedCommands = expectedPluginCommands();

  for await (const message of query({
    prompt: "hello",
    options: {
      cwd: repoRoot,
      maxTurns: 1,
      permissionMode: "plan",
    },
  })) {
    if (message.type !== "system" || message.subtype !== "init") {
      continue;
    }

    const plugins = Array.isArray(message.plugins) ? message.plugins : [];
    const slashCommands = Array.isArray(message.slash_commands) ? message.slash_commands.slice().sort() : [];
    const plugin = plugins.find((item) => item && item.name === pluginName) || null;
    const pluginCommands = slashCommands.filter((command) => command.startsWith(`${pluginName}:`));
    const pluginCommandSet = new Set(pluginCommands);
    const missingSkillCommands = expectedCommands.filter((command) => !pluginCommandSet.has(command));
    const unexpectedPluginCommands = pluginCommands.filter((command) => !expectedCommands.includes(command));

    process.stdout.write(JSON.stringify({
      pluginName,
      plugin,
      slashCommands,
      pluginCommands,
      expectedCommands,
      missingSkillCommands,
      unexpectedPluginCommands,
    }));
    return;
  }

  fail("Claude did not emit plugin init metadata.");
}

inspectCommands().catch((error) => {
  fail(error && error.stack ? error.stack : String(error));
});
