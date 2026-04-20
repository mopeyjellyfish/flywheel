const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicObservability(caseItem, output) {
  const scores = {};
  const notes = {};

  const platformSignal = mentionsAny(output, [/repo truth/i, /Datadog/i, /OTel/i, /Grafana/i, /Prometheus/i, /Loki/i, /Tempo/i, /Pyroscope/i]);
  scores["Platform Grounding"] = platformSignal ? 2 : 0;
  notes["Platform Grounding"] = platformSignal
    ? "Grounds the plan in an observability platform or repo truth."
    : "Does not clearly ground observability in repo truth.";

  const runtimeSignal = mentionsAtLeast(output, [/request/i, /job/i, /queue/i, /migration/i, /runtime surface/i, /API/i], 1);
  scores["Runtime Surface"] = runtimeSignal ? 2 : 0;
  notes["Runtime Surface"] = runtimeSignal
    ? "Identifies a runtime surface."
    : "Does not clearly identify the runtime surface.";

  const signalPlan = mentionsAtLeast(output, [/\bLogs\b/i, /\bTraces\b/i, /\bMetrics\b/i, /\bValidation\b/i, /dashboard/i, /query/i], 2);
  scores["Signal Plan"] = signalPlan ? 2 : 0;
  notes["Signal Plan"] = signalPlan
    ? "Defines logs, traces, metrics, or validation."
    : "Does not clearly present a signal plan.";

  const choiceCase = (caseItem.special_constraints || []).some((item) => /choice/i.test(item));
  if (choiceCase) {
    const choiceSignal = mentionsAtLeast(output, [/failure modes/i, /blast radius/i, /recommend/i, /Custom/i, /options/i], 2);
    scores["Choice Surface"] = choiceSignal ? 2 : 0;
    notes["Choice Surface"] = choiceSignal
      ? "Presents a grounded choice surface."
      : "Does not clearly present the observability choice surface.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicObservability,
};
