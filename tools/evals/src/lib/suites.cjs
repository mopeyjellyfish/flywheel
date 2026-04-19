const fs = require("fs");
const path = require("path");
const { evalsRoot } = require("./paths.cjs");
const { readJson, readJsonl } = require("./files.cjs");

function listSuites() {
  return fs
    .readdirSync(evalsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(evalsRoot, name, "manifest.json")))
    .sort();
}

function loadSuite(suiteId) {
  const suiteDir = path.join(evalsRoot, suiteId);
  if (!fs.existsSync(suiteDir)) {
    throw new Error(`unknown suite "${suiteId}"`);
  }

  const manifestPath = path.join(suiteDir, "manifest.json");
  const casePath = path.join(suiteDir, "cases.jsonl");
  const rubricPath = path.join(suiteDir, "rubric.md");

  const manifest = readJson(manifestPath);
  const cases = readJsonl(casePath).map((row) => row.item);
  const rubric = fs.readFileSync(rubricPath, "utf8");

  return {
    id: suiteId,
    dir: suiteDir,
    manifest,
    cases,
    rubric,
    files: {
      manifestPath,
      casePath,
      rubricPath,
    },
  };
}

module.exports = {
  listSuites,
  loadSuite,
};
