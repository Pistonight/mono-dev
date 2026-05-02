// for some reason .ts imports works even when the file is .js
// which is good, lol
import { configure } from "./src/config/configure_lib_build.ts";

export default configure({
    build: {
        rolldownOptions: {
            external: ["node:fs", "node:path", "path", "node:fs/promises", "node:child_process"],
        },
    },
    test: {
        passWithNoTests: true,
    },
});
