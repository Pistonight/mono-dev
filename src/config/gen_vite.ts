import vitePluginReact, {
    reactCompilerPreset as viteBabelReactCompilerPreset,
} from "@vitejs/plugin-react";
import vitePluginBabel from "@rolldown/plugin-babel";
import babelReactCompiler from "babel-plugin-react-compiler";
import vitePluginWasm from "vite-plugin-wasm";
import type { Plugin } from "vite";

import { viteYaml } from "#plugins";
import { hasDependency, type PackageJson } from "#util";

export const genVitePlugins = (packageJson: PackageJson): Plugin[] => {
    const plugins = [];
    plugins.push(viteYaml());
    if (hasDependency(packageJson, "react")) {
        plugins.push(vitePluginReact());
        const reactCompilerPreset = viteBabelReactCompilerPreset();
        reactCompilerPreset.preset = () => {
            return {
                plugins: [[babelReactCompiler, {}]],
            };
        };

        plugins.push(
            vitePluginBabel({
                presets: [reactCompilerPreset],
            }),
        );
    }
    if (packageJson["pistonight/mono-dev"]?.wasm) {
        plugins.push(vitePluginWasm());
    }
    return plugins;
}

export const genViteDefines = (packageJson: PackageJson): Record<string, string> => {
    return {
        "import.meta.version": JSON.stringify(packageJson.version),
    };
}
