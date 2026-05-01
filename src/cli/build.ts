import path from "node:path";
import fs from "node:fs";

import { checkMonodevVersion, genPackageConfig, genTypeScriptConfig } from "#config";
import {
    DTS,
    executeNode,
    getProjectLocations,
    normalizeLineEnds,
    type PackageJson,
    stringifySorted,
    SRC,
    DIST,
    logError,
    logInfo,
    logWarn,
} from "#util";
import { parseExports } from "#project";

export const runBuild = async (_args: string[]): Promise<number> => {
    const { packageJsonPath, rootDir, cacheDir } = getProjectLocations();
    checkMonodevVersion(cacheDir);
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    if (!packageJson["pistonight/mono-dev"]?.lib) {
        logError("package.json mono dev option 'lib' must be true to build library");
        return 1;
    }

    const result = await genPackageConfig(packageJson, packageJsonPath);
    if ("err" in result) {
        logError("failed to config package: " + result.err);
        return 1;
    }
    await genTypeScriptConfig(packageJson);

    const libExports = parseExports(rootDir, packageJson, true /* print */);
    if ("err" in libExports) {
        logError(`failed to parse exports: ` + libExports.err);
        return 1;
    }

    const vite_config_path = path.join(cacheDir, "lib-build.config.js");
    fs.writeFileSync(
        vite_config_path,
        `import { configure } from "mono-dev/lib-build-config"; export default configure();`,
    );

    const tsconfigPath = path.join(rootDir, "tsconfig." + SRC + ".json");
    const theConfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));

    const tsbuildinfo = `${cacheDir}/tsconfig.${SRC}__${DTS}.tsbuildinfo`;
    // if we don't delete the incremental build file, tsc will not emit the output
    // if no rebuild is needed (even if the output is gone because we clean it before building)
    // -- truly amazing behavior
    if (fs.existsSync(tsbuildinfo)) {
        fs.unlinkSync(tsbuildinfo);
    }

    theConfig.compilerOptions.tsBuildInfoFile = tsbuildinfo;
    theConfig.compilerOptions.noEmit = false;
    theConfig.compilerOptions.outDir = path.join(DIST, DTS);
    theConfig.exclude = ["**/*.test.ts", "**/*.test.mts", "**/*.test.cts", "**/*.test.tsx"];
    const tsconfigModifiedPath = path.join(rootDir, "tsconfig." + SRC + "__" + DTS + ".json");
    fs.writeFileSync(tsconfigModifiedPath, normalizeLineEnds(stringifySorted(theConfig) || ""));

    const viteResult = executeNode("vite", rootDir, ["build", "--config", vite_config_path]);
    if ("err" in viteResult) {
        logError("bundle with vite failed: " + viteResult.err);
        return 21;
    }

    logInfo("generating dts...");
    const dtsStartTime = Date.now();
    const useTsc = !!packageJson["pistonight/mono-dev"]?.tsc;
    const tscBin = useTsc ? "tsc" : "tsgo";
    if (useTsc) {
        logWarn("warning: using tsc instead of tsgo for generating declarations");
    }
    const tscResult = executeNode(tscBin, rootDir, ["-p", tsconfigModifiedPath]);
    if ("err" in tscResult) {
        logError("dts generation with tsc failed: " + tscResult.err);
        return 31;
    }
    const dtsTime = Math.floor(Date.now() - dtsStartTime);
    logInfo(`dts generated (${dtsTime}ms)`);

    return 0;
};
