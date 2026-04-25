import { getMonodevVersion } from "#util";

import { runBuild } from "./build.ts";
import { runConfig } from "./config.ts";

export const main = async (args: string[]): Promise<never> => {
    if (!args.length) {
        logHelp();
        process.exit(0);
    }

    const [command, ...rest] = args;
    switch(command) {
        case "help":
        case "--help":
        case "?":
        case "-h": {
            logHelp();
            process.exit(0);
        }
        case "version": {
            console.log("mono-dev "+getMonodevVersion());
            process.exit(0);
        }
        case "config": {
            process.exit(await runConfig(rest));
        }
        case "build": {
            process.exit(await runBuild(rest));
        }
    }

    console.error("[mono] unknown command "+command);
    logHelp();
    process.exit(1);
}

const logHelp = () => {
        console.log(`mono-dev CLI
  config           Generate typeck and eslint config, for language servers
  check [-f]       Run typeck, prettier, eslint
  build            Build library (for bundling app run vite directly)
  test  ARGS...    Run test (with vitest)
  doc   [--json]   Build documentation 
  publish          Publish the package
  version          Print the version
`);
}
