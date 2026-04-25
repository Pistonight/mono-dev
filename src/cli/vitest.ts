import path from "node:path";
import fs from "node:fs";

import { checkMonodevVersion, genPackageConfig, genTypeScriptConfig } from "#config";
import { executeNode, getProjectLocations, type PackageJson } from "#util";

export const runTest = async (args: string[]): Promise<number> => {
    const { packageJsonPath, rootDir, cacheDir } = getProjectLocations();
    checkMonodevVersion(cacheDir);
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    await genPackageConfig(packageJson, packageJsonPath);
    await genTypeScriptConfig(packageJson);
    const configPath = path.join(cacheDir, "vitest.config.js");
    fs.writeFileSync(
        configPath,
        `import { configure } from "mono-dev/test-config"; export default configure();`,
    );

    const result = executeNode("vitest", rootDir, ["--config", configPath, ...args]);
    if (result.err) {
        return 1;
    }
    return 0;
};
