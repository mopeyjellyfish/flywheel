function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSkill(skill) {
  if (skill.startsWith("flywheel:")) {
    return `fw:${skill.slice("flywheel:".length)}`;
  }
  return skill;
}

function skillForms(skill) {
  if (skill.startsWith("fw:")) {
    return [skill, `flywheel:${skill.slice("fw:".length)}`];
  }
  if (skill.startsWith("flywheel:")) {
    return [normalizeSkill(skill), skill];
  }
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
  const normalizedSkill = normalizeSkill(skill);
  const payload = stripSkillLead(rawArguments, skill);
  if (runner === "claude") {
    if (normalizedSkill.startsWith("fw:")) {
      const stage = normalizedSkill.slice("fw:".length);
      return payload ? `/fw:${stage} ${payload}` : `/fw:${stage}`;
    }
    return payload ? `/${normalizedSkill} ${payload}` : `/${normalizedSkill}`;
  }

  if (runner === "codex") {
    return payload ? `Use $${normalizedSkill} ${payload}` : `Use $${normalizedSkill}`;
  }

  return rawArguments;
}

module.exports = {
  renderSubjectPrompt,
};
