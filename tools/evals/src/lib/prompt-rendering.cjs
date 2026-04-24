function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSkill(skill) {
  if (skill === "fw" || skill === "flywheel") {
    return "fw:start";
  }
  if (skill.startsWith("flywheel:")) {
    return `fw:${skill.slice("flywheel:".length)}`;
  }
  return skill;
}

function skillForms(skill) {
  const normalizedSkill = normalizeSkill(skill);
  if (normalizedSkill.startsWith("fw:")) {
    const forms = [normalizedSkill, `flywheel:${normalizedSkill.slice("fw:".length)}`];
    if (normalizedSkill === "fw:start") {
      forms.push("fw", "flywheel");
    }
    return forms;
  }
  if (skill.startsWith("flywheel:")) {
    return [normalizedSkill, skill];
  }
  return [normalizedSkill];
}

function findSkillLead(rawArguments, skill) {
  const trimmed = rawArguments.trim();
  for (const form of skillForms(skill)) {
    const escapedForm = escapeRegex(form);
    const patterns = [
      new RegExp(`^Use\\s+(\\$)${escapedForm}(?=\\s|$)\\s*`, "i"),
      new RegExp(`^Use\\s+(/)${escapedForm}(?=\\s|$)\\s*`, "i"),
      new RegExp(`^(\\$)${escapedForm}(?=\\s|$)\\s*`, "i"),
      new RegExp(`^(/)${escapedForm}(?=\\s|$)\\s*`, "i"),
    ];
    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        return {
          form,
          sigil: match[1],
          payload: trimmed.slice(match[0].length).trim(),
        };
      }
    }
  }
  return null;
}

function isRootAlias(form) {
  return form === "fw" || form === "flywheel";
}

function stripSkillLead(rawArguments, skill) {
  const forms = skillForms(skill).map(escapeRegex);
  const patterns = forms.flatMap((form) => ([
    new RegExp(`^Use\\s+\\$${form}(?=\\s|$)\\s*`, "i"),
    new RegExp(`^Use\\s+/${form}(?=\\s|$)\\s*`, "i"),
    new RegExp(`^\\$${form}(?=\\s|$)\\s*`, "i"),
    new RegExp(`^/${form}(?=\\s|$)\\s*`, "i"),
  ]));

  let stripped = rawArguments.trim();
  for (const pattern of patterns) {
    stripped = stripped.replace(pattern, "");
  }
  return stripped.trim();
}

function renderSubjectPrompt({ runner, skill, rawArguments }) {
  const normalizedSkill = normalizeSkill(skill);
  const lead = findSkillLead(rawArguments, skill);
  const payload = stripSkillLead(rawArguments, skill);
  if (
    runner === "codex" &&
    normalizedSkill === "fw:start" &&
    lead &&
    lead.sigil === "$" &&
    isRootAlias(lead.form)
  ) {
    return lead.payload ? `Use $${lead.form} ${lead.payload}` : `Use $${lead.form}`;
  }

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
