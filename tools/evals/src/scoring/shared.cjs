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

module.exports = {
  hasSection,
  boundedCountScore,
  mentionsAny,
};
