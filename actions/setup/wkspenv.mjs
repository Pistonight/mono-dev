import fs from "node:fs";
import path from "node:path";

const { MONODEV_WORKSPACE, MONODEV_INPUT_MONO_DEV } = process.env;

let mono_dev_ref = MONODEV_INPUT_MONO_DEV;
let mono_dev_install = "checkout";

if (MONODEV_INPUT_MONO_DEV === "auto") {
    if (fs.existsSync(path.resolve(MONODEV_WORKSPACE, "pnpm-lock.yaml"))) {
        mono_dev_install = "pnpm";
    } else {
        mono_dev_ref = "main";
    }
} else if (MONODEV_INPUT_MONO_DEV === "false") {
    mono_dev_install = "none";
} else if (MONODEV_INPUT_MONO_DEV === "true") {
    mono_dev_ref = "main";
}

writeGitHubOutput({
    mono_dev_install,
    mono_dev_ref,
});
