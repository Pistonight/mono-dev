import { ensureSubpathImports } from "#project";
import { PackageJson, Void } from "#util";

export const genPackageConfig = async (packageJson: PackageJson, packageJsonPath: string): Promise<Void<string>> => {
    if (!packageJson.private) {
        return { err: "'private' must be set to true to prevent accidental publishing; to pack for publishing please use mono publish" };
    }
    return await ensureSubpathImports(packageJson, packageJsonPath);
}
