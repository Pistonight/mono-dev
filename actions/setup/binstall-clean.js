import fs from "node:fs";

const {
    MONODEV_CARGO_BINSTALL_CONFIG,
} = process.env;
// [crate, { cli, git?: string }][]
const cargoInstallConfigs = JSON.parse(MONODEV_CARGO_BINSTALL_CONFIG);
console.log(cargoInstallConfigs);

const isWindows = process.platform === "win32";
for (const [_, config] of cargoInstallConfigs) {
    const cli = isWindows ? config.cli + ".exe" : config.cli;
    if (fs.existsSync(`~/.cargo/bin/${cli}`)) {
        console.log(`cleaned ${cli}`);
        fs.unlinkSync(cli);
    } else {
        console.log(`${cli} not found, skipping clean`);
    }
}
