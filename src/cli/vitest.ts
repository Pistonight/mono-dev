import fs from "node:fs";

import {
    checkMonodevVersion,
    genPackageConfig,
    genTypeScriptConfig,
    resolveViteLibConfig,
} from "#config";
import { executeNode, getProjectLocations, logError, logInfo, type PackageJson } from "#util";

export const runTest = async (args: string[]): Promise<number> => {
    const { packageJsonPath, rootDir, cacheDir } = getProjectLocations();
    checkMonodevVersion(cacheDir);
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    const packageResult = await genPackageConfig(packageJson, packageJsonPath);
    if ("err" in packageResult) {
        logError("failed to config package: " + packageResult.err);
        return 1;
    }
    await genTypeScriptConfig(packageJson);

    const viteConfigPath = resolveViteLibConfig(cacheDir, rootDir);
    if (!viteConfigPath) {
        logInfo("using vite config from project root directly");
    }

    const result = viteConfigPath
        ? executeNode("vitest", rootDir, ["--config", viteConfigPath, ...args])
        : executeNode("vitest", rootDir, args);
    if (result.err) {
        return 1;
    }
    return 0;
};
