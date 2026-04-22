const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicSimplify(caseItem, output) {
  const scores = {};
  const notes = {};

  const scoped = mentionsAtLeast(output, [/scope/i, /recent/i, /changed/i, /bounded/i, /changed area/i], 1);
  scores["Scoped Simplification"] = scoped ? 2 : 0;
  notes["Scoped Simplification"] = scoped
    ? "Keeps simplification scoped to recent or changed work."
    : "Does not clearly bound the simplification scope.";

  const reduction = mentionsAtLeast(output, [/remove/i, /collapse/i, /localize/i, /wrapper/i, /one-use/i, /indirection/i], 2);
  scores["Complexity Reduction"] = reduction ? 2 : 0;
  notes["Complexity Reduction"] = reduction
    ? "Identifies removable or collapsible complexity."
    : "Does not clearly identify a simplification target.";

  const safety = mentionsAny(output, [/behavior/i, /verification/i, /tests?/i, /safe/i, /without changing/i]);
  scores["Behavior Safety"] = safety ? 2 : 0;
  notes["Behavior Safety"] = safety
    ? "Keeps simplification behavior-safe."
    : "Does not clearly protect behavior during simplification.";

  const restraint = mentionsAny(output, [/defer/i, /out of scope/i, /do not widen/i, /not the whole repo/i]);
  scores["Restraint"] = restraint ? 2 : 1;
  notes["Restraint"] = restraint
    ? "Avoids whole-repo cleanup posture."
    : "Simplification is discussed, but scope restraint is weak.";

  return { scores, notes };
}

module.exports = {
  deterministicSimplify,
};
