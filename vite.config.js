// for some reason .ts imports works even when the file is .js
// which is good, lol
import { configure } from "./src/config/configure_lib_build.ts";

export default configure({
    build: {
        rolldownOptions: {
            output: {
                // generate files without hash to minimize diffs
                // when publishing through git
                chunkFileNames: () => {
                    // if (facadeModuleId?.includes("shikijs") || moduleIds.some((x) => x.includes("shikijs"))) {
                    //     return "deps/shikijs/[name].js";
                    // }
                    return "[name].js";
                },
            },
        },
    },
    test: {
        passWithNoTests: true,
    },
});
