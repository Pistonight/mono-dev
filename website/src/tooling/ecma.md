# TypeScript/ECMA

`mono-dev` packages itself as a node module. In TypeScript/ECMAScript
projects, the package needs to be declared in `package.json` to be
managed by the package manager. The recommended setup is to link it with `pnpm`
with `/mono-dev` at the root of the repo.

```json
{
    "devDependencies": {
        "mono-dev": "link:../../mono-dev"
    }
}
```

```admonish warning
`pnpm` currently does't support the `link` protocol in catalog, so it has to specified
in each package.
```

The build scripts can be included in `Taskfile.yml`
```yaml
version: '3'

includes:
  ecma:
    taskfile: ./node_modules/mono-dev/task/ecma.yaml
    internal: true
```

```admonish note
`./node_modules` can also be `../..` (monorepo package) or `./` (single repo)
```

## Check and Fix
`mono-dev` ships with its own "zero config" linter `monolint` that wraps
`tsc`, `eslint` and `prettier` with pre-defined rules.

```yaml
tasks:
  check:
    - task: ecma:check
  fix:
    - task: ecma:fix
```

It scans the project and generates config files on the fly.
However, for other tools like `tsserver` to work properly, these config files need to be in the project
rather than hidden away in some place already ignored by VCS.
So, you have to add these entries to your `.gitignore`:
```
.prettierignore
/tsconfig*.json
/eslint.config.js
```

This is behavior of `mono-lint`:
- TypeScript projects are directory-based. Each directory is type-checked separately
  and allow for different env config (for example, `src` vs `scripts`)
- no DOM and no types exist by default. They need to be manually included in `env.d.ts`
  in each directory. Only directories with `env.d.ts` will be checked.
- If root directory contain any TypeScript stuff, it will be checked as well
- ESLint only checks the TypeScript projects. If you use ECMAScript, you opt-out of safety anyway

For code that should be involved with type-checking, but ignored for other checks (usually generated code),
a `"nocheck"` array in top-level of `package.json` can be provided using the same syntax as `.gitignore`,
for example:
```json
{
    "devDependencies": {
        "mono-dev": "link:../../mono-dev"
    },
    "nocheck": ["/src/generated"]
}
```
Paths in `nocheck` will not be processed by `eslint` or `prettier`

### Remapping TS Import Path
TS import paths can be remapped in bundled apps to avoid the "relative parent import hell".
`mono-lint` automatically detects suitable scenarios to generate these import maps using a `self::`
prefix.

The conditions for import map to be generated are:
- `package.json` must NOT contain `"name"`, `"file"` or `"exports"` key,
  AND there is no `src/index.(c|m)?tsx?` file.
  These suggest the package is a library instead of bundled app
- The import paths can only be generated for the `src` directory
- One import path for the first `index.(c|m)?tsx?` found for each
  directory in `src`.
    ```admonish example
    The following directory structure:
       
        - src/
          - app/
          - util/
            - image/
              - index.ts
            - data/
              - index.ts
          - lib/
            - foo/
              - index.ts
            - index.ts

    generates:
    
        self::lib -> ./src/lib/index.ts
        self::util/image -> ./src/util/image/index.ts
        self::util/data -> ./src/util/data/index.ts

    ```

For max interop with tools such as `bun`, the same import map
will appear in `tsconfig.json` and `tsconfig.src.json`.

## Test
`mono-dev` re-exports `vitest` for testing. This ensures the version of `vitest`
is managed by the version of `mono-dev`. Import anything from `mono-dev/vitest`
instead of `vitest`.

Use `ecma:vitest` task to run test once and `ecma:vitest-dev` task to run in watch mode.

## Build Library
Building library from TS source into consumable package without TS supports zero-config.
Under the hood, the library mode of `vite` is used. `vite.config.ts` will be generated
on-the-go when running the `ecma:lib-build` task.

Currently the library is only packaged as ESM.

The build uses `dependencies`, `devDependencies` and `peerDependencies` to automatically
externalize dependencies.

- `dependencies`
  - Will be installed by package manager when consumer adds the library
  - **Externalized**: The code of the dependency will not be in the library
- `peerDependencies`:
  - Will NOT be installed by package manager when consumer adds the library;
    They have to also install it in the downstream.
  - **Externalized**: The code of the dependency will not be in the library
- `devDependencies`:
  - Will NOT be installed by package manager when consumer adds the library.
  - **NOT Externalized**: The code of the dependency is bundled into the library.

Consideration: Unless the library is meant to be used as a framework, DO NOT add global states.
It's very easy to cause duplicated global states when resolving dependencies.

`exports` in `package.json` is used to determine the entry points.
Note those are the actual output path and the source location will be inferred

```json
{
    "name": "my-lib",
    "exports": {
        "./foo": "./dist/foo/index.js",
        "./bar": "./dist/bar.js",
    }
}
```

The source for `my-lib/foo` will be `./src/foo/index.ts` and for `my-lib/bar`, `./src/bar.ts`.
If `.ts` extension is not found, `.tsx` is tried.


## Vite
`mono-dev` ships a baseline vite config that adds common plugins
and configs to my projects.

Add `vite` to the downstream project, with `vite.config.ts` at the root:
```typescript
import { defineConfig } from "vite";
import monodev from "mono-dev/vite";

// see type definition for more info
const monodevConfig = monodev({
    https: true, // if secure context is needed, needs trusted certificate
    wasm: true, // if wasm
    worker: "es", // if ES worker is needed
});

// wrap vite config with monodevConfig
export default defineConfig(monodevConfig({
    /** normal vite config here */
});
```

These plugins are automatically added:
- react
- yaml
- typescript paths

Define vite types in `src/env.d.ts`:
```typescript
/// <reference types="vite/client" />
/// <reference types="mono-dev/vite/client" />
/// <reference types="dom" />
/// <reference types="dom.iterable" />
```

Use the `ecma:vite-dev` and `ecma:vite-build` tasks to execute vite
dev server and build.
