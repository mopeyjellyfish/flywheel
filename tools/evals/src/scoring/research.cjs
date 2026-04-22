const { hasSection, mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function countRankedFindings(output) {
  return (output.match(/^\d+\.\s+\*\*/gm) || []).length;
}

function deterministicResearch(caseItem, output) {
  const scores = {};
  const notes = {};

  const hasTopicFrame = hasSection(output, "Topic Frame");
  const hasResearchThreads = hasSection(output, "Research Threads");
  scores["Topic Framing"] = hasTopicFrame && hasResearchThreads ? 2 : hasTopicFrame || hasResearchThreads ? 1 : 0;
  notes["Topic Framing"] = hasTopicFrame && hasResearchThreads
    ? "Frames the topic and identifies useful research threads."
    : hasTopicFrame || hasResearchThreads
      ? "Only part of the expected framing structure is present."
      : "Does not clearly frame the topic or decompose it into research threads.";

  const hasExecutionStrategy = hasSection(output, "Execution Strategy");
  const inlineMode = /\bMode:\s*`?inline`?/i.test(output) || /\binline\b/i.test(output);
  const delegatedMode = /\bMode:\s*`?delegated`?/i.test(output) || /\bdelegated\b/i.test(output);
  const orchestratedMode = /\bMode:\s*`?orchestrated`?/i.test(output) || /\borchestrated\b/i.test(output);
  const strategyReason = mentionsAny(output, [/Why this mode:/i, /effort budget:/i, /latency/i, /complexity/i, /independent threads?/i, /bounded/i]);
  const inlineExpected = (caseItem.special_constraints || []).some((item) => /inline-mode-expected/i.test(item));
  const orchestratedExpected = (caseItem.special_constraints || []).some((item) => /orchestrated-mode-expected/i.test(item));
  let executionScore = hasExecutionStrategy && strategyReason ? 2 : hasExecutionStrategy || strategyReason ? 1 : 0;
  let executionNote = executionScore === 2
    ? "Chooses and explains a research execution mode."
    : executionScore === 1
      ? "Names or implies an execution mode, but the rationale is weak."
      : "Does not clearly choose a research execution mode.";
  if (inlineExpected) {
    executionScore = hasExecutionStrategy && inlineMode && !orchestratedMode ? 2 : inlineMode ? 1 : 0;
    executionNote = executionScore === 2
      ? "Chooses inline research for the narrow bounded case."
      : executionScore === 1
        ? "Hints at inline research but does not make the mode explicit."
        : "Does not choose the expected inline mode.";
  }
  if (orchestratedExpected) {
    const boundedParallelSignal = mentionsAny(output, [/parallel/i, /independent threads?/i, /bounded/i, /worker/i, /lead researcher/i]);
    executionScore = hasExecutionStrategy && orchestratedMode && boundedParallelSignal ? 2 : orchestratedMode ? 1 : 0;
    executionNote = executionScore === 2
      ? "Chooses orchestrated research with bounded parallel rationale."
      : executionScore === 1
        ? "Chooses orchestrated research but does not bound the parallelism clearly."
        : "Does not choose the expected orchestrated mode.";
  }
  scores["Execution Strategy"] = executionScore;
  notes["Execution Strategy"] = executionNote;

  const hasRankedFindings = hasSection(output, "Ranked Findings");
  const rankedFindingCount = countRankedFindings(output);
  const whyItMattersCount = (output.match(/Why it matters:/gi) || []).length;
  const confidenceCount = (output.match(/Confidence:/gi) || []).length;
  const sourcesCount = (output.match(/Sources?:/gi) || []).length;
  const evidenceRanking = hasRankedFindings && rankedFindingCount >= 2 && whyItMattersCount >= 1 && confidenceCount >= 1 && sourcesCount >= 1;
  scores["Evidence Ranking"] = evidenceRanking ? 2 : hasRankedFindings && rankedFindingCount >= 1 ? 1 : 0;
  notes["Evidence Ranking"] = evidenceRanking
    ? "Uses a ranked findings section with why-it-matters, confidence, and source support."
    : hasRankedFindings && rankedFindingCount >= 1
      ? "Has a findings section, but the ranking support is thin."
      : "Does not clearly present ranked findings.";

  const noExternalResearch = (caseItem.special_constraints || []).some((item) => /no-external-research/i.test(item))
    || /no external research/i.test(caseItem.arguments);
  const hasSourceNotes = hasSection(output, "Source Notes");
  const hasExternalUrl = /https?:\/\/[^\s)]+/i.test(output);
  const hasRepoPath = /`(?:skills|docs|evals|tools|scripts)\/[^`\s]+`/.test(output) || mentionsAny(output, [/AGENTS\.md/i, /README\.md/i]);
  const sourceQualitySignal = mentionsAny(output, [/official/i, /first-party/i, /primary sources?/i, /repo truth/i, /local evidence/i, /trusted/i]);
  const combineLocalAndExternal = (caseItem.special_constraints || []).some((item) => /should-combine-local-and-external-evidence/i.test(item));
  let sourcePosture = false;
  if (noExternalResearch) {
    sourcePosture = hasSourceNotes && hasRepoPath && !hasExternalUrl;
  } else if (combineLocalAndExternal) {
    sourcePosture = hasSourceNotes && hasRepoPath && hasExternalUrl;
  } else {
    sourcePosture = hasSourceNotes && (hasExternalUrl || hasRepoPath) && sourceQualitySignal;
  }
  scores["Source Posture"] = sourcePosture ? 2 : hasSourceNotes ? 1 : 0;
  notes["Source Posture"] = noExternalResearch
    ? sourcePosture
      ? "Honors the no-external-research constraint and stays grounded in repo-local evidence."
      : "Either implies external research despite the constraint or fails to ground the answer locally."
    : sourcePosture
      ? "Uses traceable sources with an appropriate local/external posture."
      : hasSourceNotes
        ? "Mentions sources, but the traceability or source posture is weak."
        : "Does not clearly signal trustworthy source selection.";

  const hasUncertaintySection = hasSection(output, "Conflicts And Uncertainty");
  const uncertainty = hasUncertaintySection && mentionsAtLeast(output, [/\bFact\b/i, /\bInference\b/i, /open questions?/i, /conflicts?/i, /uncertainty/i], 2);
  scores["Uncertainty Discipline"] = uncertainty ? 2 : hasUncertaintySection ? 1 : 0;
  notes["Uncertainty Discipline"] = uncertainty
    ? "Keeps facts, inferences, and uncertainty visible."
    : hasUncertaintySection
      ? "Has an uncertainty section, but the certainty labels are weak."
      : "Does not clearly distinguish certainty levels or conflicts.";

  const hasRecommendation = hasSection(output, "Recommendation");
  const recommendationDetail = mentionsAny(output, [/Recommended direction:/i, /\bWhy:\b/i, /Main tradeoff:/i, /\brecommend/i]);
  scores["Decision Guidance"] = hasRecommendation && recommendationDetail ? 2 : hasRecommendation || recommendationDetail ? 1 : 0;
  notes["Decision Guidance"] = hasRecommendation && recommendationDetail
    ? "Ends with a recommendation grounded enough to drive a decision."
    : hasRecommendation || recommendationDetail
      ? "Contains recommendation language, but the decision guidance is weak."
      : "Does not clearly give a recommendation.";

  const hasReuseGuidance = hasSection(output, "Reuse Guidance");
  const hasNextMove = hasSection(output, "Next Move");
  const shouldSaveBrief = (caseItem.special_constraints || []).some((item) => /should-save-brief/i.test(item));
  const savePathSignal = /docs\/research\/[^\s`]+-research\.md/i.test(output);
  const stageReuseSignal = mentionsAtLeast(output, [/\bideate\b/i, /\bbrainstorm\b/i, /\breview\b/i, /\bplan\b/i], 1);
  const ephemeralSignal = mentionsAny(output, [
    /\bephemeral\b/i,
    /return (it )?inline/i,
    /skip file creation/i,
    /no durable file/i,
    /save only when/i,
    /save only if/i,
    /persist only when/i,
    /persist only if/i,
    /reuse is likely/i
  ]);
  const reuse = shouldSaveBrief
    ? hasReuseGuidance && hasNextMove && stageReuseSignal && savePathSignal
    : hasReuseGuidance && hasNextMove && ephemeralSignal && (stageReuseSignal || hasRecommendation);
  scores["Reuse Value"] = reuse ? 2 : hasReuseGuidance || hasNextMove ? 1 : 0;
  notes["Reuse Value"] = shouldSaveBrief
    ? reuse
      ? "Shapes the result as something later Flywheel stages could reuse and save."
      : hasReuseGuidance || hasNextMove
        ? "Research exists, but the save guidance is weak for a case that should persist."
        : "Research exists, but the durable reuse story is weak."
    : reuse
      ? "Keeps persistence disciplined and shapes the result as a reusable handback."
      : hasReuseGuidance || hasNextMove
        ? "Research exists, but the inline-vs-save guidance is weak."
        : "Research exists, but the reuse story is weak.";

  return { scores, notes };
}

module.exports = {
  deterministicResearch,
};
