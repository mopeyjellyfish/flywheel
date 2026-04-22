const { boundedCountScore, hasSection, mentionsAny } = require("./shared.cjs");

function countRankedIdeas(output) {
  const matches = output.match(/^\d+\.\s+/gm) || [];
  return matches.length;
}

function deterministicIdeate(caseItem, output) {
  const scores = {};
  const notes = {};

  const requiredSections = ["Grounding", "Ranked Ideas", "Rejection Summary", "Recommendation"];
  const missing = requiredSections.filter((heading) => !hasSection(output, heading));
  scores["Structure Compliance"] = missing.length === 0 ? 2 : missing.length <= 2 ? 1 : 0;
  notes["Structure Compliance"] =
    missing.length === 0
      ? "All canonical shortlist sections are present."
      : `Missing sections: ${missing.join(", ")}.`;

  let expectedCount = null;
  if (/top 3/i.test(caseItem.arguments)) {
    expectedCount = 3;
  }
  if (/top 5/i.test(caseItem.arguments)) {
    expectedCount = 5;
  }
  if (expectedCount) {
    const actualCount = countRankedIdeas(output);
    scores["Restraint"] = boundedCountScore(actualCount, expectedCount);
    notes["Restraint"] = `Found ${actualCount} ranked idea bullets for expected count ${expectedCount}.`;
  } else {
    scores["Restraint"] = output.split(/\s+/).length <= 900 ? 2 : 1;
    notes["Restraint"] = "Used overall length as a restraint proxy.";
  }

  const routesToBrainstorm = mentionsAny(output, [/\$flywheel:brainstorm\b/i, /\/flywheel:brainstorm\b/i, /\/flywheel:brainstorm\b/i, /\/brainstorm\b/i]);
  const jumpsToPlan = mentionsAny(output, [/\$flywheel:plan\b/i, /\/flywheel:plan\b/i, /\/flywheel:plan\b/i]);
  const jumpsToWork = mentionsAny(output, [/\$flywheel:work\b/i, /\/flywheel:work\b/i, /\/flywheel:work\b/i]);
  scores["Workflow Routing"] = routesToBrainstorm && !jumpsToWork ? 2 : jumpsToPlan || jumpsToWork ? 0 : 1;
  notes["Workflow Routing"] =
    scores["Workflow Routing"] === 2
      ? "Routes selected idea into brainstorming."
      : "Routing is missing or skips too far ahead.";

  const noExternalResearch = (caseItem.special_constraints || []).some((item) => /no-external-research/i.test(item)) || /No external research/i.test(caseItem.arguments);
  const claimsExternalResearch = mentionsAny(output, [/external research/i, /looked up/i, /searched/i]);
  const researchExpected = (caseItem.special_constraints || []).some((item) => /research is expected|published guidance matters/i.test(item));
  const researchSignal = mentionsAny(output, [/docs\/research/i, /saved research/i, /research brief/i, /fresh brief/i, /focused research pass/i, /targeted follow-?up research/i, /current published guidance/i]);
  if (noExternalResearch) {
    scores["Constraint Obedience"] = claimsExternalResearch ? 0 : 2;
    notes["Constraint Obedience"] = claimsExternalResearch
      ? "Claims external research despite explicit no-external-research constraint."
      : "No-external-research constraint appears respected.";
  } else if (researchExpected) {
    scores["Constraint Obedience"] = researchSignal ? 2 : 0;
    notes["Constraint Obedience"] = researchSignal
      ? "Acknowledges the need for current-practice research."
      : "Does not acknowledge the expected current-practice research posture.";
  } else {
    scores["Constraint Obedience"] = 2;
    notes["Constraint Obedience"] = "No hard constraint violation detected deterministically.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicIdeate,
};
