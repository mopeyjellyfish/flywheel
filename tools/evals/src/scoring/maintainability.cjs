const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicMaintainability(caseItem, output) {
  const scores = {};
  const notes = {};

  const currentStructure = mentionsAny(output, [/current truth/i, /current structure/i, /ownership/i, /helpers?/i, /files?/i]);
  scores["Current Structure"] = currentStructure ? 2 : 0;
  notes["Current Structure"] = currentStructure
    ? "Grounds the maintainability read in current structure."
    : "Does not clearly describe the current structure.";

  const editCost = mentionsAtLeast(output, [/future edit/i, /maintenance/i, /coupling/i, /ownership/i, /duplicate/i, /naming/i], 2);
  scores["Future Edit Cost"] = editCost ? 2 : 0;
  notes["Future Edit Cost"] = editCost
    ? "Identifies concrete future-edit cost."
    : "Does not clearly name a maintainability downside.";

  const guidance = mentionsAtLeast(output, [/recommend/i, /keep local/i, /collapse/i, /rename/i, /clarify/i, /reduce/i], 2);
  scores["Concrete Guidance"] = guidance ? 2 : 0;
  notes["Concrete Guidance"] = guidance
    ? "Provides a concrete structural recommendation."
    : "Does not clearly recommend a specific maintainability improvement.";

  const restraint = mentionsAny(output, [/smallest/i, /do not widen/i, /local/i, /avoid broad/i]);
  scores["Restraint"] = restraint ? 2 : 1;
  notes["Restraint"] = restraint
    ? "Keeps the maintainability advice bounded."
    : "Advice exists, but scope restraint is weak.";

  return { scores, notes };
}

module.exports = {
  deterministicMaintainability,
};
