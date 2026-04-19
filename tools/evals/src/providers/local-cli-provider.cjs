const { runSubjectCli } = require("../lib/run-direct-cli.cjs");

module.exports = class LocalCliProvider {
  constructor(options = {}) {
    this.providerId = options.id || `local-cli:${options.config?.runner || "unknown"}`;
    this.config = options.config || {};
  }

  id() {
    return this.providerId;
  }

  async callApi(prompt, context) {
    const skill = context.vars.skill;
    const rawArguments = context.vars.rawArguments || prompt;
    const runner = this.config.runner;
    const result = await runSubjectCli({
      runner,
      rawArguments,
      skill,
      model: this.config.model,
      configOverrides: this.config.configOverrides,
    });

    if (!result.ok) {
      return {
        error: result.error,
        output: "",
        prompt: result.actualPrompt,
        metadata: {
          runner,
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
        },
      };
    }

    return {
      output: result.output,
      prompt: result.actualPrompt,
      metadata: {
        runner,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      },
    };
  }
};
