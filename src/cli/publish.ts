import path from "node:path";
import fs from "node:fs";

import {
    DTS,
    getProjectLocations,
    normalizeLineEnds,
    type PackageJson,
    executeNative,
} from "#util";
import { parseExports } from "#project";

export const runPublish = async (args: string[]): Promise<number> => {
    const dryRun = args.includes("-n") || args.includes("--dry-run");

    const { rootDir, cacheDir } = getProjectLocations();
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }
    const tempTar = path.join(cacheDir, "pnpm-pack.temp.tgz");

    const r = await executeNative("pnpm", rootDir, ["pack", "--out", tempTar]);
    if (r.err) {
        console.error("[mono] pnpm pack failed!");
        return 81;
    }

    // extract the tarball
    const tempDir = path.join(cacheDir, "pnpm-pack.temp");
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, {
            recursive: true,
            force: true,
        });
    }
    fs.mkdirSync(tempDir, { recursive: true });
    const tarXResult = await executeNative("tar", tempDir, ["-xzf", "../pnpm-pack.temp.tgz"]);
    if (tarXResult.err) {
        console.error("[mono] tgz extract failed!");
        return 91;
    }

    const packageJsonPath = path.join(tempDir, "package", "package.json");
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const allowPublish = !!packageJson["pistonight/mono-dev"]?.publish;
    delete packageJson["pistonight/mono-dev"];
    delete packageJson.private;

    const libExports = parseExports(rootDir, packageJson);
    if ("err" in libExports) {
        console.error("[mono] failed to parse exports: " + libExports.err);
        return 1;
    }

    const { dist, src } = libExports.val;

    // change imports to .d.ts
    if (packageJson.imports) {
        for (const key in packageJson.imports) {
            if (!key.startsWith("#")) {
                continue;
            }
            const value = packageJson.imports[key];
            if (!value.startsWith("./" + src)) {
                continue;
            }
            if (!value.match(/\.(c|m)?tsx?$/)) {
                continue;
            }
            const lastDot = value.lastIndexOf(".");
            const base = value.substring(2, lastDot);
            const mapped = "./" + dist + "/" + DTS + "/" + base + ".d.ts";
            packageJson.imports[key] = mapped;
        }
    }

    fs.writeFileSync(packageJsonPath, normalizeLineEnds(JSON.stringify(packageJson, undefined, 2)));

    const outTar = path.join(cacheDir, "pnpm-packed.tgz");
    const tarCResult = await executeNative("tar", cacheDir, [
        "-czf",
        "pnpm-packed.tgz",
        "-C",
        "pnpm-pack.temp",
        "package",
    ]);
    if (tarCResult.err) {
        console.error("[mono] tgz creation failed!");
        return 91;
    }

    console.log("[mono] unpacked at: node_modules/.mono/pnpm-pack.temp/package");
    console.log("[mono] packed at: " + outTar);
    if (dryRun) {
        console.log("[mono] dry-run, stopping");
        return 0;
    }
    if (!allowPublish) {
        console.error('[mono] please set mono-dev option "publish": true');
        return 1;
    }

    const publishResult = await executeNative("pnpm", rootDir, ["publish", "--access", "public"]);
    if (publishResult.err) {
        console.error("[mono] pnpm publish failed!");
        return 101;
    }

    return 0;
};
