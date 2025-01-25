#!/usr/bin/env node

/**
 * Wrapper for prettier
 *
 * This is used to run prettier in downstream projects
 * that don't have to have prettier installed (if they have mono-dev
 * installed). We also assume the project is configured
 * to the mono-dev convention
 *
 * Args: The only arg is --fix to fix the files, otherwise it will just check
 */
import { run } from "@prettier/cli";

const argv = process.argv.slice(2);
const fix = argv.includes("--fix") || argv.includes("-f");

// See types.ts in @prettier/cli
const options = {
    /* INPUT OPTIONS */
    globs: ["."],
    /* OUTPUT OPTIONS */
    check: !fix,
    list: false,
    write: fix,
    /* CONFIG OPTIONS */
    config: true,
    configPath: undefined,
    editorConfig: true,
    ignore: true,
    ignorePath: undefined,
    withNodeModules: false,
    /* OTHER OPTIONS */
    cache: true,
    cacheLocation: undefined,
    errorOnUnmatchedPattern: true,
    ignoreUnknown: true,
    logLevel: "log",
    parallel: false,
    parallelWorkers: 0,
    stdinFilepath: undefined,
    /* CONTEXT OPTIONS */
    contextOptions: {},
    // /* FORMAT OPTIONS */
    formatOptions: {
        endOfLine: "auto",
        tabWidth: 4,
    },
};

run(options, {}, {});
