import fs from "node:fs";

const {
    MONODEV_RUNNER_OS,
    MONODEV_RUNNER,
    MONODEV_ECMA_NODE,
    MONODEV_ECMA_PNPM,
    MONODEV_RUST,
    MONODEV_RUST_WASM,
    MONODEV_RUST_NATIVE,
    MONODEV_RUST_SRC,
    MONODEV_TOOL_MDBOOK,
    MONODEV_TOOL_CARGO_BINSTALL,
    MONODEV_GCLOUD,
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
const monodev_rust_native = bool(MONODEV_RUST_NATIVE);
const monodev_rust_src = bool(MONODEV_RUST_SRC);


// NodeJS
const setup_node = (monodev_ecma_node || monodev_ecma_pnpm)
  ? runnerType
  : false;
const node_cache = monodev_ecma_pnpm ? "pnpm" : "";


// Rust
const cargoInstallConfigs = new Map();
// ^ format: crate: { git?: string }

let rust_toolchain = "";
if (MONODEV_RUST === "nightly") {
    const today = new Date();
    today.setUTCDate(-1); // last day of previous month
    today.setUTCDate(1); // first day of previous month
    rust_toolchain = `nightly-${today.toISOString().split("T", 1)[0]}`;
} else if (MONODEV_RUST === "stable") {
    rust_toolchain = "stable";
}
const setup_rust = rust_toolchain ? runnerType : false;
let rust_components = "clippy,rustfmt";
if (monodev_rust_src) {
    rust_components += ",rust-src";
}
let rust_targets = [];
if (monodev_rust_wasm) {
    rust_targets.push("wasm32-unknown-unknown");
    cargoInstallConfigs.set("wasm-pack", {});
}
if (monodev_rust_native) {
    const nativeTargets = monodev_rust_native.split(",").map(t => t.trim().toLowerCase());
    if (nativeTargets.includes("x64")) {
        if (isWindows) {
            rust_targets.push("x86_64-pc-windows-msvc");
        } else if (isLinux) {
            rust_targets.push("x86_64-unknown-linux-gnu");
        } else if (isMacOS) {
            rust_targets.push("x86_64-apple-darwin");
        }
    }
    if (nativeTargets.includes("arm64")) {
        if (isWindows) {
            // we don't support ARM on Windows yet
            // rust_target.push("aarch64-pc-windows-msvc");
        } else if (isLinux) {
            rust_targets.push("aarch64-unknown-linux-gnu");
        } else if (isMacOS) {
            rust_targets.push("aarch64-apple-darwin");
        }
    }
}
if (bool(MONODEV_TOOL_MDBOOK)) {
    cargoInstallConfigs.set("mdbook", {});
    cargoInstallConfigs.set("mdbook-admonish", {});
}
if (MONODEV_TOOL_CARGO_BINSTALL) {
    // format: ,-seprated, crate[=user/repo]
    for (const config of MONODEV_TOOL_CARGO_BINSTALL.split(",").map(part => part.trim())) {
        const [crate, repo] = config.split("=", 2);
        if (repo) {
            cargoInstallConfigs.set(crate, { git: repo });
        } else {
            cargoInstallConfigs.set(crate, {});
        }
    }
}
const setup_cargo_binstall = cargoInstallConfigs.size > 0;
const cargo_binstall_config = JSON.stringify(Array.from(cargoInstallConfigs.entries()));


// GCloud
let setup_gcloud = false;
let gcloud_project_id = "";
let gcloud_workload_identity_provider = "";
if (MONODEV_GCLOUD) {
    setup_gcloud = true;
    for (const part of MONODEV_GCLOUD.split(",").map(part => part.trim())) {
        const [key, value] = part.split("=", 2);
        switch (key.toLowerCase()) {
            case "project_id": {
                gcloud_project_id = value.trim();
                break;
            }
            case "workload_identity_provider": {
                gcloud_workload_identity_provider = value.trim();
                break;
            }
        }
    }
}

const output = {
    setup_node,
    node_cache,

    setup_rust,
    rust_toolchain,
    rust_components,
    rust_targets: rust_targets.join(","),
    setup_cargo_binstall,
    cargo_binstall_config,

    setup_gcloud,
    gcloud_project_id,
    gcloud_workload_identity_provider,
};

const outputString = Object.entries(output).map(([key, value]) => `${key}=${value}`).join("\n");
console.log("Output:");
console.log(outputString);
fs.appendFileSync(process.env.GITHUB_OUTPUT, outputString + "\n", "utf8");
