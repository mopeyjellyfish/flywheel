const path = require("path");

const workspaceRoot = path.resolve(__dirname, "..", "..");
const repoRoot = path.resolve(workspaceRoot, "..", "..");

module.exports = {
  workspaceRoot,
  repoRoot,
  evalsRoot: path.join(repoRoot, "evals"),
  rootHarnessScript: path.join(repoRoot, "scripts", "flywheel-eval.js"),
  defaultRunRoot: path.join(repoRoot, ".context", "flywheel-evals"),
  localProviderPath: path.join(workspaceRoot, "src", "providers", "local-cli-provider.cjs"),
};
