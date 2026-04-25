import path from "node:path";
import fs from "node:fs";

import { checkMonodevVersion } from "#config";
import { getProjectLocations, PackageJson } from "#util";

export const runCheck = async (_args: string[]): Promise<number> => {
    const { packageJsonPath, rootDir, cacheDir } = getProjectLocations();
    checkMonodevVersion(cacheDir);
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    return 0;
}
