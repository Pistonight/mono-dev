import fs from "node:fs";
import child_process from "node:child_process";
import crypto from "node:crypto";
import path from "node:path";
import os from "node:os";

const isWindows = process.platform === "win32";

const {
    MONODEV_CARGO_INSTALL_CONFIG,
    MONODEV_CARGO_BINSTALL_CONFIG
} = process.env;
const hash = crypto.createHash("sha256");
hash.update(MONODEV_CARGO_INSTALL_CONFIG || "");
hash.update(MONODEV_CARGO_BINSTALL_CONFIG || "");
const result = child_process.spawnSync("cargo", ["--version"], { encoding: "utf-8" });
const cargo_version = result.stdout.trim();
console.log("cargo version: " + cargo_version);
hash.update(cargo_version);
const cache_key = hash.digest("hex");
console.log("cargo install cache key: " + cache_key);

const cargoInstallConfigs = JSON.parse(MONODEV_CARGO_INSTALL_CONFIG);
console.log(cargoInstallConfigs);
const cargoBInstallConfigs = JSON.parse(MONODEV_CARGO_BINSTALL_CONFIG);
console.log(cargoBInstallConfigs);

const HOME = os.homedir();

const paths = [];
const addPathFromConfig = (config) => {
    let { bin, crate } = config || {};
    if (isWindows) {
        paths.push(path.resolve(HOME, ".cargo", "bin", (bin || crate) + ".exe"));
    } else {
        paths.push(path.resolve(HOME, ".cargo", "bin", bin || crate));
    }
}
for (const config of cargoInstallConfigs) {
    addPathFromConfig(config);
}
for (const config of cargoBInstallConfigs) {
    addPathFromConfig(config);
}
const cache_path = paths.join("\n");

const output = {
    cache_key,
    cache_path,
};
const outputString = Object.entries(output)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
console.log("Output:");
console.log(outputString);
fs.appendFileSync(process.env.GITHUB_OUTPUT, outputString + "\n", "utf8");
