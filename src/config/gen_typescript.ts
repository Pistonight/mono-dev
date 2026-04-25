import fs_promises from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";

import { DTS, normalizeLineEnds, PackageJson, stringifySorted } from "#util";

export const genTypeScriptConfig = async (packageJson: PackageJson) => {
    const existingTsConfigs = new Set<string>();
    const tsDirectories: string[] = [];
    const rootFiles: string[] = [];
    const nonTsDirectories: string[] = [];

    const ignore_paths = new Set<string>();
    if (packageJson.nocheck) {
        for (const path of packageJson.nocheck) {
            if (path.startsWith("/") && !path.substring(1).includes("/")) {
                // /foo
                ignore_paths.add(path.substring(1));
                continue;
            }
            if (!path.includes("/")) {
                // foo
                ignore_paths.add(path);
                continue;
            }
        }
    }

    const promises = (await fs_promises.readdir(".")).map(async (p) => {
        const basename = path.basename(p);
        if (ignore_paths.has(basename)) {
            nonTsDirectories.push(p);
            return;
        }
        let stats;
        try {
            stats = await fs_promises.stat(p);
        } catch (e) {
            console.error(e);
            console.warn(`[mono] cannot stat ${p}, skipping`);
            return;
        }
        if (stats.isDirectory()) {
            const envFile = path.join(p, "env.d.ts");
            if (!fs.existsSync(envFile)) {
                nonTsDirectories.push(p);
            } else {
                tsDirectories.push(p);
            }
            return;
        }
        if (p !== "tsconfig.json" && p.startsWith("tsconfig.") && p.endsWith(".json")) {
            existingTsConfigs.add(p);
            return;
        }
        if (p.match(/\.(c|m)?tsx?$/)) {
            rootFiles.push(p);
        }
    });
    await Promise.all(promises);

    const existingTsConfigsToRemove = new Set(existingTsConfigs);

    // keep existing ts configs, so OS doesn't have to recreate the file on disk
    if (rootFiles.length) {
        existingTsConfigsToRemove.delete("tsconfig._.json");
    }
    tsDirectories.forEach((dir) => {
        existingTsConfigsToRemove.delete(`tsconfig.${dir}.json`);
        existingTsConfigsToRemove.delete(`tsconfig.${dir}__${DTS}.json`);
    });

    const directoryPromises = tsDirectories.map(async (dir) => {
        const tsconfig = `tsconfig.${dir}.json`;
        // the tsconfig only depends on the dir name,
        // we should never need to regenerate it
        const tsconfigContent = {
            compilerOptions: {
                ...DEFAULT_TSCONFIG.compilerOptions,
                tsBuildInfoFile: `node_modules/.mono/tsconfig.${dir}.tsbuildinfo`,
                rootDir: "."
            },
            include: [dir],
        };
        await fs_promises.writeFile(tsconfig, normalizeLineEnds(stringifySorted(tsconfigContent)||""));
    });

    const removeExisting = (async () => {
        for (const tsconfig of existingTsConfigsToRemove) {
            console.log(`[mono] removing ${tsconfig}`);
            await fs_promises.unlink(tsconfig);
        }
    })();

    if (rootFiles.length) {
        const tsconfig = "tsconfig._.json";
        const tsconfigContent = {
            compilerOptions: {
                ...DEFAULT_TSCONFIG.compilerOptions,
                tsBuildInfoFile: `node_modules/.mono/tsconfig._.tsbuildinfo`,
                rootDir: "."
            },
            include: rootFiles,
        };
        await fs_promises.writeFile(
            tsconfig,
            normalizeLineEnds(stringifySorted(tsconfigContent)||""),
        );
    }

    const projectCount = rootFiles.length + tsDirectories.length;

    await removeExisting;
    await Promise.all(directoryPromises);

    if (projectCount) {
        const references = tsDirectories.map((dir) => ({
            path: `./tsconfig.${dir}.json`,
        }));
        if (rootFiles.length) {
            references.push({ path: "./tsconfig._.json" });
        }
        const tsconfig = "tsconfig.json";

        // /** @type {any} */
        // let packageTsConfig = packageJson.tsconfig || {};

        const tsconfigContent = {
            compilerOptions: {},
            // ...packageTsConfig,
            files: [],
            references,
        };
        await fs_promises.writeFile(
            tsconfig,
            normalizeLineEnds(stringifySorted(tsconfigContent)||""),
        );
    } else {
        if (fs.existsSync("tsconfig.json")) {
            console.log("[mono] removing tsconfig.json");
            await fs_promises.unlink("tsconfig.json");
        }
    }
    return { projectCount, nonTsDirectories };
}
const DEFAULT_TSCONFIG = {
    /* https://aka.ms/tsconfig */
    "compilerOptions": {
        // -- we are only type checking, so no emit config is needed
        "noEmit": true,

        /* === Section: Project */
        "composite": true,
        "incremental": true,
        // "tsBuildInfoFile" is generated to be in node_modules/.tsc/

        // -- probably useless project options
        // "disableSourceOfProjectReferenceRedirect": true,  /* Disable preferring source files instead of declaration files when referencing composite projects. */
        // "disableSolutionSearching": true,                 /* Opt a project out of multi-project reference checking when editing. */
        // "disableReferencedProjectLoad": true,             /* Reduce the number of projects loaded automatically by TypeScript. */

        /* === Section: Language and Environment */
        // extra lib needs to be declared using /// directives:
        // - /// <reference lib="dom" />
        // - /// <reference lib="dom.iterable" />
        "lib": ["esnext"],

        "target": "esnext",
        "useDefineForClassFields": true,
        "jsx": "preserve",
        "moduleDetection": "force",

        /* === Section: Modules */
        "module": "esnext",
        "moduleResolution": "bundler",
        // "baseUrl" - removed in TS 7.0
        // "rootDir" - set in each tsconfig.json to be "."

        // Types needs to be included manually using /// directives,
        // to avoid types being auto-included from node_modules
        // - /// <reference types="node" />
        // - /// <reference types="bun" />
        // - /// <reference types="vite/client" />
        "typeRoots": [],
        "types": [],
        "allowImportingTsExtensions": true,

        // this is becoming natively supported in many runtime/frameworks, so let's just enable it
        "resolveJsonModule": true,

        /* === Section: JavaScript Support */
        // JS support aren't enabled. If you use JS, you opt-out of type-checking automatically
        "allowJs": false,
        "checkJs": false,

        /* === Section: Interop Constraints */
        // This means modules are enough for tools other than tsc to understand
        "isolatedModules": true,
        // This option might be useful in the future for libraries (like deno/JSR)
        // "isolatedDeclarations": true,
        // This isn't what you think it is. It means you cannot import X from "foo.ts",
        // if the file is actually "FoO.ts". (like the opposite of C includes)
        "forceConsistentCasingInFileNames": true,

        /* === Section: Type Checking */
        "strict": true,
        // these are covered by strict
        // noImplicitAny: true,
        // noImplicitThis: true,
        "noImplicitOverride": true,
        // these are off because eslint covers them and allows marking them with _ to opt-out
        // "noUnusedLocals": true,
        // "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,

        // -- other options are unused for now, but interesting to consider
        // "exactOptionalPropertyTypes": true,               /* Interpret optional property types as written, rather than adding 'undefined'. */
        // "noUncheckedIndexedAccess": true,                 /* Add 'undefined' to a type when accessed using an index. */
        // "noPropertyAccessFromIndexSignature": true,       /* Enforces using indexed accessors for keys declared using an indexed type. */

        /* === Section: Completeness */
        "skipLibCheck": true,

        /* === Lib Build Options */
        "declaration": true,
        "declarationMap": true,
        "emitDeclarationOnly": true,

        // TS 6->7 migration
        "stableTypeOrdering": true
    }
}
