import fs from "node:fs";

const {
    MONODEV_RUNNER_OS,
    MONODEV_RUNNER_ARCH,
    MONODEV_RUNNER,
    MONODEV_ECMA_NODE,
    MONODEV_ECMA_PNPM,
    MONODEV_RUST,
    MONODEV_RUST_WASM,
    MONODEV_RUST_NATIVE,
    MONODEV_RUST_SRC,
    MONODEV_TOOL_MDBOOK,
    MONODEV_TOOL_CARGO_BINSTALL,
    MONODEV_TOOL_CARGO_INSTALL,
} = process.env;

const bool = (value) => {
    if (typeof value === "string") {
        return value.toLowerCase() === "true";
    }
    return Boolean(value);
};

const isGitHub = MONODEV_RUNNER === "github";
const isWindows = MONODEV_RUNNER_OS === "Windows";
const isLinux = MONODEV_RUNNER_OS === "Linux";
const isMacOS = MONODEV_RUNNER_OS === "macOS";
const runnerType = isGitHub ? "github" : "blacksmith";


const monodev_ecma_node = bool(MONODEV_ECMA_NODE);
const monodev_ecma_pnpm = bool(MONODEV_ECMA_PNPM);
const monodev_rust_wasm = bool(MONODEV_RUST_WASM);
const monodev_rust_src = bool(MONODEV_RUST_SRC);


// NodeJS
const setup_node = (monodev_ecma_node || monodev_ecma_pnpm)
  ? runnerType
  : false;
const node_cache = monodev_ecma_pnpm ? "pnpm" : "";


// Rust
const cargoInstallConfigs = []
const cargoBinaryInstallConfigs = [];

let rust_toolchain = "";
if (MONODEV_RUST === "nightly") {
    const today = new Date();
    today.setUTCDate(-1); // last day of previous month
    today.setUTCDate(1); // first day of previous month
    rust_toolchain = `nightly-${today.toISOString().split("T", 1)[0]}`;
} else if (MONODEV_RUST === "stable") {
    rust_toolchain = "stable";
}

let rust_components = "clippy,rustfmt";
if (monodev_rust_src) {
    rust_components += ",rust-src";
}

if (monodev_rust_wasm) {
    cargoBinaryInstallConfigs.push({ bin: "wasm-pack" });
}
if (bool(MONODEV_TOOL_MDBOOK)) {
    cargoBinaryInstallConfigs.push({ bin: "mdbook", version: "0.4.52" });
    cargoBinaryInstallConfigs.push({ bin: "mdbook-admonish", version: "1.20.0" });
}
const parseCargoInstallConfigOne = (configString) => {
    // format:
    //   CONFIG  := BINARY[=<user>/<repo>[#<rev>]]
    //   BINARY  := CRATE | <binary>(CRATE)
    //   CRATE   := <crate>[@<version>]

    const [binarySpec, repoSpec] = configString.split("=", 2);
    let git = repoSpec?.trim();
    let rev = "";
    if (git) {
        const [userRepoSpec, revSpec] = git.split("#", 2);
        rev = revSpec?.trim() || "";
        git = userRepoSpec;
    }
    let bin = binarySpec;
    let crateSpec = binarySpec;
    if (binarySpec.endsWith(")")) {
        // <binary>(CRATE)
        const [binarySpec2, crateSpec2] = binarySpec.substring(0, binarySpec.length-1).split("(", 2);
        bin = binarySpec2;
        crateSpec = crateSpec2?.trim() || binarySpec2;
    }
    const [crate, versionSpec] = crateSpec.split("@", 2);
    const version = versionSpec?.trim() || "";
    return { bin, crate, git, rev, version };
    
}
const parseCargoInstallConfig = (configString, isBInstall) => {
    for (const config of configString.split(",").map(part => part.trim())) {
        const installConfig = parseCargoInstallConfigOne(config);
        if (isBInstall) {
            cargoBinaryInstallConfigs.push(installConfig);
        } else {
            cargoInstallConfigs.push(installConfig);
        }
    }
}
if (MONODEV_TOOL_CARGO_BINSTALL) {
    parseCargoInstallConfig(MONODEV_TOOL_CARGO_BINSTALL, true);
}
if (MONODEV_TOOL_CARGO_INSTALL) {
    parseCargoInstallConfig(MONODEV_TOOL_CARGO_INSTALL, false);
}
let setup_cargo_binstall = cargoBinaryInstallConfigs.size > 0;
let need_cargo_install = cargoInstallConfigs.size > 0;
const cargo_install_config = JSON.stringify(cargoInstallConfigs.values());
const cargo_binstall_config = JSON.stringify(cargoBinaryInstallConfigs.values());

const rust_targets = new Set();
const addNativeRustTarget = (arch) => {
    if (arch === "x64" || arch === "X64") {
        if (isWindows) {
            rust_targets.add("x86_64-pc-windows-msvc");
        } else if (isLinux) {
            rust_targets.add("x86_64-unknown-linux-gnu");
        } else if (isMacOS) {
            rust_targets.add("x86_64-apple-darwin");
        }
        return;
    }
    if (arch === "arm64" || arch === "ARM64") {
        if (isWindows) {
            rust_targets.add("aarch64-pc-windows-msvc");
        } else if (isLinux) {
            rust_targets.add("aarch64-unknown-linux-gnu");
        } else if (isMacOS) {
            rust_targets.add("aarch64-apple-darwin");
        }
        return;
    }
    throw new Error(`Unsupported architecture for native Rust target: ${arch}`);
}
if (need_cargo_install && !rust_toolchain) {
    console.log("adding rust toolchain because cargo install is needed");
    rust_toolchain = "stable";
    addNativeRustTarget(MONODEV_RUNNER_ARCH);
}
if (monodev_rust_src) {
    console.log("adding native Rust target to build standard library source (rust-src)");
    addNativeRustTarget(MONODEV_RUNNER_ARCH);
}

const setup_rust = rust_toolchain ? runnerType : false;

if (monodev_rust_wasm) {
    rust_targets.add("wasm32-unknown-unknown");
}
let rust_cache_key = "";
if (MONODEV_RUST_NATIVE) {
    const nativeArgs = MONODEV_RUST_NATIVE.split(",").map(t => t.trim().toLowerCase());
    for (const arch of nativeArgs) {
        addNativeRustTarget(arch);
    }
    rust_cache_key = nativeArgs.join(",");
}

const output = {
    setup_node,
    node_cache,

    setup_rust,
    rust_toolchain,
    rust_components,
    rust_targets: Array.from(rust_targets).join(","),
    rust_cache_key,
    setup_cargo_binstall,
    need_cargo_install,
    cargo_install_config,
    cargo_binstall_config,
};

const outputString = Object.entries(output).map(([key, value]) => `${key}=${value}`).join("\n");
console.log("Output:");
console.log(outputString);
fs.appendFileSync(process.env.GITHUB_OUTPUT, outputString + "\n", "utf8");
