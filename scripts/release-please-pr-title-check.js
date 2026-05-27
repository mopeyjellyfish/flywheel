#!/usr/bin/env node

const fs = require("fs");

const RELEASABLE_TITLE_RE = /^(feat|fix|deps)(\([^)]+\))?(!)?:\s+/;

function titleFromEvent(eventPath) {
  if (!eventPath || !fs.existsSync(eventPath)) {
    return "";
  }

  const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  return event.pull_request?.title || "";
}

function checkPrTitle(title) {
  const value = String(title || "").trim();
  if (!value) {
    return {
      ok: false,
      message: "missing pull request title",
    };
  }

  if (RELEASABLE_TITLE_RE.test(value)) {
    return {
      ok: false,
      message: "Release Please reads merge-commit PR titles. Use a neutral PR title and keep Conventional Commit semantics in branch commits.",
    };
  }

  return {
    ok: true,
    message: "pull request title is neutral for Release Please merge-commit processing",
  };
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--title") {
      index += 1;
      options.title = argv[index] || "";
    } else if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else {
      options.unknown = arg;
    }
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(`Usage:
  node scripts/release-please-pr-title-check.js [--title <title>]

When --title is omitted, PR_TITLE is used, then GITHUB_EVENT_PATH.`);
    return;
  }

  if (options.unknown) {
    console.error(`ERROR: unknown option: ${options.unknown}`);
    process.exit(1);
  }

  const title = options.title || process.env.PR_TITLE || titleFromEvent(process.env.GITHUB_EVENT_PATH);
  const result = checkPrTitle(title);
  if (result.ok) {
    console.log(`OK release-please.pr-title - ${result.message}`);
    return;
  }

  console.error(`FAIL release-please.pr-title - ${result.message}`);
  if (process.env.GITHUB_ACTIONS) {
    console.log(`::error::${result.message}`);
  }
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = {
  checkPrTitle,
  RELEASABLE_TITLE_RE,
};
