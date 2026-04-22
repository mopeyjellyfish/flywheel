const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicPatternRecognition(caseItem, output) {
  const scores = {};
  const notes = {};

  const repoGrounding = mentionsAny(output, [/current truth/i, /repo pattern/i, /existing/i, /nearby/i]);
  scores["Repo Pattern Grounding"] = repoGrounding ? 2 : 0;
  notes["Repo Pattern Grounding"] = repoGrounding
    ? "Starts from repo pattern truth."
    : "Does not clearly ground the answer in repo patterns.";

  const patternFit = mentionsAtLeast(output, [/DTO/i, /repository/i, /builder/i, /strategy/i, /DDD/i, /ports/i, /adapter/i], 1);
  scores["Pattern Fit"] = patternFit ? 2 : 0;
  notes["Pattern Fit"] = patternFit
    ? "Maps the problem to named pattern choices."
    : "Does not clearly engage the relevant pattern family.";

  const antiPattern = mentionsAtLeast(output, [/not justified/i, /avoid/i, /stay local/i, /do not/i, /simpler/i], 2);
  scores["Anti-Pattern Discipline"] = antiPattern ? 2 : 0;
  notes["Anti-Pattern Discipline"] = antiPattern
    ? "Explains what should not be added."
    : "Does not clearly reject a bad or unnecessary pattern choice.";

  const restraint = mentionsAny(output, [/no pattern/i, /stay local/i, /simpler/i, /minimum/i]);
  scores["Restraint"] = restraint ? 2 : 1;
  notes["Restraint"] = restraint
    ? "Shows restraint about adding named patterns."
    : "Pattern fit is discussed, but the simpler path is not explicit.";

  return { scores, notes };
}

module.exports = {
  deterministicPatternRecognition,
};
