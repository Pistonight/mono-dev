import type { PackageJson } from "./types";

export const hasDependency = (packageJson: PackageJson, dep: string) => {
    if (packageJson.dependencies && dep in packageJson.dependencies) {
        return true;
    }
    if (packageJson.devDependencies && dep in packageJson.devDependencies) {
        return true;
    }
    if (packageJson.peerDependencies && dep in packageJson.peerDependencies) {
        return true;
    }
    if (packageJson.optionalDependencies && dep in packageJson.optionalDependencies) {
        return true;
    }
    if (packageJson.bundledDependencies && dep in packageJson.bundledDependencies) {
        return true;
    }
    return false;
};
