import { runGlobs } from "@prettier/cli";

const [_node, _script, thePrettierIgnore, thePrettierCache, f] = process.argv;
const fix = f === "-f";

// there are some weird-ness when running prettier like this,
// for example i can't figure out how to set the ignorePath

// See types.ts in @prettier/cli
// https://github.com/prettier/prettier-cli/blob/main/src/types.ts
/** @type {import("@prettier/cli/dist/types.d.ts").Options}*/
const options = {
    /* INPUT OPTIONS */
    globs: ["."],
    /* OUTPUT OPTIONS */
    check: !fix,
    dump: false,
    list: false,
    write: fix,
    /* CONFIG OPTIONS */
    config: true,
    configPath: undefined,
    editorConfig: true,
    ignore: true,
    ignorePath: [thePrettierIgnore],
    withNodeModules: false,
    /* OTHER OPTIONS */
    cache: true,
    cacheLocation: thePrettierCache,
    errorOnUnmatchedPattern: true,
    ignoreUnknown: true,
    logLevel: "log",
    parallel: false,
    parallelWorkers: 0,
    stdinFilepath: undefined,
    /* CONTEXT OPTIONS */
    contextOptions: {},
    /* FORMAT OPTIONS */
    formatOptions: {
        endOfLine: "auto",
        tabWidth: 4,
        printWidth: 100,
    },
};

runGlobs(options, {}, {});
