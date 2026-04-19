function hasSection(output, heading) {
  return new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "im").test(output);
}

function boundedCountScore(count, expected) {
  if (count === expected) {
    return 2;
  }
  if (count > 0 && Math.abs(count - expected) <= 1) {
    return 1;
  }
  return 0;
}

function mentionsAny(output, patterns) {
  return patterns.some((pattern) => pattern.test(output));
}

function countMatchingPatterns(output, patterns) {
  return patterns.reduce((count, pattern) => count + (pattern.test(output) ? 1 : 0), 0);
}

function mentionsAll(output, patterns) {
  return patterns.every((pattern) => pattern.test(output));
}

function mentionsAtLeast(output, patterns, minimum) {
  return countMatchingPatterns(output, patterns) >= minimum;
}

module.exports = {
  hasSection,
  boundedCountScore,
  mentionsAny,
  countMatchingPatterns,
  mentionsAll,
  mentionsAtLeast,
};
