import fs from "node:fs";
import child_process from "node:child_process";

const {
    MONODEV_CARGO_BINSTALL_CONFIG,
} = process.env;

// [crate, { cli, git?: string }][]
const cargoInstallConfigs = JSON.parse(MONODEV_CARGO_BINSTALL_CONFIG);
console.log(cargoInstallConfigs);

const isWindows = process.platform === "win32";
const runCargobinstall = (crate, config) => {
    const { git, cli } = (config || {});
    console.log(`installing ${crate}`);
    const args = ["binstall", crate, "--no-confirm", "--no-discover-github-token"];
    if (git) {
        args.push("--git", git);
    }
    const cliReal = `~/.cargo/bin/${isWindows ? cli + ".exe" : cli}`;
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
    runCargobinstall(crate, config);
}
