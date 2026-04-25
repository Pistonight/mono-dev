import { runBuild } from "./build.ts";

export const main = async (args: string[]): Promise<never> => {
    if (!args.length) {
        logHelp();
        process.exit(0);
    }

    const [command, ...rest] = args;
    switch(command) {
        case "build": {
            process.exit(await runBuild(rest))
        }
    }

    console.error("[mono] unknown command "+command);
    logHelp();
    process.exit(1);
}

const logHelp = () => {
        console.log(`mono-dev CLI
  config           Generate config
  check [-f]       Run typeck, prettier, eslint
  build            Build library (for bundling app run vite)
  test  ARGS...    Run test (with vitest)
  doc   [--json]   Build documentation 
  publish          Publish the package
`);
}
