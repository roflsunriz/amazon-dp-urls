export {};

const bunExecutable = process.execPath;
const workingDirectory = process.cwd();

const processes = [
  {
    name: "typescript",
    process: Bun.spawn([bunExecutable, "run", "watch"], {
      cwd: workingDirectory,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    }),
  },
  {
    name: "firefox",
    process: Bun.spawn(
      [bunExecutable, "x", "web-ext", "run", "--source-dir", "dist"],
      {
        cwd: workingDirectory,
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
      },
    ),
  },
];

let isStopping = false;

async function stopAll(exitCode: number): Promise<never> {
  if (!isStopping) {
    isStopping = true;
    for (const child of processes) {
      child.process.kill();
    }
    await Promise.allSettled(processes.map((child) => child.process.exited));
  }

  process.exit(exitCode);
}

process.on("SIGINT", () => {
  void stopAll(0);
});
process.on("SIGTERM", () => {
  void stopAll(0);
});

const completed = await Promise.race(
  processes.map(async (child) => ({
    name: child.name,
    exitCode: await child.process.exited,
  })),
);

console.error(
  `[dev] ${completed.name} exited with code ${completed.exitCode}; stopping the other process.`,
);
await stopAll(completed.exitCode);
