const fs = require("fs");
const os = require("os");
const path = require("path");
const { runCommand } = require("./commands.cjs");
const { repoRoot } = require("./paths.cjs");
const { renderSubjectPrompt } = require("./prompt-rendering.cjs");

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function applyCodexOverrides(args, { model, configOverrides }) {
  const nextArgs = [...args];
  if (model) {
    nextArgs.splice(1, 0, "--model", model);
  }
  if (Array.isArray(configOverrides)) {
    for (const override of configOverrides) {
      nextArgs.splice(1, 0, override);
      nextArgs.splice(1, 0, "-c");
    }
  }
  return nextArgs;
}

async function runCodexSubject({ rawArguments, skill, model, configOverrides }) {
  const prompt = renderSubjectPrompt({ runner: "codex", skill, rawArguments });
  const tempDir = createTempDir("flywheel-codex-");
  const outputPath = path.join(tempDir, "last-message.txt");
  const baseArgs = [
    "exec",
    "--cd",
    repoRoot,
    "--sandbox",
    "read-only",
    "--ephemeral",
    "--color",
    "never",
    "-o",
    outputPath,
    "-",
  ];
  const args = applyCodexOverrides(baseArgs, { model, configOverrides });

  const result = await runCommand("codex", args, {
    cwd: repoRoot,
    stdin: prompt,
    timeoutMs: 10 * 60 * 1000,
  });

  let output = "";
  if (fs.existsSync(outputPath)) {
    output = fs.readFileSync(outputPath, "utf8").trim();
  }

  return {
    ok: result.ok && output.length > 0,
    runner: "codex",
    actualPrompt: prompt,
    output,
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
    error: result.ok ? null : result.error?.message || result.stderr || "codex exec failed",
  };
}

function parseClaudeJson(stdout) {
  const text = stdout.trim();
  if (!text) {
    return {};
  }
  return JSON.parse(text);
}

async function runClaudeSubject({ rawArguments, skill, model }) {
  const prompt = renderSubjectPrompt({ runner: "claude", skill, rawArguments });
  const args = [
    "-p",
    "--plugin-dir",
    repoRoot,
    "--no-session-persistence",
    "--output-format",
    "json",
    "--permission-mode",
    "plan",
    prompt,
  ];

  if (model) {
    args.splice(1, 0, "--model", model);
  }

  const result = await runCommand("claude", args, {
    cwd: repoRoot,
    timeoutMs: 10 * 60 * 1000,
  });

  let parsed = {};
  try {
    parsed = parseClaudeJson(result.stdout);
  } catch (error) {
    parsed = {};
  }

  const output =
    typeof parsed.result === "string"
      ? parsed.result.trim()
      : typeof parsed.output === "string"
        ? parsed.output.trim()
        : result.stdout.trim();

  const isApiError = parsed.is_error === true || /Not logged in/i.test(output);

  return {
    ok: result.ok && !isApiError && output.length > 0,
    runner: "claude",
    actualPrompt: prompt,
    output,
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
    error: result.ok && !isApiError ? null : output || result.stderr || "claude -p failed",
  };
}

async function runSubjectCli({ runner, rawArguments, skill, model, configOverrides }) {
  if (runner === "codex") {
    return runCodexSubject({ rawArguments, skill, model, configOverrides });
  }
  if (runner === "claude") {
    return runClaudeSubject({ rawArguments, skill, model });
  }
  throw new Error(`unsupported runner "${runner}"`);
}

module.exports = {
  runSubjectCli,
};
