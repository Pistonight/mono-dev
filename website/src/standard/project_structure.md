# Project Structure

The Standard defines 3 possible project structure.

## Monorepo
This is common for large projects, where multiple small projects and
external dependencies are integrated.

`mono-dev` is installed into a monorepo as a git submodule:
```
magoo install https://github.com/Pistonight/mono-dev packages/mono-dev --name mono-dev --branch main
```

```admonish important
If the monorepo is meant to be a Rust crate that's cargo-installable/cargo-addable
directly from git, don't use the submodule approach, as cargo will clone the submodules
as well, but mono-dev should only be needed during development. The downside is that
the version won't be tracked by the `.gitsubmodules` file.
```

A typical monorepo should look like:
```
- .github/
- packages/
  - some-js-package/
    - src/
    - .gitignore
    - package.json
    - Taskfile.yml
  - some-rust-package/
    - src/
    - .gitignore
    - Cargo.toml
    - Taskfile.yml
  - mono-dev/ -> https://github.com/Pistonight/mono-dev
- .gitignore
- .gitmodules
- LICENSE
- README.md
- package.json
- pnpm-workspace.yaml
- pnpm-lock.yaml
- Cargo.toml
- Cargo.lock
- Taskfile.yml
```

The guidelines:
- All meaningful code and config (including build scripts) should be divided into packages in `packages` directory.
- Each package should have a `Taskfile.yml` that defines tasks for that package. For example, `check`, `fix` and `test`.
- The package structure should be flat. i.e. if `foo` has 2 parts, prefer `packages/foo-part1` and `packages/foo-part2`,
  instead of `packages/foo/part1` and `packages/foo/part2`.
  - There can be exceptions if the other part is very small, for example, a single build script.
- It's preferred for a package to depend on another package through the ecosystem,
  rather than copying files into other packages. For example, if a Rust package
  generates TypeScript code. It's preferred for the TypeScript code be generated inside the Rust package's
  directory. The Rust package can make a package.json to double as a Node package
  and be installed via `package.json`
- The root `Taskfile.yml` should include all packages' `Taskfile.yml` under the namespace
  *identical* to the directory name. Note that the directory name doesn't have to be
  the same as the package name. This is to save typing common prefixes. Aliasing the package
  is not recommended for projects with a lot of packages. An example for this is the [`botw-ist`](https://github.com/Pistonite/botw-ist/blob/main/Taskfile.yml) repo.
- The root `Taskfile.yml` can define additional tasks such as `check`, `test` and `build` for checking, testing
  and building all packages for centralizing and simplifying the CI setup.
- Additionally, the root `Taskfile.yml` should declare an `install` task for setting up
  the development environment, such as installing `node_modules`, generating necessarily files (such as `mono-dev`),
  and running post-install tasks. Declaring post-install in `Taskfile.yml` is recommended compared to using lifecycle scripts with NPM, as those are NPM specific.
  However, the `install` task should NOT install additional tools globally on the system,
  as those are machine-specific one-time setup, and not repo-specific.

The root `Cargo.toml` should declare a Cargo Workspace like:
```toml
[workspace]
resolver = "2"
members = [
    "packages/some-rust-package"
]
```

The root `pnpm-workspace.yaml` should declare a PNPM Workspace like:
```yaml
packages:
  - packages/some-js-package

catalog:
  react: ^18
```

The `catalog` protocol is a PNPM feature that allows dependency versions
to be easily synced.

## Atomrepo
This is a term I made up. In the Standard, it refers to a repository
that is only meant to be used within a monorepo. The most common scenario
is when the project needs external dependencies that's not covered
by NPM or Cargo.

The biggest benefit of an Atomrepo compared to publishing then consuming
the package through a public registry, is that updating code is VERY fast.
I just need to edit the code locally, commit and push it to git, and run `magoo
update` to update the submodule reference. This skips the need to wait for CI/publish,
while maintaining production-grade standard for the project.

Since an atomrepo is meant to be inside a monorepo, it doesn't have any strict package structure.
The only limitation is that it should not contain any submodules, as recursive submodules will be PAIN.
Dependencies should also be installed into the monorepo. This friction helps ensure the submodule dependency
chain doesn't grow out of control.

Also since an atomrepo is inside a monorepo, it can reference `mono-dev` in the same
repo with the path `../mono-dev`, or `./node_modules/mono-dev` if PNPM is used.

## Singlerepo
This is also a term I made up. This basically refers to simple projects
that only have to deal with one ecosystem or one language, such as a CLI tool.
Because the project structure is very simple, it doesn't justify creating
a monorepo.

`mono-dev` can still be helpful here as it defines common build tasks that 
can be included in one line. If PNPM is used, `mono-dev` should be
directly from `GitHub`.
```
pnpm i -D https://github.com/Pistonight/mono-dev
```
```admonish info
It's important to install mono-dev this way, as the ECMAScript configs
assumes mono-dev is found in node_modules!
```

If PNPM is not involved, then there are 2 options:
1. Add it as a git submodule:
```
magoo install https://github.com/Pistonight/mono-dev mono-dev --name mono-dev --branch main
```
2. Just clone and gitignore it:
```yaml
tasks:
  install:
    - rm -rf ./mono-dev
    - git clone https://github.com/Pistonight/mono-dev
```

The second option is better for rust projects that meant to be
installed from git, so users don't have to clone the submodule.
