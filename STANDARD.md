# Standard/Convention
This is the pattern downstream projects should follow

- [Prettier](#prettier)
- [ESLint](#eslint)
- [TSC](#tsc)
- [Vite](#vite)
- [Cargo](#cargo-clippy-and-format)
- [Docker](#docker)

## Standard Tasks
`Taskfile.yml` is both configuration for runner commands, and
our documentation for those commands. Use these standard task names 
whenever possible in `Taskfile.yml`, so the experience from one project 
carries on to other projects.

- `dev`: The most common inner dev workflow. For example, starting dev server that auto-reloads, or run
  tests in watch mode
- `check`: Run linter and/or formatter.
- `fix`: Fix issues found by linter and/or formatter.
- `build`: Run a PRODUCTION build that stores the output somewhere
- `test`: Run all of the tests (including unit/doc/integration)
- `pull`: Download extra data files needed that are not in the repo
- `pull-priv`: Download extra data files that require some private access
- `install`: **REPO LEVEL ONLY** Install dependency packages, such as through `magoo` and/or `pnpm`

These both apply at package level and at repo level. For example, `build`
at package level builds the package, and `build` at repo level
builds everything in the repo.

Addtionally, if there are tools needed that's `cargo-install`-able,
make sure they are installed by `install-cargo-extra-tools` task:
```yaml
tasks:
  install-cargo-extra-tools:
    aliases: [icets]
    cmds:
      - cargo install ...
```

## Project Structure
### Monorepo
A monorepo should have the following structure:
```
- .github/
- packages/
  - some-package/
  - another-package/
  - mono-dev/
- .gitignore
- .gitmodules
- LICENSE
- README.md
- package.json
- pnpm-workspace.yaml
- pnpm-lock.yaml
- Cargo.toml
- Cargo.lock
- go.work
- go.work.sum
- Taskfile.yml
```

Each directory in `packages/` is a singlerepo. These
single repos should not have a lock file,
as those are managed directly by the workspace.

Note that `mono-dev` is added as a package/submodule

```bash
magoo install https://github.com/Pistonight/mono-dev packages/mono-dev --branch main --name mono-dev
```
### Singlerepo
Singlerepo is my term for a repo that only contains one package.
In this case, the repo root is the package root

```
- .github/
- src/
- target/
- data/
- .gitignore
- .prettierignore
- LICENSE
- README.md
- Cargo.toml
- Cargo.lock
- package.json
- pnpm-lock.yaml
- Taskfile.yml
```

There's no rules for the folders in a singlerepo. Generally there
will be a `src` for source code, and some directory for outputs. It really
depends on the project.

Lock files should be gitignored if the singlerepo is meant to be used only
within a monorepo (added as a submodule). It's also recommended that 
Rust library crates do not include the `Cargo.lock` file.

Singlerepos should also not have submodules - upgrade it to a monorepo
if that's needed!!

## Workflows
**NOTE** In singlerepos, add `optional: true` to the Taskfile includes,
if `mono-dev` is cloned by a task. Otherwise, task will fail when `mono-dev`
doesn't exist

### Prettier
Prettier workflow should be added to `check` command for each package in a monorepo.
The `mono-dev` package provide Taskfile includes.

1. Add `"mono-dev": "workspace:*"` to devDependencies
2. `pnpm install`
3. Include from the package's `Taskfile.yml`
    ```yaml
    includes:
      ecma:
        taskfile: ../mono-dev/task/ecma.yaml
        internal: true
         
    tasks:
      check:
        desc: Run Linter and Formatter
        cmds:
          - task: ecma:prettier-check

      fix:
        desc: Fix issues in code
        cmds:
          - task: ecma:prettier-fix
    ```

4. If needed, include the workflow in repo level `Taskfile.yml`
    ```yaml
    includes:
      foo:
        taskfile: ./packages/foo
        dir: ./packages/foo
        internal: true

    tasks:
      check:
        desc: Check code issues in all packages
        deps: # Use cmds if they need to run in serial
          - foo:check
    ```

### ESLint
ESLint workflow should also be added to `check` command like `prettier`.
However there's no CLI wrapper, so `eslint` does need to be installed in the monorepo

1. Add `eslint` to the catalog in `pnpm-workspace.yaml`
    ```yaml
    catelog:
      eslint: ^9

    ```
2. Add `eslint` and `mono-dev` to the package's `devDependencies`
    ```json
       "eslint": "catalog:",
       "mono-dev": "workspace:*",
    ```
3. Create `eslint.config.js` in the package and add the import
    - Singlerepo: `import { config } from "./mono-dev/eslint";`
    - Package: `import { config } from "mono-dev/eslint";`

The following config option object is used
```typescript
type Config {
    // path/* to ignore directory
    ignores: string[], 
    // root dir of tsconfig, likely `import.meta.dirname`
    tsconfigRootDir: string,
}
```

Export the config
```javascript
import { config } from "mono-dev/eslint";

export default config({
    ignores: ["dist"],
    tsconfigRootDir: import.meta.dirname
});
```

To add or override the config
```javascript
import { override, config } from "mono-dev/eslint"; // or ./mono-dev/eslint
const defaults = config({
    ignores: ["dist"],
    tsconfigRootDir: import.meta.dirname
});
export default override(defaults, {
    // your overrides here
    "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
    ],
})
```

Finally, include from the package's `Taskfile.yml`
```yaml
includes:
  ecma:
    taskfile: ../mono-dev/task/ecma.yaml
    internal: true
     
tasks:
  check:
    desc: Run Linter and Formatter
    cmds:
      - task: ecma:eslint-check

  fix:
    desc: Fix issues in code
    cmds:
      - task: ecma:eslint-fix
```

### TSC (Type checking)

First, add `typescript` to catalog and package like eslint

Then create `tsconfig.json`
```json
{
    "extends": "../mono-dev/tsconfig/vite.json",
    "include": ["src"],
}
```

Note:
- For bundler-agnostic config, replace `vite` with `node`
- For singlerepo, change `..` to `.`
- For the main vite project, edit the `tsconfig.app.json` instead:
    ```json
    {
        "extends": "../mono-dev/tsconfig/vite.json",
        "compilerOptions": {
            "baseUrl": "src",
        },
        "include": ["src"]
    }
    ```
    and `tsconfig.node.json`
    ```json
    {
        "extends": "../mono-dev/tsconfig/node.json",
        "include": ["vite.config.ts"]
    }
    ```

For the main vite project you need to use `tsc-check-build`,
otherwise use `tsc-check`
```yaml
tasks:
  check:
    desc: Run Linter and Formatter
    cmds:
      - task: ecma:tsc-check-build # tsc-check for non-vite

```

### Vite
Use the `ecma:vite-dev` and `ecma:vite-build` tasks to execute
vite with pnpm

### Cargo Clippy and Format
`mono-dev` provides wrapper for clippy with common clippy flags

Generally, I like to set up cargo checks in the root `Taskfile.yml`
instead of each individual package.

```yaml
includes:
  cargo:
    taskfile: ./packages/mono-dev/task/cargo.yaml
    internal: true

tasks:
  check:
    desc: Check code
    deps: [cargo-check]
  
  cargo-check:
    cmds:
      # Check foo
      - task: cargo:clippy-package
        vars: { PACKAGE: foo }
      # Check bar with features
      - task: cargo:clippy-package-feature
        vars: { PACKAGE: bar, FEATURES: "ban,biz" }
      # Check formatting
      - task: cargo:fmt-check

  cargo-fix:
    deps: [cargo:fmt-fix]

```

In a singlerepo, or repo with only one Rust package,
use `clippy-all`
```yaml
includes:
  cargo:
    taskfile: ./mono-dev/task/cargo.yaml
    internal: true

tasks:
  check:
    desc: Check code
    cmds:
      - task: cargo:clippy-all
      - task: cargo:fmt-check
  
  fix:
    desc: Fix code
    deps: [cargo:fmt-fix]

```

### Go
Currently, my only script for Go is a wrapper around `go fmt`, because
for some reason it lacks a "check" functionality.

```yaml
includes:
  go:
    taskfile: ../mono-dev/task/go.yaml
    internal: true

tasks:
  check:
    desc: Check code
    cmds:
      - go vet
      - task: go:fmt-check
  
  fix:
    desc: Fix code
    cmds: 
      - go fmt

```

### Docker
Containerization should be its own package in a monorepo, like `packages/docker`

The `Dockerfile` should generally be like
```
FROM alpine:latest
EXPOSE 80
ENV APP_DIR=/app
COPY ./dist $APP_DIR
RUN chmod +x $APP_DIR/bin/changeme

WORKDIR $APP_DIR

ENV FOO=BAR                    \
    BIZ=BAZ                    

ENTRYPOINT ["/app/bin/changeme"]
```

Usually, docker workflow downloads artifact from CI, then build container locally.

It's recommended to setup a `pull` which downloads from CI, and a `pull-local` to
copy local artifacts

```yaml
tasks:
  pull:
    desc: Pull build artifacts from CI using current commit
    cmds:
      - magnesis
  pull-local:
    desc: Copy build artifacts from local build output
    cmds:
      - cp ...
```

The actual container operations:
```yaml
includes:
  docker:
    taskfile: ../mono-dev/task/docker.yaml
    internal: true

  build:
    cmds:
      - task: docker:build
        vars: { IMAGE: pistonite/foo }

  run:
    cmds:
      - task: docker:run
        vars: 
          IMAGE: pistonite/foo
          DOCKER_RUN_FLAGS: >
            -p 8000:80
            -e FOO=BAR
            -e GIZ=BAZ
  
  connect:
    cmds:
      - task: docker:connect
        vars: { IMAGE: pistonite/foo }

  stop:
    cmds:
      - task: docker:stop
        vars: { IMAGE: pistonite/foo }
  
  clean:
    cmds:
      - task: docker:clean
        vars: { IMAGE: pistonite/foo }


    
```
