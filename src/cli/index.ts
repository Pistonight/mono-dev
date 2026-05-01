import { getMonodevVersion, logError } from "#util";

import { runBuild } from "./build.ts";
import { runCheck } from "./check.ts";
import { runConfig } from "./config.ts";
import { runDoc } from "./doc.ts";
import { runPublish } from "./publish.ts";
import { runTaskfile } from "./taskfile.ts";
import { runTest } from "./vitest.ts";

export { executeShim } from "#util";

export const main = async (args: string[]): Promise<never> => {
    if (!args.length) {
        logHelp();
        process.exit(0);
    }

    const [command, ...rest] = args;
    switch (command) {
        case "help":
        case "--help":
        case "?":
        case "-h": {
            logHelp();
            return process.exit(0);
        }
        case "version": {
            console.log("mono-dev " + getMonodevVersion());
            return process.exit(0);
        }
        case "config": {
            return process.exit(await runConfig(rest));
        }
        case "check": {
            return process.exit(await runCheck(rest));
        }
        case "build": {
            return process.exit(await runBuild(rest));
        }
        case "test": {
            return process.exit(await runTest(rest));
        }
        case "doc": {
            return process.exit(await runDoc(rest));
        }
        case "taskfile": {
            return process.exit(runTaskfile());
        }
        case "publish": {
            return process.exit(await runPublish(rest));
        }
    }

    logError("unknown command " + command);
    logHelp();
    process.exit(1);
};

const logHelp = () => {
    console.log(`mono-dev CLI
  config           Generate typeck and eslint config, for language servers
  check [-f]       Run typeck, prettier, eslint
  build            Build library (for bundling app run vite directly)
  test  ARGS...    Run test (with vitest)
  doc   [--json]   Build documentation 
  taskfile         Fixup taskfiles
  publish [-n]     Publish the package (-n for dry-run)
  version          Print the version
`);
};
