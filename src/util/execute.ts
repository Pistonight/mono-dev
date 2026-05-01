import fs from "node:fs";
import path from "node:path";
import child_process from "node:child_process";

import { getProjectPackageJsonPath, MONO_DEV_BIN_PATH } from "./misc.ts";
import { errstr, type Void } from "./result.ts";

export const executeShim = (bin: string): never => {
    const args = process.argv.slice(2);
    const child = spawnNodeBinaryFromMonodev(bin, path.dirname(getProjectPackageJsonPath()), args);
    process.exit(child.status ?? 0);
};

/** execute binary from node_modules */
export const executeNode = (bin: string, cwd: string, args: string[]): Void<string> => {
    return handleChild(bin, spawnNodeBinaryFromMonodev(bin, cwd, args));
};

const spawnNodeBinaryFromMonodev = (bin: string, cwd: string, args: string[]) => {
    if (process.platform === "win32") {
        bin += ".cmd";
    }
    const binPath = path.join(MONO_DEV_BIN_PATH, bin);
    if (process.platform === "win32") {
        return child_process.spawnSync(`"${binPath}"`, args, {
            stdio: "inherit",
            cwd,
            shell: true,
        });
    } else {
        return child_process.spawnSync(binPath, args, { cwd, stdio: "inherit" });
    }
};

/** execute native binary on the system */
export const executeNative = async (
    bin: string,
    cwd: string,
    args: string[],
): Promise<Void<string>> => {
    const originalBin = bin;
    if (process.platform === "win32" && !bin.toLowerCase().endsWith(".exe")) {
        bin += ".exe";
    }
    if (fs.existsSync(bin)) {
        // if bin exists in the current directory, it's likely not what
        // we want to execute, so we find it in path
        const { default: which } = await import("which");
        try {
            bin = await which(bin);
        } catch {
            // try .cmd
            if (process.platform === "win32") {
                try {
                    bin = await which(originalBin + ".cmd");
                } catch {
                    return { err: `executable ${bin} not found on the system!` };
                }
            } else {
                return { err: `executable ${bin} not found on the system!` };
            }
        }
    }
    return executeNativeRaw(bin, cwd, args);
};

export const executeNativeRaw = async (
    bin: string,
    cwd: string,
    args: string[],
): Promise<Void<string>> => {
    if (process.platform === "win32" && bin.endsWith(".cmd")) {
        const child = child_process.spawnSync(`"${bin}"`, args, {
            stdio: "inherit",
            cwd,
            shell: true,
        });
        return handleChild(bin, child);
    } else {
        const child = child_process.spawnSync(bin, args, { cwd, stdio: "inherit" });
        return handleChild(bin, child);
    }
};

const handleChild = (
    bin: string,
    child: ReturnType<typeof child_process.spawnSync>,
): Void<string> => {
    // for some reason node doesn't throw here...
    // so we have to check the error manually
    if (child.error) {
        return { err: `spawn failed: ${errstr(child.error)}` };
    }
    if (child.status) {
        return { err: `'${bin}' exited with status: ${child.status}` };
    }
    return {};
};
