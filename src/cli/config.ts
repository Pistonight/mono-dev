import path from "node:path";
import fs from "node:fs";

import { checkMonodevVersion, genPackageConfig, genTypeScriptConfig } from "#config";
import { getProjectLocations, normalizeLineEnds, PackageJson } from "#util";

export const runConfig = async (_args: string[]): Promise<number> => {
    const { packageJsonPath, rootDir, cacheDir } = getProjectLocations();
    checkMonodevVersion(cacheDir);
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    await genPackageConfig(packageJson, packageJsonPath);
    const ts = await genTypeScriptConfig(packageJson);

    if (ts.projectCount) {
        // eslint config is emitted to root to let eslint-lsp access it
        const eslintPath = path.join(rootDir, "eslint.config.js");
        const config = `import { configure } from "mono-dev/eslint-config"; export default configure();`;
        fs.writeFileSync(eslintPath, normalizeLineEnds(config));
    } else {
        console.log("[mono] not generating eslint config because no typescript directories exist");
    }

    console.log("[mono] config generated");
    return 0;
}
