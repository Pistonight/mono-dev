const {
    MONODEV_RUST_XPLAT_RUNNER_OS,
    MONODEV_RUST_XPLAT_ARCH,
    MONODEV_RUST_XPLAT_BINARY,
    MONODEV_RUST_XPLAT_BUILD_ARGS
} = process.env;

const build_args = [
    `--bin`, 
    `"${MONODEV_RUST_XPLAT_BINARY}"`,
    "--release",
];
if (MONODEV_RUST_XPLAT_RUNNER_OS === "macOS") {
    if (MONODEV_RUST_XPLAT_ARCH === "x64") {
        build_args.push("--target", "x86_64-apple-darwin");
    } else if (MONODEV_RUST_XPLAT_ARCH === "arm64") {
        build_args.push("--target", "aarch64-apple-darwin");
    }
}
build_args.push(...MONODEV_RUST_XPLAT_BUILD_ARGS);

require("node:fs").appendFileSync(
    process.env.GITHUB_OUTPUT,
    `cargo_build_args=${build_args.join(" ")}\n`
);
