import fs from "node:fs";
import child_process from "node:child_process";
import os from "node:os";

const {
    MONODEV_CARGO_IS_BINSTALL,
    MONODEV_CARGO_INSTALL_CONFIG,
} = process.env;

// type Config = {
//     // binary name
//     bin: string,
//     // crate name, default is the same as the binary name
//     crate?: string,
//     // git source
//     git?: string,
//     // specific git rev to use, ignored if git not present
//     rev?: string,
//     // specific version to use
//     version?: string
// }
// Config[]
const cargoInstallConfigs = JSON.parse(MONODEV_CARGO_INSTALL_CONFIG);
console.log(cargoInstallConfigs);
const isBinstall = `${MONODEV_CARGO_IS_BINSTALL}`.toLowerCase() === "true";

const HOME = os.homedir();

const isWindows = process.platform === "win32";
const doInstall = (config) => {
    let { bin, crate, git, rev, version } = (config || {});
    if (isBinstall && rev) {
        throw new Error("binstall does not supported --git --rev, please, specify a package version instead");
    }
    if (!crate) {
        crate = bin;
    }
    const crateArg = version ? `${crate}@${version}` : crate;
    console.log(`installing ${crateArg}`);
    const args = isBinstall
      ? [
            "binstall", crateArg, 
            "--bin", bin,
            "--no-confirm", 
            "--no-discover-github-token", 
            "--disable-strategies", "compile"
        ]
      : ["install", crateArg, "--bin", bin];
    if (git) {
        const [user, repo] = git.split("/" ,2);
        args.push("--git", `https://github.com/${user}/${repo}`);
        if (rev) {
            args.push("--rev", rev);
        }
    }
    const binReal = `${HOME}/.cargo/bin/${isWindows ? bin + ".exe" : bin}`;
    if (!fs.existsSync(binReal)) {
        console.log(`${binReal} not found, forcing the install`);
        args.push("--force");
    }

    let child;
    if (process.platform === "win32") {
        child = child_process.spawnSync(`"cargo.exe"`, args, { stdio: "inherit", shell: true });
    } else {
        child = child_process.spawnSync("cargo", args, { stdio: "inherit" });
    }
    if (child.error) {
        console.error(`Error installing ${crate}: failed to spawn cargo`);
        throw child.error;
    }
    if (child.status !== 0) {
        console.error(`Error installing ${crate}: cargo exited with code ${child.status}`);
        throw new Error(`cargo exited with code ${child.status}`);
    }
};
for (const config of cargoInstallConfigs) {
    doInstall(config);
}
