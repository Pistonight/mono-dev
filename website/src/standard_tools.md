# System Tools

## Operating System
My projects are usually not OS-specific. I daily drive Windows and do my
development stuff on Linux, sometimes Windows as well. Therefore,
these standards aim to support both development on Windows and Linux.

However, cross-platform build scripts are PAIN. The Standard transfers
that pain to the developer by assuming the System Tools already exists
in `PATH`. These tools are usually cross-platform, so scripts don't
need to deal with platform-specific commands.

On Windows, the easiest way to meet the requirements is to install WSL,
then install the tools inside WSL.

## GNU Utils
GNU Coreutils like `cp`, `rm`, `mkdir` must be available on the system.
The build scripts will almost always use these.

```admonish info
Because `mkdir` is a builtin command on Windows and cannot be overriden/aliases away,
`which` is also required, and the build scripts will call `$(which mkdir)`
```

Other GNU utils like `sed`, `wget` might be needed for some projects.

## Task Runner
Install [`task`](https://taskfile.dev/), the command runner to run, well, tasks.

This is technically not always required, if you are willing to copy commands
from `Taskfile.yml` to the terminal every time you want to run something.

Reason:
- Every project has some task runner, whether it is `npm` for ECMAScript/TypeScript
  projects, some `.sh` scripts in a `scripts` folder, or some `.md` doc that
  tells you what commands to run.
- The problems with each of those approaches are:
  - `npm`: not language-agnostic. I don't want to install `node` for Rust projects, for example
  - `.sh`: not platform-agnostic. I don't want to gate-keep devs that only use Windows from contributing
  - documentation: Inconvenient. I don't want to copy command every time I want to execute them
- I have used [`just`](https://github.com/casey/just) before switching to `task`.
  It's a command runner written in Rust. The main thing lacking is ability to run
  tasks in parallel and it uses a DSL. `task` on the other hand uses YAML.

## Package Manager(s)
Modern ecosystems have package managers, like `node_modules` for JS or crates for Rust.
However, I need something outside of these to enable dependency management in monorepos
with multiple languages. The solution might be surprising - git modules!

With git modules, arbitrary git repositories can be integrated as a member in the monorepo,
then integrated with ecosystem-specific package managers like `pnpm` or `cargo`.
For these tools, the package appears to be a local dependency, but for `git`, it's an external dependency.

I made a wrapper for `git submodule` called [`magoo`](https://github.com/Pistonite/magoo) to streamline
the process of updating submodules. (Rust needed for installation)

## Rust Toolchain
```admonish note
The Version (or MSRV - Minimum Supported Rust Version) for the standard,
is always the latest stable release of Rust. Projects will also begin
to be migrated to the latest edition of Rust as soon as it's released.

Specific projects might require nightly features.
```
The Rust Toolchain is needed not only for Rust projects, but to install
various tools from `crates.io` - Rust's public registry.
Follow [rustup.rs](https://rustup.rs) to set up `cargo` and any additional
dependencies. This means you also need MSVC build tools on Windows if WSL
is not used.

For projects, the root should define a task called `install-cargo-extra-tools`
with the alias `icets` to invoke `cargo install` for all tools needed
for the most common development workflows. This serves as a documentation
for what cargo tools are needed for the project.

Most of the time, a Rust Toolchain is also the only thing you need
to work on a Rust project, thanks to `cargo` also being a linter and formater for Rust.

## ECMAScript ecosystem
```admonish note
The current NodeJS version in the standard is v20
```
NodeJS is basically still the source of truth for the industry.
You can install it from NodeJS website, from your distro's package manager,
or use NVM (or NVM for windows).

There are 2 additional tools needed globally:
- `pnpm` - the package manager that works better with monorepos
- `bun` - bun is a new tool that tries to be "everything you need to develop JS".
  We use it for:
  - Bundling with zero config
  - Running TypeScript natively with zero config

```admonish info
Yes, I am aware NodeJS is adding TypeScript support natively. However,
there are TypeScript-only features that node cannot run without transforming
the source. TypeScript has added an option to disable those features.
Time will tell who wins in the end
```

Both of these tools should always be updated to the latest version.
Fortunately, this is very easy with NPM:
```
npm i -g pnpm bun
```
```admonish warning
If you are using NVM or other version managers, the global packages
are usually tied to the node version.
```

Other tools used in development are managed as node dependencies,
so they will automatically be installed local to the project.

## Python
```admonish info
While TypeScript + Bun has decent DX at being a general purpose
scripting language, to have proper type checking in the IDE, you still
need `tsconfig.json`, `eslint`, and all of the bloat. Not to mention,
you need to install all the tools ECMAScript ecosystem uses.

Therefore, for non-ECMAScript projects, it's far more likely that someone
has `python` installed, compared to `node+npm+pnpm+bun`. Which is why
Python is the preferred option in non-ECMAScript projects.
```
```admonish note
We always aim at supporting the latest version of Python.
Hopefully there won't be Python 4.
```
You can install Python from their website, from your distro's package
manager, or through a version manager.

My projects do not use Python in production, so the dependencies are also
expected to be installed globally. 2 of the most common ones are `tqdm` and `pyyaml`.

If a project does have a complicated Python setup (typically machine-learning-related),
it will have a dedicated setup instruction.

## C/C++
The Standard for C/C++ tooling is experimental, as it differs a lot
between Linux and Windows. There's also not an industry standard for packages.

Projects will most likely use `clang-format` for formatting and `clangd` for LSP.
For build system, it will probably be `cmake` or `ninja`.

## Other Languages
No Standard exists for these languages first, as I don't have projects in-production
that use them. However, I am side-eyeing these and may look into it in the future
- Go
- Zig

## Docker
Usually, docker is only used for my project if a server is needed.
Even for those projects, there is a good chance the local development workflow
does not need docker.

