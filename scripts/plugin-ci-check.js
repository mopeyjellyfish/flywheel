#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const DEFAULT_ROOT = path.resolve(__dirname, "..");
const SEMVER_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const RELEASE_EXTRA_FILES = [
  { path: ".codex-plugin/plugin.json", jsonpath: "$.version" },
  { path: ".claude-plugin/plugin.json", jsonpath: "$.version" },
  { path: ".claude-plugin/marketplace.json", jsonpath: "$.plugins[0].version" },
  { path: "plugins/fw/.codex-plugin/plugin.json", jsonpath: "$.version" },
];

function rel(root, filePath) {
  const relative = path.relative(root, filePath).replace(/\\/g, "/");
  return relative && !relative.startsWith("..") ? relative : filePath;
}

function issue({ name, file, field = null, expected, actual, fix = null }) {
  return { ok: false, name, file, field, expected, actual, fix };
}

function ok(name, detail) {
  return { ok: true, name, detail };
}

function readJson(root, relativePath, checks) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    checks.push(issue({
      name: "json.exists",
      file: relativePath,
      expected: "file exists",
      actual: "missing",
    }));
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    checks.push(issue({
      name: "json.parse",
      file: relativePath,
      expected: "valid JSON",
      actual: error.message,
    }));
    return null;
  }
}

function requireFields(checks, object, file, fields, prefix) {
  if (!object) {
    return;
  }

  for (const field of fields) {
    if (!(field in object)) {
      checks.push(issue({
        name: `${prefix}.required.${field}`,
        file,
        field,
        expected: "present",
        actual: "missing",
      }));
    }
  }
}

function valueAtPath(object, fieldPath) {
  return fieldPath.split(".").reduce((current, key) => current?.[key], object);
}

function requireValue(checks, object, { name, file, field, expected, actual }) {
  if (!object) {
    return;
  }

  const value = actual === undefined ? valueAtPath(object, field) : actual;
  if (value !== expected) {
    checks.push(issue({
      name,
      file,
      field,
      expected: String(expected),
      actual: value === undefined ? "missing" : String(value),
    }));
  }
}

function pathExists(root, relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function requireReferencedPath(checks, root, { name, manifest, file, field }) {
  if (!manifest || typeof manifest[field] !== "string") {
    return;
  }

  const target = manifest[field].replace(/^\.\//, "");
  if (!pathExists(root, target)) {
    checks.push(issue({
      name,
      file,
      field,
      expected: `existing path ${manifest[field]}`,
      actual: "missing",
    }));
  }
}

function relativeRegularFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile()) {
        files.push(path.relative(root, fullPath).replace(/\\/g, "/"));
      }
    }
  }
  return files.sort();
}

function digest(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function directoryMismatch(root, leftRelative, rightRelative) {
  const leftRoot = path.join(root, leftRelative);
  const rightRoot = path.join(root, rightRelative);
  const leftFiles = relativeRegularFiles(leftRoot);
  const rightFiles = relativeRegularFiles(rightRoot);

  if (leftFiles.join("\n") !== rightFiles.join("\n")) {
    const leftSet = new Set(leftFiles);
    const rightSet = new Set(rightFiles);
    const missing = leftFiles.find((file) => !rightSet.has(file));
    const extra = rightFiles.find((file) => !leftSet.has(file));
    return missing ? `missing in ${rightRelative}: ${missing}` : `extra in ${rightRelative}: ${extra}`;
  }

  for (const file of leftFiles) {
    if (digest(path.join(leftRoot, file)) !== digest(path.join(rightRoot, file))) {
      return `file contents differ: ${file}`;
    }
  }

  return null;
}

function checkVersionSync(checks, surfaces) {
  const complete = surfaces.filter((surface) => surface.version !== undefined && surface.version !== null);
  for (const surface of complete) {
    if (typeof surface.version !== "string" || !SEMVER_RE.test(surface.version)) {
      checks.push(issue({
        name: "plugin.version.semver",
        file: surface.file,
        field: surface.field,
        expected: "SemVer",
        actual: surface.version === undefined ? "missing" : String(surface.version),
      }));
    }
  }

  const versions = new Set(complete.map((surface) => surface.version));
  if (versions.size > 1) {
    checks.push(issue({
      name: "plugin.version.sync",
      file: complete[0].file,
      field: "version",
      expected: "single SemVer shared by all plugin version fields",
      actual: complete.map((surface) => `${surface.file}=${surface.version}`).join(", "),
      fix: "let Release Please update all plugin manifests from a release PR",
    }));
  }
}

function checkHookPack(checks, root, { file, expectedEvents, name }) {
  const payload = readJson(root, file, checks);
  if (!payload) {
    return;
  }

  const events = Object.keys(payload.hooks || {}).sort();
  if (JSON.stringify(events) !== JSON.stringify(expectedEvents)) {
    checks.push(issue({
      name,
      file,
      field: "hooks",
      expected: expectedEvents.join(", "),
      actual: events.join(", ") || "none",
    }));
    return;
  }

  const serialized = JSON.stringify(payload);
  if (!/flywheel-hook-policy\.js/.test(serialized)) {
    checks.push(issue({
      name: `${name}.command`,
      file,
      field: "hooks",
      expected: "commands reference flywheel-hook-policy.js",
      actual: "missing flywheel-hook-policy.js",
    }));
  }
}

function requireReleaseConfigValue(checks, object, { field, expected, actual, name = `release-please.${field}` }) {
  requireValue(checks, object, {
    name,
    file: ".github/release-please-config.json",
    field,
    expected,
    actual,
  });
}

function checkReleasePlease(root, checks, expectedVersion) {
  const config = readJson(root, ".github/release-please-config.json", checks);
  const manifest = readJson(root, ".github/.release-please-manifest.json", checks);

  if (manifest && expectedVersion && manifest["."] !== expectedVersion) {
    checks.push(issue({
      name: "release-please.manifest.version",
      file: ".github/.release-please-manifest.json",
      field: ".",
      expected: `current plugin version ${expectedVersion}`,
      actual: manifest["."] === undefined ? "missing" : String(manifest["."]),
    }));
  }

  if (!config) {
    return;
  }

  requireReleaseConfigValue(checks, config, {
    field: "include-component-in-tag",
    expected: true,
  });
  requireReleaseConfigValue(checks, config, {
    field: "tag-separator",
    expected: "--",
  });

  const packageConfig = config.packages?.["."];
  if (!packageConfig) {
    checks.push(issue({
      name: "release-please.package",
      file: ".github/release-please-config.json",
      field: "packages[.]",
      expected: "root package config",
      actual: "missing",
    }));
    return;
  }

  requireReleaseConfigValue(checks, packageConfig, {
    field: "packages[.].release-type",
    expected: "simple",
    name: "release-please.release-type",
    actual: packageConfig["release-type"],
  });
  requireReleaseConfigValue(checks, packageConfig, {
    field: "packages[.].component",
    expected: "fw",
    name: "release-please.component",
    actual: packageConfig.component,
  });
  requireReleaseConfigValue(checks, packageConfig, {
    field: "packages[.].package-name",
    expected: "fw",
    name: "release-please.package-name",
    actual: packageConfig["package-name"],
  });

  const extraFiles = Array.isArray(packageConfig["extra-files"]) ? packageConfig["extra-files"] : [];
  for (const expected of RELEASE_EXTRA_FILES) {
    const entry = extraFiles.find((candidate) => candidate?.path === expected.path);
    if (!entry) {
      checks.push(issue({
        name: "release-please.extra-file",
        file: ".github/release-please-config.json",
        field: `packages[.].extra-files[path=${expected.path}]`,
        expected: `json updater for ${expected.jsonpath}`,
        actual: "missing",
      }));
      continue;
    }

    if (entry.type !== "json" || entry.jsonpath !== expected.jsonpath) {
      checks.push(issue({
        name: "release-please.extra-file",
        file: ".github/release-please-config.json",
        field: `packages[.].extra-files[path=${expected.path}]`,
        expected: `type=json jsonpath=${expected.jsonpath}`,
        actual: `type=${entry.type || "missing"} jsonpath=${entry.jsonpath || "missing"}`,
      }));
    }
  }
}

function checkCodex(root, checks) {
  const rootManifest = readJson(root, ".codex-plugin/plugin.json", checks);
  const packageManifest = readJson(root, "plugins/fw/.codex-plugin/plugin.json", checks);
  const marketplace = readJson(root, ".agents/plugins/marketplace.json", checks);

  requireFields(
    checks,
    rootManifest,
    ".codex-plugin/plugin.json",
    ["name", "version", "description", "skills", "hooks", "interface"],
    "codex.manifest",
  );
  requireValue(checks, rootManifest, {
    name: "codex.manifest.name",
    file: ".codex-plugin/plugin.json",
    field: "name",
    expected: "fw",
  });
  requireReferencedPath(checks, root, {
    name: "codex.manifest.skills.path",
    manifest: rootManifest,
    file: ".codex-plugin/plugin.json",
    field: "skills",
  });
  requireReferencedPath(checks, root, {
    name: "codex.manifest.hooks.path",
    manifest: rootManifest,
    file: ".codex-plugin/plugin.json",
    field: "hooks",
  });

  if (rootManifest && packageManifest && JSON.stringify(rootManifest) !== JSON.stringify(packageManifest)) {
    checks.push(issue({
      name: "codex.package.manifest",
      file: "plugins/fw/.codex-plugin/plugin.json",
      expected: "matches .codex-plugin/plugin.json",
      actual: "manifest differs",
      fix: "sync plugins/fw/.codex-plugin/plugin.json from .codex-plugin/plugin.json",
    }));
  }

  const skillsMismatch = directoryMismatch(root, "skills", "plugins/fw/skills");
  if (skillsMismatch) {
    checks.push(issue({
      name: "codex.package.skills",
      file: "plugins/fw/skills",
      expected: "matches skills",
      actual: skillsMismatch,
    }));
  }

  const hooksMismatch = directoryMismatch(root, "hooks", "plugins/fw/hooks");
  if (hooksMismatch) {
    checks.push(issue({
      name: "codex.package.hooks",
      file: "plugins/fw/hooks",
      expected: "matches hooks",
      actual: hooksMismatch,
    }));
  }

  if (fs.existsSync(path.join(root, "plugins/flywheel"))) {
    checks.push(issue({
      name: "codex.package.stale",
      file: "plugins/flywheel",
      expected: "absent",
      actual: "present",
      fix: "remove stale plugins/flywheel package",
    }));
  }

  if (marketplace) {
    const entries = Array.isArray(marketplace.plugins)
      ? marketplace.plugins.filter((plugin) => plugin?.name === "fw")
      : [];
    if (entries.length !== 1) {
      checks.push(issue({
        name: "codex.marketplace.entry",
        file: ".agents/plugins/marketplace.json",
        field: "plugins[name=fw]",
        expected: "one entry",
        actual: `${entries.length} entries`,
      }));
    } else {
      const entry = entries[0];
      requireValue(checks, entry, {
        name: "codex.marketplace.path",
        file: ".agents/plugins/marketplace.json",
        field: "source.path",
        expected: "./plugins/fw",
      });
      requireValue(checks, entry, {
        name: "codex.marketplace.category",
        file: ".agents/plugins/marketplace.json",
        field: "category",
        expected: "Coding",
      });
      requireValue(checks, entry, {
        name: "codex.marketplace.installation",
        file: ".agents/plugins/marketplace.json",
        field: "policy.installation",
        expected: "AVAILABLE",
      });
    }
  }

  checkHookPack(checks, root, {
    file: "hooks/codex-hooks.json",
    expectedEvents: ["PermissionRequest", "PreToolUse"],
    name: "codex.hooks.shape",
  });
}

function checkClaude(root, checks) {
  const manifest = readJson(root, ".claude-plugin/plugin.json", checks);
  const marketplace = readJson(root, ".claude-plugin/marketplace.json", checks);

  requireFields(
    checks,
    manifest,
    ".claude-plugin/plugin.json",
    ["name", "version", "description"],
    "claude.manifest",
  );
  requireValue(checks, manifest, {
    name: "claude.manifest.name",
    file: ".claude-plugin/plugin.json",
    field: "name",
    expected: "fw",
  });

  if (marketplace) {
    const entries = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];
    const entry = entries.find((plugin) => plugin?.name === "flywheel") || entries[0];
    if (!entry) {
      checks.push(issue({
        name: "claude.marketplace.entry",
        file: ".claude-plugin/marketplace.json",
        field: "plugins[0]",
        expected: "plugin entry",
        actual: "missing",
      }));
    } else {
      requireValue(checks, entry, {
        name: "claude.marketplace.source",
        file: ".claude-plugin/marketplace.json",
        field: "source",
        expected: "./",
      });
    }
  }

  checkHookPack(checks, root, {
    file: "hooks/hooks.json",
    expectedEvents: ["PreToolUse", "Stop"],
    name: "claude.hooks.shape",
  });
}

function runPluginChecks({ root = DEFAULT_ROOT, host = "all" } = {}) {
  const checks = [];
  const includeCodex = host === "all" || host === "codex";
  const includeClaude = host === "all" || host === "claude";

  if (!["all", "codex", "claude"].includes(host)) {
    return [issue({
      name: "args.host",
      file: "scripts/plugin-ci-check.js",
      field: "--host",
      expected: "all, codex, or claude",
      actual: host,
    })];
  }

  const codexManifest = readJson(root, ".codex-plugin/plugin.json", checks);
  const claudeManifest = readJson(root, ".claude-plugin/plugin.json", checks);
  const claudeMarketplace = readJson(root, ".claude-plugin/marketplace.json", checks);
  const packageManifest = readJson(root, "plugins/fw/.codex-plugin/plugin.json", checks);
  const claudeMarketplaceEntry = Array.isArray(claudeMarketplace?.plugins)
    ? claudeMarketplace.plugins.find((plugin) => plugin?.name === "flywheel") || claudeMarketplace.plugins[0]
    : null;

  checkVersionSync(checks, [
    { file: ".codex-plugin/plugin.json", field: "version", version: codexManifest?.version },
    { file: ".claude-plugin/plugin.json", field: "version", version: claudeManifest?.version },
    { file: ".claude-plugin/marketplace.json", field: "plugins[0].version", version: claudeMarketplaceEntry?.version },
    { file: "plugins/fw/.codex-plugin/plugin.json", field: "version", version: packageManifest?.version },
  ]);

  checkReleasePlease(root, checks, codexManifest?.version);

  if (includeCodex) {
    checkCodex(root, checks);
  }
  if (includeClaude) {
    checkClaude(root, checks);
  }

  if (checks.length === 0) {
    return [ok("plugin.format", "plugin manifests and packages are valid")];
  }
  return checks;
}

function parseArgs(argv) {
  const options = { host: "all", json: false, root: DEFAULT_ROOT };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--host") {
      index += 1;
      options.host = argv[index] || "";
    } else if (arg === "--root") {
      index += 1;
      options.root = path.resolve(argv[index] || ".");
    } else if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else {
      options.unknown = arg;
    }
  }
  return options;
}

function formatCheck(check) {
  if (check.ok) {
    return `OK ${check.name} - ${check.detail}`;
  }

  const lines = [
    `FAIL ${check.name}`,
    `file: ${check.file}`,
  ];
  if (check.field) {
    lines.push(`field: ${check.field}`);
  }
  lines.push(`expected: ${check.expected}`);
  lines.push(`actual: ${check.actual}`);
  if (check.fix) {
    lines.push(`fix: ${check.fix}`);
  }
  return lines.join("\n");
}

function printChecks(checks, { json = false } = {}) {
  if (json) {
    console.log(JSON.stringify({ checks }, null, 2));
    return;
  }

  for (const check of checks) {
    console.log(formatCheck(check));
    if (!check.ok && process.env.GITHUB_ACTIONS) {
      const message = `${check.name}: expected ${check.expected}; actual ${check.actual}`;
      console.log(`::error file=${check.file}::${message}`);
    }
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    const rows = checks.map((check) => [
      check.ok ? "OK" : "FAIL",
      check.name,
      check.file || "",
      check.field || "",
      check.ok ? check.detail : `expected ${check.expected}; actual ${check.actual}`,
    ]);
    const summary = [
      "| Status | Check | File | Field | Detail |",
      "| --- | --- | --- | --- | --- |",
      ...rows.map((row) => `| ${row.map((value) => String(value).replace(/\|/g, "\\|")).join(" | ")} |`),
      "",
    ].join("\n");
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(`Usage:
  node scripts/plugin-ci-check.js [--host all|codex|claude] [--json] [--root <path>]`);
    return;
  }
  const checks = options.unknown
    ? [issue({
      name: "args.unknown",
      file: "scripts/plugin-ci-check.js",
      expected: "known option",
      actual: options.unknown,
    })]
    : runPluginChecks(options);
  printChecks(checks, options);
  process.exit(checks.every((check) => check.ok) ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  runPluginChecks,
  SEMVER_RE,
};
