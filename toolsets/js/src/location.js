import fs from "node:fs";
import path from "node:path";

export const pathCurrent = path.resolve(".");
// we are at mono-dev/toolsets/js/src
export const monodev_path =
path.dirname(path.dirname(path.dirname(import.meta.dirname)));

export const monodev_bin_path = path.join(
    monodev_path,
    "node_modules",
    ".bin",
);

export const get_package_json_path = () => {
    let curr = path.resolve(".");
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
        fs.readFileSync(`${monodev_path}/package.json`, "utf-8"),
    ).version.trim()
}
