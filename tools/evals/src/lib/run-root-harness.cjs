const path = require("path");
const { runCommand } = require("./commands.cjs");
const { repoRoot, rootHarnessScript } = require("./paths.cjs");

async function runRootSummary(suiteId, resultsPath) {
  return runCommand(
    process.execPath,
    [rootHarnessScript, "summarize", suiteId, path.resolve(resultsPath)],
    { cwd: repoRoot },
  );
}

module.exports = {
  runRootSummary,
};
