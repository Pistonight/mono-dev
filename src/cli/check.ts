import path from "node:path";
import fs from "node:fs";
import child_process from "node:child_process";

import {
    checkMonodevVersion,
    genEslintConfig,
    genPackageConfig,
    genPrettierConfig,
    genTypeScriptConfig,
} from "#config";
import {
    executeNode,
    getProjectLocations,
    logError,
    logInfo,
    logWarn,
    MONO_DEV_PATH,
    type PackageJson,
} from "#util";

export const runCheck = async (args: string[]): Promise<number> => {
    const { packageJsonPath, rootDir, cacheDir } = getProjectLocations();
    checkMonodevVersion(cacheDir);
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    const result = await genPackageConfig(packageJson, packageJsonPath);
    if ("err" in result) {
        logError(`failed to config package: ` + result.err);
        return 1;
    }
    const ts = await genTypeScriptConfig(packageJson);
    if (ts.projectCount) {
        genEslintConfig(rootDir);
    }
    genPrettierConfig(packageJson, rootDir);

    const useTsc = !!packageJson["pistonight/mono-dev"]?.tsc;

    const fix = args.includes("--fix") || args.includes("-f");
    if (fix) {
        if (!runEslint(rootDir, cacheDir, fix)) {
            return 41;
        }
        if (!runPrettier(rootDir, cacheDir, fix)) {
            return 51;
        }
        if (!runTypeck(rootDir, useTsc)) {
            return 31;
        }
    } else {
        if (!runTypeck(rootDir, useTsc)) {
            return 31;
        }
        if (!runEslint(rootDir, cacheDir, fix)) {
            return 41;
        }
        if (!runPrettier(rootDir, cacheDir, fix)) {
            return 51;
        }
    }

    return 0;
};

const runTypeck = (rootDir: string, useTsc: boolean): boolean => {
    const tscStartTime = Date.now();
    const bin = useTsc ? "tsc" : "tsgo";
    if (useTsc) {
        logWarn("warning: using tsc instead of tsgo for typeck");
    }
    const tscResult = executeNode(bin, rootDir, ["--build", "--pretty"]);
    if ("err" in tscResult) {
        logError("typeck failed!");
        return false;
    }
    const tscTime = Math.floor(Date.now() - tscStartTime);
    logInfo(`typeck passed (${tscTime}ms)`);
    return true;
};

const runEslint = (rootDir: string, cacheDir: string, fix: boolean): boolean => {
    const args = [
        ".",
        "--color",
        "--report-unused-disable-directives",
        "--max-warnings=0",
        "--cache",
        "--cache-location",
        path.join(cacheDir, ".eslint-cache"),
    ];
    if (fix) {
        args.push("--fix");
    }
    const eslintStartTime = Date.now();
    const eslintResult = executeNode("eslint", rootDir, args);
    if ("err" in eslintResult) {
        logError("eslint failed!");
        return false;
    }
    const eslintTime = Math.floor(Date.now() - eslintStartTime);
    logInfo(`eslint passed (${eslintTime}ms)`);
    return true;
};

const runPrettier = (rootDir: string, cacheDir: string, fix: boolean) => {
    const ignorePath = path.join(rootDir, ".prettierignore");
    const cachePath = path.join(cacheDir, ".prettier-cache");
    const prettierWrapper = path.join(MONO_DEV_PATH, "bin", "prettier-wrapper.js");
    const prettierStartTime = Date.now();

    const child = child_process.spawnSync(
        process.argv[0],
        [prettierWrapper, ignorePath, cachePath, fix ? "-f" : "-c"],
        { cwd: rootDir, stdio: "pipe" },
    );
    if (child.error) {
        logError("failed to spawn prettier: " + child.error);
        return false;
    }
    if (child.status) {
        const text = child.stderr.toString("utf-8").trim();
        console.warn(
            text
                .split("\n")
                .map((x) => {
                    if (x.startsWith("[warn]")) {
                        x = x.substring(6);
                    }
                    return x.replace("Run Prettier with --write to fix.", "").trimEnd();
                })
                .join("\n"),
        );
        logError("prettier failed!");
        return false;
    }
    const prettierTime = Math.floor(Date.now() - prettierStartTime);
    logInfo(`prettier passed (${prettierTime}ms)`);
    return true;
};
