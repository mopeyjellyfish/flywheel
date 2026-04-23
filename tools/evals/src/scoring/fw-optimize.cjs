const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicOptimize(caseItem, output) {
  const scores = {};
  const notes = {};

  const metricSignal =
    mentionsAtLeast(output, [/\bmetric/i, /\bp\d\d\b/i, /latency/i, /throughput/i, /memory/i, /cost/i, /build time/i], 1) &&
    mentionsAtLeast(output, [/\bbaseline\b/i, /\bbefore\b/i, /starting point/i, /current state/i], 1) &&
    mentionsAtLeast(output, [/guardrail/i, /stop criteria/i, /rollback/i, /abort/i, /success criteria/i], 1);
  scores["Metric Contract"] = metricSignal ? 2 : 0;
  notes["Metric Contract"] = metricSignal
    ? "Mentions metric contract, baseline, or guardrails."
    : "Does not clearly define a metric contract.";

  const handoffSignal = mentionsAny(output, [/\$fw:review\b/i, /\/fw:review\b/i, /\$fw:commit\b/i, /\/fw:commit\b/i]);
  scores["Workflow Handoff"] = handoffSignal ? 2 : 0;
  notes["Workflow Handoff"] = handoffSignal
    ? "Preserves review or commit as downstream handoff."
    : "Does not clearly route optimization results back into the workflow.";

  const datadogCase = (caseItem.special_constraints || []).some((item) => /datadog/i.test(item));
  if (datadogCase) {
    const backend = mentionsAny(output, [/Datadog/i]);
    scores["Backend Selection"] = backend ? 2 : 0;
    notes["Backend Selection"] = backend
      ? "Selects or discusses Datadog-backed measurement."
      : "Does not clearly acknowledge Datadog-backed measurement.";
  }

  const otelCase = (caseItem.special_constraints || []).some((item) => /otel/i.test(item));
  if (otelCase) {
    const backend = mentionsAny(output, [/OTel/i, /Grafana/i, /Prometheus/i, /Tempo/i, /Loki/i, /Pyroscope/i]);
    scores["Backend Selection"] = backend ? 2 : 0;
    notes["Backend Selection"] = backend
      ? "Selects or discusses OTel-native measurement."
      : "Does not clearly acknowledge OTel-native measurement.";
  }

  const envSignal =
    mentionsAtLeast(output, [/\bbackend\b/i, /source of truth/i, /Datadog/i, /OTel/i, /Grafana/i, /Prometheus/i, /Loki/i, /Tempo/i, /Pyroscope/i, /local-only/i], 1) &&
    mentionsAtLeast(output, [/\benvironment\b/i, /\blocal\b/i, /shared non-production/i, /\bproduction\b/i], 1) &&
    (mentionsAny(output, [/separate/i, /independent/i, /backend.*environment/i, /environment.*backend/i]) ||
      mentionsAtLeast(output, [/\blocal\b/i, /shared non-production/i, /\bproduction\b/i], 2));
  scores["Environment Separation"] = envSignal ? 2 : 0;
  notes["Environment Separation"] = envSignal
    ? "Treats environment as a separate choice."
    : "Does not clearly separate backend from environment.";

  const modelRegressionCase = (caseItem.special_constraints || []).some((item) => /model-regression/i.test(item));
  if (modelRegressionCase) {
    const namedComparison =
      mentionsAny(output, [/gpt-5\.4/i, /gpt 5\.4/i]) &&
      mentionsAny(output, [/claude opus 4\.7/i, /opus 4\.7/i]);
    const versionAware = namedComparison &&
      mentionsAtLeast(output, [/\bpin/i, /\bsnapshot/i, /subject-model/i, /judge-model/i, /\bversion\b/i, /exact model/i], 1);
    const nonPerfGuard = mentionsAtLeast(output, [/semantic drift/i, /behavioral regression/i, /correctness/i, /non-performance/i, /quality regression/i], 1);
    scores["Guardrails"] = versionAware && nonPerfGuard ? 2 : 0;
    notes["Guardrails"] = versionAware && nonPerfGuard
      ? "Protects against version drift and non-performance regressions."
      : "Does not clearly guard against model-version drift or non-performance regressions.";

    const attribution = versionAware &&
      mentionsAtLeast(output, [/same harness/i, /same cases/i, /same judge/i, /hold constant/i, /\bcontrol\b/i, /like-for-like/i], 1);
    scores["Attribution Discipline"] = attribution ? 2 : 0;
    notes["Attribution Discipline"] = attribution
      ? "Keeps the comparison controlled and attributable."
      : "Does not clearly keep the model comparison controlled.";
  }

  return { scores, notes };
}

module.exports = {
  deterministicOptimize,
};
