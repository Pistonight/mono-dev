import fs from "node:fs";

import { getMonodevVersion } from "#util";

export const checkMonodevVersion = (cacheDir: string) => {
    const currentVersion = getMonodevVersion();
    if (!currentVersion) {
        // in bootstrap we don't have the version
        return;
    }
    // using sync operations here so they are less likely to fail, and when they do,
    // it's possible to catch them
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
        fs.writeFileSync(`${cacheDir}/version`, currentVersion);
    } else {
        let clean = false;
        // check if mono-dev version was bumped
        try {
            const version = fs.readFileSync(`${cacheDir}/version`, "utf-8").trim();
            if (version !== currentVersion) {
                console.log(
                    `[mono] cleaning cache because of version update: ${version} -> ${currentVersion}`,
                );
                clean = true;
            }
        } catch {
            clean = true;
        }
        if (clean) {
            fs.rmSync(cacheDir, { recursive: true });
            fs.mkdirSync(cacheDir, { recursive: true });
            // this can fail for some reason
            try {
                fs.writeFileSync(`${cacheDir}/version`, currentVersion);
            } catch {
                console.error("[mono] failed to write version file, will retry next time");
            }
        }
    }
};
