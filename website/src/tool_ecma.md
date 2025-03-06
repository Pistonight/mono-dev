# TypeScript/ECMA

`mono-dev` packages itself as a node module. In TypeScript/ECMAScript
projects, the package needs to be declared in `package.json` to be
managed by the package manager. For example
```json
{
    "devDependencies": {
        "mono-dev": "workspace:*"
    }
}
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
In monorepos, `./node_modules` can also be `../`
```

## Check and Fix
`mono-dev` ships with its own "zero config" linter `mono-lint` that wraps
`tsc`, `eslint` and `prettier` with pre-defined rules.

```yaml
tasks:
  check:
    cmds:
      - task: ecma:mono-check
  fix:
    cmds:
      - task: ecma:mono-fix
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
        "mono-dev": "workspace:*"
    },
    "nocheck": ["/src/generated"]
}
```
Paths in `nocheck` will not be processed by `eslint` or `prettier`

### Interop with tools that checks for additional TSConfig
Additional tools such as `bun` reads `tsconfig.json` without
full interop with `tsc` (i.e. they have their own implementation).
Therefore, `mono-lint` also supports an `"tsconfig"` key as a template
to generate the main `tsconfig.json` for such tools to read.

For example
```json
{
    "devDependencies": {
        "mono-dev": "workspace:*"
    },
    "tsconfig": {
        "compilerOptions": {
            "baseUrl": "src"
        }
    }
}
```

This will make sure `bun` honors the `baseUrl` during bundling.
You also need to run the `mono-config` task to generate the `tsconfig.json`
before running `bun`.

## Test
To add testing support, add `vitest` to the downstream project as devdependencies
```
pnpm i -D vitest
```
`vitest` supports zero config out-of-the-box, see documentation for more.

Use `ecma:vitest` and `ecma:vitest-watch` tasks for running the test once or in watch mode.

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
