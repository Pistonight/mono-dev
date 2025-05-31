const {
    MONODEV_CARGO_BINSTALL_CONFIG,
} = process.env;
const childProcess = require("node:child_process");

// [crate, { git?: string }][]
const cargoInstallConfigs = JSON.parse(MONODEV_CARGO_BINSTALL_CONFIG);
console.log(cargoInstallConfigs);
const runCargobinstall = (crate, git) => {
    console.log(`installing ${crate}`);
    const args = ["binstall", crate, "--no-confirm", "--no-discover-github-token"];
    if (git) {
        args.push("--git", git);
    }

    let child;
    if (process.platform === "win32") {
        child = childProcess.spawnSync(`"cargo.exe"`, args, { stdio: "inherit", shell: true });
    } else {
        child = childProcess.spawnSync("cargo", args, { stdio: "inherit" });
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
    runCargobinstall(crate, config.git);
}
