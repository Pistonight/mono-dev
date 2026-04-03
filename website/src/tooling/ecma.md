# TypeScript/ECMA

## Tools
TypeScript projects use:
- `prettier` for formatting
- `eslint` for checking code style and issues
- `tsc` for type checking and generating `d.ts` files for libraries
- `vitest` for testing
- `vite` for bundling library or app

#### Template: `mono-dev` dependency

```admonish todo
this section needs updating after everything works
```

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

#### Template: `Taskfile.yml`
```yaml
version: '3'

includes:
  ecma:
    taskfile: ./node_modules/mono-dev/task/ecma.yaml
    internal: true
    optional: true
```

#### Template: `.gitignore`

```
# mono-dev: ecma gitignores
node_modules
package-lock.json
.prettierignore
.eslintcache
/eslint.config.js
/tsconfig*.json
/mono-dev
/dist
```

## Type Checking
`mono-dev` automatically generates type checking configs based on directory structure:
- Each directory is type-checked separately
  and allow for different env config (for example, `src` vs `scripts`)
- no DOM and no types exist by default. They need to be manually included in `env.d.ts`
  in each directory. Only directories with `env.d.ts` will be checked.
- If root directory contain any TypeScript stuff, it will be checked as well
- ESLint only checks the TypeScript projects. If you use ECMAScript, you opt-out of safety anyway

## `package.json > "nocheck"`
For code that should be involved with type-checking, but ignored for other checks (usually generated code),
a `"nocheck"` array in top-level of `package.json` can be provided using the same syntax as `.gitignore`,
for example:
```json
{
    "nocheck": ["/src/generated"]
}
```
Paths in `nocheck` will not be processed by `eslint` or `prettier`.
If the path is in the form of `/foo` or `foo`, the `foo` directory
will also not be type-checked.

## TS Import Path remapping

TS import paths can be remapped in bundled apps to avoid the "relative parent import hell".
The only scenario where this is bad is when the package exports raw TypeScript source,
and therefore downstream cannot resolve the imports correctly because they don't have access
to the mapping in `tsconfig.json`.

The mapping is automatically generated if `package.json` doesn't have `exports` or
if any path in `exports` ends with `.(c|m)?tsx?` and does not end with `.d.ts`.

Currently, the `src` directory is hardcoded to be the source directory and path mapping
is only generated for that directory as `self::`. One import path is generated for the first `index.(c|m)?tsx?`
file found for each nested directory in `src.

~~~admonish example
The following directory structure:
   
```
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
```

generates:

```
    self::lib -> ./src/lib/index.ts
    self::util/image -> ./src/util/image/index.ts
    self::util/data -> ./src/util/data/index.ts
```

~~~

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
