import path from "node:path";
import fs from "node:fs";

import {
    DTS,
    getProjectLocations,
    normalizeLineEnds,
    type PackageJson,
    executeNative,
    SRC,
    DIST,
    logError,
    logInfo,
    logWarn,
} from "#util";
import { parseExports } from "#project";

export const runPublish = async (args: string[]): Promise<number> => {
    const dryRun = args.includes("-n") || args.includes("--dry-run");

    const { rootDir, packageJsonPath: originalPackageJsonPath, cacheDir } = getProjectLocations();
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }
    const tempTar = path.join(cacheDir, "pnpm-pack.temp.tgz");

    const r = await executeNative("pnpm", rootDir, ["pack", "--out", tempTar]);
    if (r.err) {
        logError("pnpm pack failed!");
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
        logError("tgz extract failed!");
        return 91;
    }

    const packageJsonPath = path.join(tempDir, "package", "package.json");
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const originalPackageJson: PackageJson = JSON.parse(
        fs.readFileSync(originalPackageJsonPath, "utf8"),
    );
    const allowPublish = !!packageJson["pistonight/mono-dev"]?.publish;

    delete packageJson["pistonight/mono-dev"];
    delete packageJson.private;

    const libExports = parseExports(rootDir, originalPackageJson);
    if ("err" in libExports) {
        logError("failed to parse exports: " + libExports.err);
        return 1;
    }

    // change compiled exports to {
    //   import: dist.js
    //   types: dts
    // }
    if (packageJson.exports) {
        if (typeof packageJson.exports === "string") {
            logError("failed to parse exports: 'exports' field must be an object");
            return 1;
        }
        const compile = packageJson["pistonight/mono-dev"]?.compile || {};
        for (const { entryName, distPathRel, distDtsPathRel } of libExports.val.exports) {
            const key = entryName === "." ? "." : "./" + entryName;
            if (key in compile) {
                // skip the manually-configured to compile ones, since the exports
                // should already be correct
                continue;
            }
            packageJson.exports[key] = {
                import: "./" + DIST + "/" + distPathRel,
                types: "./" + DIST + "/" + distDtsPathRel,
            };
        }
    }

    // change imports to .d.ts
    if (packageJson.imports) {
        for (const key in packageJson.imports) {
            if (!key.startsWith("#")) {
                continue;
            }
            const value = packageJson.imports[key];
            if (!value.startsWith("./" + SRC)) {
                continue;
            }
            if (!value.match(/\.(c|m)?tsx?$/)) {
                continue;
            }
            const lastDot = value.lastIndexOf(".");
            const base = value.substring(2, lastDot);
            const mapped = "./" + DIST + "/" + DTS + "/" + base + ".d.ts";
            packageJson.imports[key] = mapped;
        }
    }

    // add dist/**/* to files
    let shouldAddDistToFiles = true;
    if (packageJson.files) {
        for (const f in packageJson.files) {
            if (f.startsWith("dist")) {
                logWarn("not adding 'dist/**/*' to files since there are dist paths specified in original package.json");
                shouldAddDistToFiles = false;
                break;
            }
        }
    }
    if (shouldAddDistToFiles) {
        logInfo("adding 'dist/**/*' to files in package.json");
        if (packageJson.files) {
            packageJson.files.push("dist/**/*");
        } else {
            packageJson.files = ["dist/**/*"];
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
        logError("tgz creation failed!");
        return 91;
    }

    logInfo("unpacked at: node_modules/.mono/pnpm-pack.temp/package");
    logInfo("packed at: " + outTar);
    if (dryRun) {
        logInfo("dry-run, stopping");
        return 0;
    }
    if (!allowPublish) {
        logError('please set mono-dev option "publish": true');
        return 1;
    }

    const publishResult = await executeNative("pnpm", rootDir, [
        "publish",
        outTar,
        "--access",
        "public",
    ]);
    if (publishResult.err) {
        logError("pnpm publish failed!");
        return 101;
    }

    return 0;
};
