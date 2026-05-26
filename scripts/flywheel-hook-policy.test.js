#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const hookScript = path.join(repoRoot, "hooks", "flywheel-hook-policy.js");

function runHook({ event, host = "codex", payload, cwd }) {
  const result = spawnSync(process.execPath, [hookScript, event, host], {
    cwd,
    input: JSON.stringify(payload),
    encoding: "utf8",
  });
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim() ? JSON.parse(result.stdout) : null;
}

function tempRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "flywheel-hook-policy-"));
  execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["checkout", "-b", "main"], { cwd: dir, stdio: "ignore" });
  fs.writeFileSync(path.join(dir, "README.md"), "test\n");
  execFileSync("git", ["add", "README.md"], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["commit", "-m", "initial"], {
    cwd: dir,
    stdio: "ignore",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Flywheel Test",
      GIT_AUTHOR_EMAIL: "test@example.com",
      GIT_COMMITTER_NAME: "Flywheel Test",
      GIT_COMMITTER_EMAIL: "test@example.com",
    },
  });
  return dir;
}

function setOriginHead(dir, branch = "main") {
  execFileSync("git", ["update-ref", `refs/remotes/origin/${branch}`, "HEAD"], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["symbolic-ref", "refs/remotes/origin/HEAD", `refs/remotes/origin/${branch}`], {
    cwd: dir,
    stdio: "ignore",
  });
}

function writeFlywheelConfig(dir, text) {
  const configDir = path.join(dir, ".flywheel");
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(path.join(configDir, "config.local.yaml"), text);
}

function testPreToolBlocksDestructiveBash() {
  const dir = tempRepo();
  const output = runHook({
    event: "pre-tool",
    host: "codex",
    cwd: dir,
    payload: {
      cwd: dir,
      tool_name: "Bash",
      tool_input: { command: "git reset --hard HEAD~1" },
    },
  });
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /reset --hard/);
  assert.strictEqual(output.hookSpecificOutput.permissionDecision, "deny");
}

function testPreToolBlocksSensitiveWrite() {
  const dir = tempRepo();
  const output = runHook({
    event: "pre-tool",
    host: "claude",
    cwd: dir,
    payload: {
      cwd: dir,
      tool_name: "Write",
      tool_input: { file_path: path.join(dir, ".env.local"), content: "SECRET=value\n" },
    },
  });
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /sensitive-looking path/);
  assert.strictEqual(output.hookSpecificOutput.permissionDecision, "deny");
}

function testPermissionRequestBlocksDestructiveBash() {
  const dir = tempRepo();
  const output = runHook({
    event: "permission-request",
    host: "codex",
    cwd: dir,
    payload: {
      cwd: dir,
      tool_name: "Bash",
      tool_input: { command: "git reset --hard HEAD~1" },
    },
  });
  assert.strictEqual(output.hookSpecificOutput.hookEventName, "PermissionRequest");
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /reset --hard/);
  assert.strictEqual(output.hookSpecificOutput.permissionDecision, "deny");
}

function testPreToolAllowsExplicitFeatureBranchForceWithLeaseFromMain() {
  const dir = tempRepo();
  setOriginHead(dir);
  const output = runHook({
    event: "pre-tool",
    host: "codex",
    cwd: dir,
    payload: {
      cwd: dir,
      tool_name: "Bash",
      tool_input: {
        command:
          "git push origin HEAD:refs/heads/trading-game --force-with-lease=refs/heads/trading-game:abc123",
      },
    },
  });
  assert.strictEqual(output, null);
}

function testPreToolAllowsNamedFeatureBranchForceWithLease() {
  const dir = tempRepo();
  setOriginHead(dir);
  execFileSync("git", ["checkout", "-b", "trading-game"], { cwd: dir, stdio: "ignore" });
  const output = runHook({
    event: "pre-tool",
    host: "codex",
    cwd: dir,
    payload: {
      cwd: dir,
      tool_name: "Bash",
      tool_input: { command: "git push --force-with-lease origin trading-game" },
    },
  });
  assert.strictEqual(output, null);
}

function testPreToolBlocksDefaultBranchForceWithLease() {
  const dir = tempRepo();
  setOriginHead(dir);
  const output = runHook({
    event: "pre-tool",
    host: "codex",
    cwd: dir,
    payload: {
      cwd: dir,
      tool_name: "Bash",
      tool_input: { command: "git push --force-with-lease origin main" },
    },
  });
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /default branch `main`/);
  assert.strictEqual(output.hookSpecificOutput.permissionDecision, "deny");
}

function testPreToolBlocksHeadToDefaultBranchForceWithLease() {
  const dir = tempRepo();
  setOriginHead(dir);
  execFileSync("git", ["checkout", "-b", "feature"], { cwd: dir, stdio: "ignore" });
  const output = runHook({
    event: "pre-tool",
    host: "codex",
    cwd: dir,
    payload: {
      cwd: dir,
      tool_name: "Bash",
      tool_input: { command: "git push origin HEAD:main --force-with-lease=refs/heads/main:abc123" },
    },
  });
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /default branch `main`/);
  assert.strictEqual(output.hookSpecificOutput.permissionDecision, "deny");
}

function testPreToolBlocksImplicitDefaultBranchForceWithLease() {
  const dir = tempRepo();
  setOriginHead(dir);
  const output = runHook({
    event: "pre-tool",
    host: "codex",
    cwd: dir,
    payload: {
      cwd: dir,
      tool_name: "Bash",
      tool_input: { command: "git push --force-with-lease" },
    },
  });
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /default branch `main`/);
  assert.strictEqual(output.hookSpecificOutput.permissionDecision, "deny");
}

function testPreToolIgnoresMissingWritePath() {
  const dir = tempRepo();
  const output = runHook({
    event: "pre-tool",
    host: "codex",
    cwd: dir,
    payload: {
      cwd: dir,
      tool_name: "Write",
      tool_input: { content: "no path present\n" },
    },
  });
  assert.strictEqual(output, null);
}

function testUserPromptAddsPlanToWorkContext() {
  const dir = tempRepo();
  writeFlywheelConfig(dir, [
    "hooks:",
    "  lifecycle:",
    "    prompt_routing: true",
    "",
  ].join("\n"));
  const output = runHook({
    event: "user-prompt",
    host: "codex",
    cwd: dir,
    payload: {
      cwd: dir,
      prompt: "Use $fw:work on docs/plans/2026-04-29-feature-plan.md",
    },
  });
  assert.match(output.hookSpecificOutput.additionalContext, /plan or spec/);
  assert.match(output.hookSpecificOutput.additionalContext, /host question tool/);
}

function testStopBlocksCompletionWithoutHandoff() {
  const dir = tempRepo();
  writeFlywheelConfig(dir, [
    "hooks:",
    "  lifecycle:",
    "    stop_completion_checkpoint: true",
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(dir, "changed.txt"), "dirty\n");
  const output = runHook({
    event: "stop",
    host: "codex",
    cwd: dir,
    payload: {
      cwd: dir,
      stop_hook_active: false,
      last_assistant_message: "Done, implementation is complete.",
    },
  });
  assert.strictEqual(output.decision, "block");
  assert.match(output.reason, /Flywheel stop checkpoint/);
}

function testStopIgnoresCompletionWithoutOptIn() {
  const dir = tempRepo();
  fs.writeFileSync(path.join(dir, "changed.txt"), "dirty\n");
  const output = runHook({
    event: "stop",
    host: "codex",
    cwd: dir,
    payload: {
      cwd: dir,
      stop_hook_active: false,
      last_assistant_message: "Done, implementation is complete.",
    },
  });
  assert.strictEqual(output, null);
}

function testPostToolAddsProjectValidationContext() {
  const dir = tempRepo();
  writeFlywheelConfig(dir, [
    "hooks:",
    "  lifecycle:",
    "    post_tool_validation: true",
    "",
  ].join("\n"));
  fs.mkdirSync(path.join(dir, "src"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src", "app.js"), "console.log('changed');\n");
  const output = runHook({
    event: "post-tool",
    host: "claude",
    cwd: dir,
    payload: {
      cwd: dir,
      tool_name: "Edit",
      tool_input: { file_path: path.join(dir, "src", "app.js") },
      tool_response: { ok: true },
    },
  });
  assert.match(output.hookSpecificOutput.additionalContext, /This edit touched project source/);
  assert.match(output.hookSpecificOutput.additionalContext, /project-relevant targeted checks/);
  assert.doesNotMatch(output.hookSpecificOutput.additionalContext, /Flywheel workflow/);
  assert.doesNotMatch(output.hookSpecificOutput.additionalContext, /make verify/);
}

function testPostToolIgnoresUnrelatedDirtySource() {
  const dir = tempRepo();
  writeFlywheelConfig(dir, [
    "hooks:",
    "  lifecycle:",
    "    post_tool_validation: true",
    "",
  ].join("\n"));
  fs.mkdirSync(path.join(dir, "src"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src", "app.js"), "console.log('dirty');\n");
  const output = runHook({
    event: "post-tool",
    host: "claude",
    cwd: dir,
    payload: {
      cwd: dir,
      tool_name: "Edit",
      tool_input: { file_path: path.join(dir, "README.md") },
      tool_response: { ok: true },
    },
  });
  assert.strictEqual(output, null);
}

function testPostToolAddsPlanReviewContext() {
  const dir = tempRepo();
  writeFlywheelConfig(dir, [
    "hooks:",
    "  lifecycle:",
    "    post_tool_validation: true",
    "",
  ].join("\n"));
  fs.mkdirSync(path.join(dir, "docs", "plans"), { recursive: true });
  fs.writeFileSync(path.join(dir, "docs", "plans", "feature-plan.md"), "# Plan\n");
  const output = runHook({
    event: "post-tool",
    host: "claude",
    cwd: dir,
    payload: {
      cwd: dir,
      tool_name: "Edit",
      tool_input: { file_path: path.join(dir, "docs", "plans", "feature-plan.md") },
      tool_response: { ok: true },
    },
  });
  assert.match(output.hookSpecificOutput.additionalContext, /project plan\/spec artifact/);
  assert.match(output.hookSpecificOutput.additionalContext, /fw:document-review/);
}

function testSessionStartAddsRepoContext() {
  const dir = tempRepo();
  writeFlywheelConfig(dir, [
    "hooks:",
    "  lifecycle:",
    "    session_context: true",
    "",
  ].join("\n"));
  const output = runHook({
    event: "session-start",
    host: "codex",
    cwd: dir,
    payload: {
      cwd: dir,
      source: "startup",
    },
  });
  assert.match(output.hookSpecificOutput.additionalContext, /Flywheel session context/);
  assert.match(output.hookSpecificOutput.additionalContext, /plan or spec/);
}

function testStopAllowsReadyForConfirmationStatus() {
  const dir = tempRepo();
  writeFlywheelConfig(dir, [
    "hooks:",
    "  lifecycle:",
    "    stop_completion_checkpoint: true",
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(dir, "changed.txt"), "dirty\n");
  const output = runHook({
    event: "stop",
    host: "codex",
    cwd: dir,
    payload: {
      cwd: dir,
      stop_hook_active: false,
      last_assistant_message: "Ready for your confirmation before I continue.",
    },
  });
  assert.strictEqual(output, null);
}

function testClaudeDefaultHookPackOnlyInstallsRequiredGuardrails() {
  const hooksPath = path.join(repoRoot, "hooks", "hooks.json");
  const payload = JSON.parse(fs.readFileSync(hooksPath, "utf8"));
  assert.deepStrictEqual(Object.keys(payload.hooks).sort(), ["PreToolUse", "Stop"]);
}

function hookCommandsFor(payload, eventName) {
  return (payload.hooks[eventName] || [])
    .flatMap((group) => group.hooks || [])
    .map((hook) => hook.command || "");
}

function testCodexManifestUsesDedicatedHookPack() {
  const manifestPath = path.join(repoRoot, ".codex-plugin", "plugin.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert.strictEqual(manifest.hooks, "./hooks/codex-hooks.json");
}

function testCodexDefaultHookPackOnlyInstallsSafetyGuardrails() {
  const hooksPath = path.join(repoRoot, "hooks", "codex-hooks.json");
  const payload = JSON.parse(fs.readFileSync(hooksPath, "utf8"));
  assert.deepStrictEqual(Object.keys(payload.hooks).sort(), ["PermissionRequest", "PreToolUse"]);

  for (const eventName of ["PreToolUse", "PermissionRequest"]) {
    assert.deepStrictEqual(
      payload.hooks[eventName].map((group) => group.matcher),
      ["Bash|apply_patch|Edit|Write"],
    );
    assert(hookCommandsFor(payload, eventName).every((command) => command.includes("${PLUGIN_ROOT}")));
    assert(hookCommandsFor(payload, eventName).every((command) => command.includes("flywheel-hook-policy.js")));
    assert(hookCommandsFor(payload, eventName).every((command) => command.includes(" codex")));
  }

  const serialized = JSON.stringify(payload);
  assert.doesNotMatch(serialized, /mcp__/);
  assert.doesNotMatch(serialized, /SessionStart|UserPromptSubmit|PostToolUse|Stop/);
}

function testCodexRefreshUsesPluginHooksAndPreservesUserHooks() {
  const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "flywheel-codex-refresh-"));
  const codexHome = path.join(tempHome, "codex");
  const agentsHome = path.join(tempHome, "agents");
  fs.mkdirSync(codexHome, { recursive: true });
  fs.mkdirSync(agentsHome, { recursive: true });

  const configPath = path.join(codexHome, "config.toml");
  fs.writeFileSync(configPath, [
    "[features]",
    "tool_search = true",
    "",
    "[plugins.\"fw@fw-local\"]",
    "enabled = true",
    "",
  ].join("\n"));

  const hooksPath = path.join(codexHome, "hooks.json");
  const hooksBefore = {
    hooks: {
      PreToolUse: [
        {
          matcher: "Bash",
          hooks: [
            {
              type: "command",
              command: "node /tmp/unrelated-hook.js",
              statusMessage: "Unrelated hook",
            },
          ],
        },
        {
          matcher: "Bash|apply_patch|Edit|Write",
          hooks: [
            {
              type: "command",
              command: "node /tmp/flywheel-hook-policy.js pre-tool codex",
              statusMessage: "Old Flywheel hook",
            },
          ],
        },
      ],
      Stop: [
        {
          hooks: [
            {
              type: "command",
              command: "node /tmp/flywheel-hook-policy.js stop codex",
              statusMessage: "Old Flywheel stop",
            },
          ],
        },
      ],
    },
  };
  const hooksAfter = {
    hooks: {
      PreToolUse: [
        {
          matcher: "Bash",
          hooks: [
            {
              type: "command",
              command: "node /tmp/unrelated-hook.js",
              statusMessage: "Unrelated hook",
            },
          ],
        },
      ],
    },
  };
  fs.writeFileSync(hooksPath, `${JSON.stringify(hooksBefore, null, 2)}\n`);

  const result = spawnSync("bash", [path.join(repoRoot, "scripts", "codex-refresh-local.sh")], {
    cwd: repoRoot,
    env: {
      ...process.env,
      CODEX_HOME: codexHome,
      AGENTS_HOME: agentsHome,
      HOME: tempHome,
    },
    encoding: "utf8",
  });
  assert.strictEqual(result.status, 0, result.stderr || result.stdout);

  const configText = fs.readFileSync(configPath, "utf8");
  assert.match(configText, /^\s*hooks\s*=\s*true\s*$/m);
  assert.match(configText, /^\s*plugin_hooks\s*=\s*true\s*$/m);
  assert.doesNotMatch(configText, /codex_hooks/);
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(hooksPath, "utf8")), hooksAfter);
}

function testDoctorPrefersCodexPluginHookPosture() {
  const doctorPath = path.join(repoRoot, "scripts", "flywheel-doctor.js");
  const doctor = fs.readFileSync(doctorPath, "utf8");
  assert.match(doctor, /Codex plugin hook pack shape/);
  assert.match(doctor, /No user-level Flywheel Codex hooks/);
  assert.match(doctor, /plugin_hooks/);
  assert.doesNotMatch(doctor, /codex_hooks/);
  assert.doesNotMatch(doctor, /checks\.push\(checkCodexHooksInstalled\(\)\)/);
}

testPreToolBlocksDestructiveBash();
testPreToolBlocksSensitiveWrite();
testPermissionRequestBlocksDestructiveBash();
testPreToolAllowsExplicitFeatureBranchForceWithLeaseFromMain();
testPreToolAllowsNamedFeatureBranchForceWithLease();
testPreToolBlocksDefaultBranchForceWithLease();
testPreToolBlocksHeadToDefaultBranchForceWithLease();
testPreToolBlocksImplicitDefaultBranchForceWithLease();
testPreToolIgnoresMissingWritePath();
testUserPromptAddsPlanToWorkContext();
testStopBlocksCompletionWithoutHandoff();
testStopIgnoresCompletionWithoutOptIn();
testPostToolAddsProjectValidationContext();
testPostToolIgnoresUnrelatedDirtySource();
testPostToolAddsPlanReviewContext();
testSessionStartAddsRepoContext();
testStopAllowsReadyForConfirmationStatus();
testClaudeDefaultHookPackOnlyInstallsRequiredGuardrails();
testCodexManifestUsesDedicatedHookPack();
testCodexDefaultHookPackOnlyInstallsSafetyGuardrails();
testCodexRefreshUsesPluginHooksAndPreservesUserHooks();
testDoctorPrefersCodexPluginHookPosture();

console.log("OK   flywheel-hook-policy");
