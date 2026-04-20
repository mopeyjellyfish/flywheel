function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function skillForms(skill) {
  return [skill];
}

function stripSkillLead(rawArguments, skill) {
  const forms = skillForms(skill).map(escapeRegex);
  const patterns = forms.flatMap((form) => ([
    new RegExp(`^Use\\s+\\$${form}\\s*`, "i"),
    new RegExp(`^Use\\s+/${form}\\s*`, "i"),
    new RegExp(`^\\$${form}\\s*`, "i"),
    new RegExp(`^/${form}\\s*`, "i"),
  ]));

  let stripped = rawArguments.trim();
  for (const pattern of patterns) {
    stripped = stripped.replace(pattern, "");
  }
  return stripped.trim();
}

function renderSubjectPrompt({ runner, skill, rawArguments }) {
  const payload = stripSkillLead(rawArguments, skill);
  if (runner === "claude") {
    if (skill.startsWith("flywheel:")) {
      const stage = skill.slice("flywheel:".length);
      return payload ? `/flywheel:${stage} ${payload}` : `/flywheel:${stage}`;
    }
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
