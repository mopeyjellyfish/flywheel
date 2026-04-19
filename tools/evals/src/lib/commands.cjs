const { execFile } = require("child_process");

function runCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = execFile(
      command,
      args,
      {
        cwd: options.cwd,
        env: options.env,
        timeout: options.timeoutMs,
        maxBuffer: options.maxBuffer || 20 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        resolve({
          ok: !error,
          error,
          stdout,
          stderr,
          exitCode: error && typeof error.code === "number" ? error.code : 0,
        });
      },
    );

    if (Object.prototype.hasOwnProperty.call(options, "stdin")) {
      child.stdin.end(options.stdin ?? "");
    }
  });
}

module.exports = {
  runCommand,
};
