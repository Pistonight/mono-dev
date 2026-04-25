import { configure } from "../src/config/configure_lib_build.ts";
import { runBuild } from "../src/cli/build.ts";

const config = configure();
const external: string[] = (config.build?.rolldownOptions?.external as string[]) || [];
const define = (config.define as Record<string, string>) || {};

// first just build the configuration for building a library
console.log("bootstrap: generating lib-build-config");
await Bun.build({
    entrypoints: ["src/config/configure_lib_build.ts"],
    target: "node",
    external,
    define,
    outdir: "dist/config"
});

// then we can run build for ourself
console.log("bootstrap: running vite build with bun");
await runBuild([]);


