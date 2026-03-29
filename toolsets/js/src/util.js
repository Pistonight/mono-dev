/**
 * @param {import("./types.ts").PackageJson} package_json
 * @param {string} dep
 */
export const has_dependency = (package_json, dep) => {
    if (package_json.dependencies && dep in package_json.dependencies) {
        return true;
    }
    if (package_json.devDependencies && dep in package_json.devDependencies) {
        return true;
    }
    if (package_json.peerDependencies && dep in package_json.peerDependencies) {
        return true;
    }
    if (package_json.optionalDependencies && dep in package_json.optionalDependencies) {
        return true;
    }
    if (package_json.bundledDependencies && dep in package_json.bundledDependencies) {
        return true;
    }
    return false;
}

/** @param {string} content */
export const normalize_lineend = (content) => {
    return content.split("\r").map((x) => x.trimEnd()).join("\n");
}
