import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export function override(configs, overrides) {
    if (Array.isArray(configs)) {
        for (const config of configs) {
            override(config, overrides);
        }
    } else {
        if (configs.rules) {
            for (const rule in overrides) {
                if (configs.rules[rule]) {
                    configs.rules[rule] = overrides[rule];
                }
            }
        }
    }
    return configs;
}

const defaultOverrides = {
    // typescript has coverage already
    "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/restrict-template-expressions": ["warn", { allowNumber: true }],
    // we have TypeScript
    "react/prop-types": "off",
};

export function config(configObj) {
    const enableReact = configObj.react ?? true;
    const config = defineConfig(
        globalIgnores(configObj.ignores || []),
        {
            extends: [
                js.configs.recommended,
                ...tseslint.configs.strict,
                ...(enableReact
                    ? [
                        reactHooks.configs.flat.recommended,
                        reactRefresh.configs.vite,
                    ]
                    : []),
            ],
            files: ["**/*.{ts,mts,cts,tsx}"],
            languageOptions: {
                ecmaVersion: 2020,
                globals: globals.browser,
                parserOptions: {
                    projectService: true,
                    tsconfigRootDir: configObj.tsconfigRootDir || undefined,
                },
            },
            settings: {
                ...(enableReact
                    ? {
                          react: { version: "19" },
                      }
                    : {}),
            },
            rules: {
                ...(enableReact
                    ? {
                          "react-refresh/only-export-components": [
                              "warn",
                              { allowConstantExport: true },
                          ],
                      }
                    : {}),
                "no-unused-vars": "off",
                // force type to be import as type
                "@typescript-eslint/consistent-type-imports": "warn",
                // force you to mark floating promises with `void` (warning for ease with testing)
                "@typescript-eslint/no-floating-promises": "warn",
            },
        },
    );

    return override(config, defaultOverrides);
}
