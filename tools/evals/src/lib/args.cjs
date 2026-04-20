const { parseArgs } = require("node:util");

function parseCliArgs(argv) {
  const result = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      suite: { type: "string" },
      case: { type: "string" },
      runner: { type: "string" },
      judge: { type: "string" },
      "subject-model": { type: "string" },
      "judge-model": { type: "string" },
      "subject-config": { type: "string", multiple: true },
      "judge-config": { type: "string", multiple: true },
      "output-dir": { type: "string" },
      "no-cache": { type: "boolean" },
      smoke: { type: "boolean" },
      host: { type: "string" },
    },
  });

  return {
    positionals: result.positionals,
    values: result.values,
  };
}

module.exports = {
  parseCliArgs,
};
