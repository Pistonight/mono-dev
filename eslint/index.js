import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

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
    "@typescript-eslint/no-unused-vars": "off",
    // force type to be import as type
    "@typescript-eslint/consistent-type-imports": "warn",
    "@typescript-eslint/restrict-template-expressions": [
        "warn",
        {
            allowNumber: true,
        },
    ],
    // we have TypeScript
    "react/prop-types": "off",
};

export function config(configObj) {
    const config = tseslint.config(
        {
            ignores: configObj.ignores || [],
        },
        {
            extends: [js.configs.recommended, ...tseslint.configs.strict],
            files: ["**/*.{ts,tsx}"],
            languageOptions: {
                ecmaVersion: 2020,
                globals: globals.browser,
                parserOptions: {
                    projectService: true,
                    tsconfigRootDir: configObj.tsconfigRootDir || undefined,
                },
            },
            settings: {
                react: {
                    version: "18",
                },
            },
            plugins: {
                "react-hooks": reactHooks,
                "react-refresh": reactRefresh,
                react,
            },
            rules: {
                ...react.configs.recommended.rules,
                ...react.configs["jsx-runtime"].rules,
                ...reactHooks.configs.recommended.rules,
                "react-refresh/only-export-components": [
                    "warn",
                    { allowConstantExport: true },
                ],
            },
        },
    );

    return override(config, defaultOverrides);
}
