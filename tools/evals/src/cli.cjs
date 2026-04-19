#!/usr/bin/env node

const { parseCliArgs } = require("./lib/args.cjs");
const { runDoctor } = require("./doctor.cjs");
const { runEval } = require("./run.cjs");

function usage() {
  console.log(`Usage:
  node src/cli.cjs doctor [--smoke]
  node src/cli.cjs eval --suite <suite> [--case <case-id[,case-id...]>] [--runner codex|claude|all] [--judge claude|codex|none] [--subject-model <model>] [--judge-model <model>] [--subject-config <key=value>] [--judge-config <key=value>] [--output-dir <dir>] [--no-cache]
  node src/cli.cjs compare --suite <suite> [--case <case-id[,case-id...]>] [--judge claude|codex|none] [--subject-model <model>] [--judge-model <model>] [--subject-config <key=value>] [--judge-config <key=value>] [--output-dir <dir>] [--no-cache]`);
}

async function main() {
  const { positionals, values } = parseCliArgs(process.argv.slice(2));
  const command = positionals[0];

  if (!command || command === "help" || command === "--help" || command === "-h") {
    usage();
    return;
  }

  if (command === "doctor") {
    const result = await runDoctor({ smoke: Boolean(values.smoke) });
    for (const check of result.checks) {
      console.log(`${check.ok ? "OK" : "FAIL"}  ${check.name} - ${check.detail}`);
    }
    process.exit(result.ok ? 0 : 1);
    return;
  }

  if (command === "eval" || command === "compare") {
    if (!values.suite) {
      console.error("ERROR: --suite is required");
      process.exit(1);
      return;
    }

    const runner = command === "compare" ? "all" : values.runner || "all";
    const result = await runEval({
      suiteId: values.suite,
      caseSelection: values.case,
      runner,
      judge: values.judge || "claude",
      subjectModel: values["subject-model"],
      judgeModel: values["judge-model"],
      subjectConfig: values["subject-config"],
      judgeConfig: values["judge-config"],
      outputDir: values["output-dir"],
      cache: values["no-cache"] ? false : true,
    });
    if (result.hasFailures || result.summaryFailed) {
      process.exit(1);
    }
    return;
  }

  usage();
  process.exit(1);
}

main().catch((error) => {
  console.error(`ERROR: ${error.stack || error.message}`);
  process.exit(1);
});
