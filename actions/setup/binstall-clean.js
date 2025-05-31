import fs from "node:fs";

const {
    MONODEV_CARGO_BINSTALL_CONFIG,
} = process.env;
// [crate, { cli, git?: string }][]
const cargoInstallConfigs = JSON.parse(MONODEV_CARGO_BINSTALL_CONFIG);
console.log(cargoInstallConfigs);

for (const [_, config] of cargoInstallConfigs) {
    const cli = config.cli;
    if (fs.existsSync(cli)) {
        console.log(`cleaned ${cli}`);
        fs.unlinkSync(cli);
    } else {
        console.log(`${cli} not found, skipping clean`);
    }
}
