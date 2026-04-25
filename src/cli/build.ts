import path from "node:path";
import fs from "node:fs";

import { checkMonodevVersion, genPackageConfig, genTypeScriptConfig } from "#config";
import { DTS, executeNode, getProjectLocations, normalizeLineEnds, PackageJson, stringifySorted } from "#util";
import { parseExports } from "#project";

export const runBuild = async (_args: string[]): Promise<number> => {
    const { packageJsonPath, rootDir, cacheDir } = getProjectLocations();
    checkMonodevVersion(cacheDir);
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    if (!packageJson["pistonight/mono-dev"]?.lib) {
        console.error("[mono] package.json mono dev option 'lib' must be true to build library");
        return 1;
    }

    const libExports = parseExports(rootDir, packageJson, true /* print */);
    if ("err" in libExports) {
        console.error(`[mono] failed to parse exports: `+libExports.err);
        return 1;
    }
    const { dist, src } = libExports.val;

    await genPackageConfig(packageJson, packageJsonPath);
    await genTypeScriptConfig(packageJson);

    const vite_config_path = path.join(cacheDir, "lib-build.config.js");
    fs.writeFileSync(
        vite_config_path,
        `import { configure } from "mono-dev/lib-build-config"; export default configure();`,
    );

    const tsconfigPath = path.join(rootDir, "tsconfig." + src + ".json");
    const theConfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));

    const tsbuildinfo = `${cacheDir}/tsconfig.${src}__${DTS}.tsbuildinfo`;
    // if we don't delete the incremental build file, tsc will not emit the output
    // if no rebuild is needed (even if the output is gone because we clean it before building)
    // -- truly amazing behavior
    if (fs.existsSync(tsbuildinfo)) {
        fs.unlinkSync(tsbuildinfo);
    }

    theConfig.compilerOptions.tsBuildInfoFile = tsbuildinfo;
    theConfig.compilerOptions.noEmit = false;
    theConfig.compilerOptions.outDir = path.join(dist, DTS);
    theConfig.exclude = ["**/*.test.ts", "**/*.test.mts", "**/*.test.cts", "**/*.test.tsx"];
    const tsconfigModifiedPath = path.join(rootDir, "tsconfig." + src + "__" + DTS + ".json");
    fs.writeFileSync(tsconfigModifiedPath, normalizeLineEnds(stringifySorted(theConfig)||""));

    const viteResult = executeNode("vite", ["build", "--config", vite_config_path]);
    if ("err" in viteResult) {
        console.error("[mono] bundle with vite failed: "+viteResult.err);
        return 21;
    }

    console.log("[mono] generating dts...");
    const dtsStartTime = Date.now();
    const tscResult = executeNode("tsc", ["-p", tsconfigModifiedPath]);
    if ("err" in tscResult) {
        console.error("[mono] dts generation with tsc failed: "+tscResult.err);
        return 31;
    }
    const dtsTime = Math.floor(Date.now() - dtsStartTime);
    console.log(`[mono] dts generated at ${dist}/${DTS} (${dtsTime}ms)`);

    return 0;
}
