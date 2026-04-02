import { defineConfig as vitestDefineConfig } from "vitest/config";
export const configure = () => {
    return vitestDefineConfig({
        test: {
            // include in-source test with import.meta
            includeSource: ["src/**/*.{ts,mts,cts,tsx}"],
        }
    });
}
