import fs from "node:fs";
import path from "node:path";

export const pathCurrent = path.resolve(".");
// we are at mono-dev/toolsets/js/src
export const pathMonodev =
path.dirname(path.dirname(path.dirname(import.meta.dirname)));
// if current path is mono-dev/toolsets, then we are inside mono-dev repo,
// so root is the mono-dev repo.
// Otherwise, expect mono-dev to be linked as a dependency
// inside node_modules
    // path.basename(pathCurrent) === "toolsets" &&
    // path.basename(path.dirname(pathCurrent)) === "mono-dev"
    //     ? path.dirname(pathCurrent)
    //     : "./node_modules/mono-dev";
export const pathMonodevBin = path.join(
    pathMonodev,
    "node_modules",
    ".bin",
);

export const get_package_json_path = () => {
    let curr = pathCurrent;
    let currJson = path.join(curr, "package.json");
    while (!fs.existsSync(currJson)) {
        const nextCurr = path.dirname(curr);
        if (!nextCurr || nextCurr === curr) {
            return "package.json"; // no package.json found, assuming current directory
        }
        curr = nextCurr;
        currJson = path.join(curr, "package.json");
    }
    return currJson;
};

export const get_monodev_version = () => {
    return JSON.parse(
        fs.readFileSync(`${pathMonodev}/package.json`, "utf-8"),
    ).version.trim()
}
