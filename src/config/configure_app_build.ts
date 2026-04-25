// import type { UserConfig } from "vite";
// import { defineConfig } from "vite";
//
// import fs from "node:fs";
// import path from "node:path";
// import vitePluginReact, {
//     reactCompilerPreset as viteBabelReactCompilerPreset,
// } from "@vitejs/plugin-react";
// import vitePluginBabel from "@rolldown/plugin-babel";
// import vitePluginWasm from "vite-plugin-wasm";
//
// import vitePluginYaml from "./vite_yaml.js";
// import { has_dependency } from "./util.js";
// import { get_package_json_path } from "./location.js";
// export type MonodevAppBuildConfig = {
//     /**
//      * Look for .cert/cert.key and .cert/cert.pem 2 levels
//      * up from the current directory (including the current directory),
//      * and use them to configure HTTPS for the dev server.
//      */
//     https?: boolean;
//
//     /** Load the WASM plugin */
//     wasm?: boolean;
//
//     /**
//      * Worker format
//      *
//      * - unspecified: no plugin config will be set for worker
//      * - "default": set the same plugins for worker, and don't set the format
//      * - other: set the same plugins for worker, and set the format to the value
//      */
//     worker?: "default" | "es";
// };
//
// const ChunkSizeWarningLimit = 4096;
// // TODO: see how default splitting behaves
// // const ManualChunks = {
// //     react: ["react", "react-dom", "@fluentui/react-components"],
// // };
// const Dedupe = ["@pistonite/pure", "@pistonite/celera", "@pistonite/workex", "i18next", "react-i18next"];
//
// export const configure = (monoConfig: MonodevAppBuildConfig): (userConfig: UserConfig) => UserConfig => {
//     return (config) => {
//     }
// }
