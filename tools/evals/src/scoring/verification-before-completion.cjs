const { mentionsAny, mentionsAtLeast } = require("./shared.cjs");

function deterministicVerification(caseItem, output) {
  const scores = {};
  const notes = {};

  const claimSignal = mentionsAny(output, [/\bClaim\b/i, /what is being verified/i, /\bverify\b/i]);
  scores["Claim Definition"] = claimSignal ? 2 : 0;
  notes["Claim Definition"] = claimSignal
    ? "Identifies the claim being verified."
    : "Does not clearly define the claim.";

  const proofSignal = mentionsAny(output, [/\bProof\b/i, /exact command/i, /test command/i, /query/i, /artifact/i]);
  scores["Proof Identification"] = proofSignal ? 2 : 0;
  notes["Proof Identification"] = proofSignal
    ? "Identifies a proof path."
    : "Does not clearly identify the proof path.";

  const freshSignal = mentionsAtLeast(output, [/run it fresh/i, /rerun/i, /fresh result/i, /current tree/i], 1);
  scores["Fresh Verification"] = freshSignal ? 2 : 0;
  notes["Fresh Verification"] = freshSignal
    ? "Requires fresh verification."
    : "Does not clearly require a fresh run.";

  const honestSignal = mentionsAtLeast(output, [/\bStatus\b/i, /\bGap\b/i, /honest/i, /supported by that result/i], 1);
  scores["Honest Status"] = honestSignal ? 2 : 0;
  notes["Honest Status"] = honestSignal
    ? "Returns an honest status with a gap when needed."
    : "Does not clearly distinguish status from wishful thinking.";

  return { scores, notes };
}

module.exports = {
  deterministicVerification,
};
