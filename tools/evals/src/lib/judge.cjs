const fs = require("fs");
const os = require("os");
const path = require("path");
const { runCommand } = require("./commands.cjs");

function applyCodexOverrides(args, { model, configOverrides }) {
  const nextArgs = [...args];
  if (model) {
    nextArgs.splice(1, 0, "--model", model);
  }
  if (Array.isArray(configOverrides)) {
    for (const override of configOverrides) {
      nextArgs.splice(1, 0, override);
      nextArgs.splice(1, 0, "-c");
    }
  }
  return nextArgs;
}

function buildDimensionMap(dimensions, valueSchema) {
  return Object.fromEntries(dimensions.map((dimension) => [dimension, valueSchema]));
}

function buildJudgeSchema(dimensions) {
  return {
    type: "object",
    properties: {
      summary: { type: "string" },
      scores: {
        type: "object",
        properties: buildDimensionMap(dimensions, { type: "integer", enum: [0, 1, 2] }),
        required: dimensions,
        additionalProperties: false,
      },
      notes: {
        type: "object",
        properties: buildDimensionMap(dimensions, { type: "string" }),
        required: dimensions,
        additionalProperties: false,
      },
    },
    required: ["summary", "scores", "notes"],
    additionalProperties: false,
  };
}

function createSchemaPath(dimensions) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "flywheel-judge-schema-"));
  const schemaPath = path.join(dir, "schema.json");
  fs.writeFileSync(schemaPath, JSON.stringify(buildJudgeSchema(dimensions), null, 2));
  return schemaPath;
}

function buildJudgePrompt({ suite, caseItem, output, dimensions }) {
  const caseMetadata = {
    id: caseItem.id,
    raw_arguments: caseItem.arguments,
    expected_stage: caseItem.expected_stage || null,
    expected_handoff: caseItem.expected_handoff || null,
    expected_mode: caseItem.expected_mode || null,
    special_constraints: caseItem.special_constraints || [],
    success_definition: caseItem.success_definition || [],
  };

  return [
    "You are grading a Flywheel skill output.",
    "Return JSON only and follow the provided schema exactly.",
    "Use only integer scores 0, 1, or 2 for each requested dimension.",
    "0 means fail, 1 means partial/weak, 2 means clear pass.",
    "",
    `Suite: ${suite.id}`,
    `Skill under test: ${suite.manifest.skill}`,
    `Dimensions to score: ${dimensions.join(", ")}`,
    "",
    "Rubric:",
    suite.rubric.trim(),
    "",
    "Case metadata:",
    JSON.stringify(caseMetadata, null, 2),
    "",
    "Model output under test:",
    output.trim(),
  ].join("\n");
}

function normalizeJudgeResult(raw, dimensions) {
  const normalized = {
    summary: typeof raw.summary === "string" ? raw.summary : "",
    scores: {},
    notes: {},
  };

  for (const dimension of dimensions) {
    const score = raw.scores && raw.scores[dimension];
    normalized.scores[dimension] = [0, 1, 2].includes(score) ? score : 0;
    normalized.notes[dimension] =
      raw.notes && typeof raw.notes[dimension] === "string" ? raw.notes[dimension] : "";
  }

  return normalized;
}

async function runClaudeJudge({ suite, caseItem, output, dimensions, model }) {
  const prompt = buildJudgePrompt({ suite, caseItem, output, dimensions });
  const schema = buildJudgeSchema(dimensions);
  const args = [
    "-p",
    "--no-session-persistence",
    "--output-format",
    "json",
    "--json-schema",
    JSON.stringify(schema),
    prompt,
  ];

  if (model) {
    args.splice(1, 0, "--model", model);
  }

  const result = await runCommand("claude", args, {
    timeoutMs: 10 * 60 * 1000,
  });

  let parsed = {};
  try {
    parsed = JSON.parse(result.stdout || "{}");
    if (typeof parsed.result === "string") {
      parsed = JSON.parse(parsed.result);
    }
  } catch (error) {
    return {
      ok: false,
      error: result.stdout.trim() || result.stderr.trim() || error.message,
    };
  }

  return {
    ok: true,
    value: normalizeJudgeResult(parsed, dimensions),
  };
}

async function runCodexJudge({ suite, caseItem, output, dimensions, model, configOverrides }) {
  const prompt = buildJudgePrompt({ suite, caseItem, output, dimensions });
  const schemaPath = createSchemaPath(dimensions);
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "flywheel-codex-judge-"));
  const outputPath = path.join(outputDir, "judge.json");
  const baseArgs = [
    "exec",
    "--cd",
    process.cwd(),
    "--sandbox",
    "read-only",
    "--ephemeral",
    "--color",
    "never",
    "--output-schema",
    schemaPath,
    "-o",
    outputPath,
    "-",
  ];
  const args = applyCodexOverrides(baseArgs, { model, configOverrides });

  const result = await runCommand("codex", args, {
    stdin: prompt,
    timeoutMs: 10 * 60 * 1000,
  });

  if (!result.ok || !fs.existsSync(outputPath)) {
    return {
      ok: false,
      error: result.stderr.trim() || result.stdout.trim() || "codex judge failed",
    };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    return {
      ok: true,
      value: normalizeJudgeResult(parsed, dimensions),
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

async function runLocalJudge({
  judgeRunner,
  suite,
  caseItem,
  output,
  dimensions,
  model,
  configOverrides,
}) {
  if (judgeRunner === "none" || dimensions.length === 0) {
    return {
      ok: true,
      value: {
        summary: "",
        scores: Object.fromEntries(dimensions.map((dimension) => [dimension, 0])),
        notes: Object.fromEntries(dimensions.map((dimension) => [dimension, ""])),
      },
    };
  }

  if (judgeRunner === "claude") {
    return runClaudeJudge({ suite, caseItem, output, dimensions, model });
  }
  if (judgeRunner === "codex") {
    return runCodexJudge({ suite, caseItem, output, dimensions, model, configOverrides });
  }
  throw new Error(`unsupported judge "${judgeRunner}"`);
}

module.exports = {
  runLocalJudge,
};
