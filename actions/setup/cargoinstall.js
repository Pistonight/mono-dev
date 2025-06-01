import fs from "node:fs";
import child_process from "node:child_process";
import os from "node:os";

const {
    MONODEV_CARGO_IS_BINSTALL,
    MONODEV_CARGO_INSTALL_CONFIG,
} = process.env;

// [crate, { cli, git?: string }][]
const cargoInstallConfigs = JSON.parse(MONODEV_CARGO_INSTALL_CONFIG);
console.log(cargoInstallConfigs);
const isBinstall = `${MONODEV_CARGO_IS_BINSTALL}`.toLowerCase() === "true";

const HOME = os.homedir();

const isWindows = process.platform === "win32";
const doInstall = (crate, config) => {
    let { git, cli } = (config || {});
    if (!cli) {
        cli = crate;
    }
    console.log(`installing ${crate}`);
    const args = isBinstall
      ? [
            "binstall", crate, 
            "--no-confirm", 
            "--no-discover-github-token", 
            "--disable-strategies", "compile"
        ]
      : ["install", crate];
    if (git) {
        const [user, repo] = git.split("/" ,2);
        args.push("--git", `https://github.com/${user}/${repo}`);
    }
    const cliReal = `${HOME}/.cargo/bin/${isWindows ? cli + ".exe" : cli}`;
    if (!fs.existsSync(cliReal)) {
        console.log(`${cliReal} not found, forcing the install`);
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
for (const [crate, config] of cargoInstallConfigs) {
    doInstall(crate, config);
}
