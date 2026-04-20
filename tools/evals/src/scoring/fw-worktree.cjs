const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicWorktree(caseItem, output) {
  const scores = {};
  const notes = {};

  const scriptSignal = mentionsAny(output, [/worktree-manager\.sh/i, /\$flywheel:worktree\b/i, /\/fw:worktree\b/i]);
  scores["Script Usage"] = scriptSignal ? 2 : 0;
  notes["Script Usage"] = scriptSignal
    ? "Uses or mentions the bundled worktree manager."
    : "Does not clearly route through the bundled worktree manager.";

  const envSignal = mentionsAtLeast(output, [/templates-only/i, /copy-env/i, /\.env/i, /real env files/i], 2);
  scores["Env Safety"] = envSignal ? 2 : 0;
  notes["Env Safety"] = envSignal
    ? "Mentions the env-file safety posture."
    : "Does not clearly mention env-file safety.";

  const nextSignal = mentionsAny(output, [/\bcd\b/i, /\bNEXT:\b/i, /\bcleanup\b/i, /worktree path/i]);
  scores["Next Step"] = nextSignal ? 2 : 0;
  notes["Next Step"] = nextSignal
    ? "Provides a concrete next step."
    : "Does not clearly provide the next concrete step.";

  const actionSignal = mentionsAny(output, [/create/i, /list/i, /path/i, /copy-env/i, /cleanup/i]);
  scores["Action Routing"] = actionSignal ? 2 : 1;
  notes["Action Routing"] = actionSignal
    ? "Acknowledges one of the supported actions."
    : "Action routing is weak.";

  return { scores, notes };
}

module.exports = {
  deterministicWorktree,
};
