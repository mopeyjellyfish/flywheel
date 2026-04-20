#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const smoke = process.argv.includes("--smoke");

function run(command, args) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function checkFile(name, relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  return {
    name,
    ok: fs.existsSync(fullPath),
    detail: fs.existsSync(fullPath) ? relativePath : `missing ${relativePath}`,
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

function main() {
  const checks = [
    checkFile("Plugin manifest", ".codex-plugin/plugin.json"),
    checkFile("Local config example", ".flywheel/config.local.example.yaml"),
    checkFile("Setup compatibility doc", "docs/setup/compatibility.md"),
    checkFile("Setup troubleshooting doc", "docs/setup/troubleshooting.md"),
  ];

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
      args.push("--", "--smoke");
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

  checks.push(checkFlywheelVisibleToCodex());

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
