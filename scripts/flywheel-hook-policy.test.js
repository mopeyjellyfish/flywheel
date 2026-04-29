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

function testPostToolAddsProjectValidationContext() {
  const dir = tempRepo();
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

testPreToolBlocksDestructiveBash();
testPreToolBlocksSensitiveWrite();
testPreToolIgnoresMissingWritePath();
testUserPromptAddsPlanToWorkContext();
testStopBlocksCompletionWithoutHandoff();
testPostToolAddsProjectValidationContext();
testPostToolIgnoresUnrelatedDirtySource();
testPostToolAddsPlanReviewContext();
testSessionStartAddsRepoContext();
testStopAllowsReadyForConfirmationStatus();

console.log("OK   flywheel-hook-policy");
