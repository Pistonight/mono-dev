import path from "node:path";
import child_process from "node:child_process";
import { monodev_bin_path } from "./location.js";

/**
 * @param {string}   bin
 * @param {string[]} args
 */
export const execute = (bin, args) => {
    if (process.platform === "win32") {
        bin += ".cmd";
    }

    const binPath = path.join(monodev_bin_path, bin);

    // execution is not parallel because:
    // 1. it's very annoying to do that in node
    // 2. multiple projects can run at the same time (external parallellism)
    let child;
    if (process.platform === "win32") {
        child = child_process.spawnSync(`"${binPath}"`, args, {
            stdio: "inherit",
            shell: true,
        });
    } else {
        child = child_process.spawnSync(binPath, args, { stdio: "inherit" });
    }
    // for some reason node doesn't throw here...
    // so we have to check the error manually
    if (child.error) {
        console.error(`[mono-dev] failed to spawn ${bin} with args ${args.join(" ")}`);
        console.error(child.error);
        if (!child.status) {
            child.status = 1;
        }
    }
    return child;
}
