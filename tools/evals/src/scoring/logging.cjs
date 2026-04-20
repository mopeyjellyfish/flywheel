const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicLogging(caseItem, output) {
  const scores = {};
  const notes = {};

  const truthSignal = mentionsAny(output, [/current logging truth/i, /logger/i, /wrappers?/i, /existing logging/i]);
  scores["Current Truth"] = truthSignal ? 2 : 0;
  notes["Current Truth"] = truthSignal
    ? "Starts from existing logging truth."
    : "Does not clearly ground itself in the existing logging shape.";

  const modelSignal = mentionsAtLeast(output, [/event/i, /field/i, /correlation/i, /request id/i, /trace id/i, /outcome/i], 2);
  scores["Event Model"] = modelSignal ? 2 : 0;
  notes["Event Model"] = modelSignal
    ? "Defines an event model or required fields."
    : "Does not clearly define event names or fields.";

  const sensitiveSignal = mentionsAtLeast(output, [/secret/i, /token/i, /password/i, /sensitive/i, /do not leak/i], 1);
  scores["Sensitive Data Discipline"] = sensitiveSignal ? 2 : 0;
  notes["Sensitive Data Discipline"] = sensitiveSignal
    ? "Mentions secret or sensitive-data discipline."
    : "Does not clearly mention sensitive-data logging discipline.";

  const operabilitySignal = mentionsAtLeast(output, [/retry/i, /backlog/i, /degraded/i, /dependency failure/i, /operator/i], 1);
  scores["Operability"] = operabilitySignal ? 2 : 1;
  notes["Operability"] = operabilitySignal
    ? "Connects logging to operability."
    : "Logging shape is present, but the operability angle is weak.";

  return { scores, notes };
}

module.exports = {
  deterministicLogging,
};
