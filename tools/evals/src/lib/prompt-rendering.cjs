function stripSkillLead(rawArguments, skill) {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`^Use\\s+\\$${escaped}\\s*`, "i"),
    new RegExp(`^Use\\s+/${escaped}\\s*`, "i"),
    new RegExp(`^\\$${escaped}\\s*`, "i"),
    new RegExp(`^/${escaped}\\s*`, "i"),
  ];

  let stripped = rawArguments.trim();
  for (const pattern of patterns) {
    stripped = stripped.replace(pattern, "");
  }
  return stripped.trim();
}

function renderSubjectPrompt({ runner, skill, rawArguments }) {
  const payload = stripSkillLead(rawArguments, skill);
  if (runner === "claude") {
    return payload ? `/${skill} ${payload}` : `/${skill}`;
  }

  if (runner === "codex") {
    return payload ? `Use $${skill} ${payload}` : `Use $${skill}`;
  }

  return rawArguments;
}

module.exports = {
  renderSubjectPrompt,
};
