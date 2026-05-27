#!/usr/bin/env node

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { runPluginChecks } = require("./plugin-ci-check.js");

const repoRoot = path.resolve(__dirname, "..");

function tempFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "flywheel-plugin-ci-"));
  fs.cpSync(repoRoot, dir, {
    recursive: true,
    filter: (source) => {
      const relative = path.relative(repoRoot, source);
      return relative !== ".git" &&
        !relative.startsWith(".git/") &&
        !relative.startsWith(".worktrees") &&
        !relative.startsWith("tools/evals/node_modules");
    },
  });
  return dir;
}

function readJson(root, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(root, relativePath, payload) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(payload, null, 2)}\n`);
}

function failuresFor(root) {
  return runPluginChecks({ root }).filter((check) => !check.ok);
}

function testCurrentRepoPasses() {
  const failures = failuresFor(repoRoot);
  assert.deepStrictEqual(failures, []);
}

function testVersionMismatchReportsEveryDifferingSurface() {
  const root = tempFixture();
  const currentVersion = readJson(root, ".claude-plugin/plugin.json").version;
  const manifest = readJson(root, ".codex-plugin/plugin.json");
  manifest.version = "9.9.9";
  writeJson(root, ".codex-plugin/plugin.json", manifest);

  const failures = failuresFor(root);
  const versionFailure = failures.find((failure) => failure.name === "plugin.version.sync");
  assert(versionFailure, failures.map((failure) => failure.name).join(", "));
  assert.strictEqual(versionFailure.file, ".codex-plugin/plugin.json");
  assert.strictEqual(versionFailure.field, "version");
  assert.match(versionFailure.expected, /single SemVer shared by all plugin version fields/);
  assert.match(versionFailure.actual, /\.codex-plugin\/plugin\.json=9\.9\.9/);
  assert.match(versionFailure.actual, new RegExp(`\\.claude-plugin/plugin\\.json=${currentVersion.replace(/\./g, "\\.")}`));
}

function testMissingRequiredFieldReportsFileAndField() {
  const root = tempFixture();
  const manifest = readJson(root, ".codex-plugin/plugin.json");
  delete manifest.hooks;
  writeJson(root, ".codex-plugin/plugin.json", manifest);

  const failures = failuresFor(root);
  const fieldFailure = failures.find((failure) => failure.name === "codex.manifest.required.hooks");
  assert(fieldFailure, failures.map((failure) => failure.name).join(", "));
  assert.strictEqual(fieldFailure.file, ".codex-plugin/plugin.json");
  assert.strictEqual(fieldFailure.field, "hooks");
  assert.strictEqual(fieldFailure.expected, "present");
  assert.strictEqual(fieldFailure.actual, "missing");
}

function testPackageCopyMismatchReportsPath() {
  const root = tempFixture();
  fs.writeFileSync(path.join(root, "plugins", "fw", "skills", "start", "SKILL.md"), "drifted\n");

  const failures = failuresFor(root);
  const packageFailure = failures.find((failure) => failure.name === "codex.package.skills");
  assert(packageFailure, failures.map((failure) => failure.name).join(", "));
  assert.strictEqual(packageFailure.file, "plugins/fw/skills");
  assert.match(packageFailure.actual, /start\/SKILL\.md/);
}

function testStalePackageFails() {
  const root = tempFixture();
  fs.mkdirSync(path.join(root, "plugins", "flywheel"), { recursive: true });

  const failures = failuresFor(root);
  const staleFailure = failures.find((failure) => failure.name === "codex.package.stale");
  assert(staleFailure, failures.map((failure) => failure.name).join(", "));
  assert.strictEqual(staleFailure.file, "plugins/flywheel");
  assert.strictEqual(staleFailure.expected, "absent");
  assert.strictEqual(staleFailure.actual, "present");
}

function testCodexMarketplaceMissingFwEntryReportsManifest() {
  const root = tempFixture();
  const marketplace = readJson(root, ".agents/plugins/marketplace.json");
  marketplace.plugins = [];
  writeJson(root, ".agents/plugins/marketplace.json", marketplace);

  const failures = failuresFor(root);
  const marketplaceFailure = failures.find((failure) => failure.name === "codex.marketplace.entry");
  assert(marketplaceFailure, failures.map((failure) => failure.name).join(", "));
  assert.strictEqual(marketplaceFailure.file, ".agents/plugins/marketplace.json");
  assert.strictEqual(marketplaceFailure.field, "plugins[name=fw]");
  assert.strictEqual(marketplaceFailure.expected, "one entry");
  assert.strictEqual(marketplaceFailure.actual, "0 entries");
}

function testReleasePleaseManifestVersionMismatchReportsManifest() {
  const root = tempFixture();
  const currentVersion = readJson(root, ".claude-plugin/plugin.json").version;
  writeJson(root, ".github/.release-please-manifest.json", { ".": "9.9.9" });

  const failures = failuresFor(root);
  const releaseFailure = failures.find((failure) => failure.name === "release-please.manifest.version");
  assert(releaseFailure, failures.map((failure) => failure.name).join(", "));
  assert.strictEqual(releaseFailure.file, ".github/.release-please-manifest.json");
  assert.strictEqual(releaseFailure.field, ".");
  assert.strictEqual(releaseFailure.expected, `current plugin version ${currentVersion}`);
  assert.strictEqual(releaseFailure.actual, "9.9.9");
}

function testReleasePleaseTagSeparatorReportsConfig() {
  const root = tempFixture();
  const config = readJson(root, ".github/release-please-config.json");
  config["tag-separator"] = "-";
  writeJson(root, ".github/release-please-config.json", config);

  const failures = failuresFor(root);
  const releaseFailure = failures.find((failure) => failure.name === "release-please.tag-separator");
  assert(releaseFailure, failures.map((failure) => failure.name).join(", "));
  assert.strictEqual(releaseFailure.file, ".github/release-please-config.json");
  assert.strictEqual(releaseFailure.field, "tag-separator");
  assert.strictEqual(releaseFailure.expected, "--");
  assert.strictEqual(releaseFailure.actual, "-");
}

function testReleasePleaseMissingExtraFileReportsPathAndJsonPath() {
  const root = tempFixture();
  const config = readJson(root, ".github/release-please-config.json");
  config.packages["."]["extra-files"] = config.packages["."]["extra-files"].filter(
    (entry) => entry.path !== ".claude-plugin/plugin.json",
  );
  writeJson(root, ".github/release-please-config.json", config);

  const failures = failuresFor(root);
  const releaseFailure = failures.find((failure) => failure.name === "release-please.extra-file");
  assert(releaseFailure, failures.map((failure) => failure.name).join(", "));
  assert.strictEqual(releaseFailure.file, ".github/release-please-config.json");
  assert.strictEqual(releaseFailure.field, "packages[.].extra-files[path=.claude-plugin/plugin.json]");
  assert.strictEqual(releaseFailure.expected, "json updater for $.version");
  assert.strictEqual(releaseFailure.actual, "missing");
}

testCurrentRepoPasses();
testVersionMismatchReportsEveryDifferingSurface();
testMissingRequiredFieldReportsFileAndField();
testPackageCopyMismatchReportsPath();
testStalePackageFails();
testCodexMarketplaceMissingFwEntryReportsManifest();
testReleasePleaseManifestVersionMismatchReportsManifest();
testReleasePleaseTagSeparatorReportsConfig();
testReleasePleaseMissingExtraFileReportsPathAndJsonPath();
