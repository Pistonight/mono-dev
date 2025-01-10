# Working on a downstream project
This page documents how to work in a project of mine that follows
the `mono-dev` convention. Mostly likely you are directed here
from one of those projects.

## Technologies
Generally, my projects should support development
on both Linux and Windows. For the tools, there are some required and some
only required for a specific language.

If you use windows, the tasks assume GNU Coreutils are available. 
https://github.com/uutils/coreutils is a Rust implementation of it
```bash
cargo install coreutils
```
Then you might need to setup a few shims, for example, create a file `rm.cmd`
somewhere in your `PATH`:
```
@echo off
coreutils rm %*
```
For Coreutils that conflicts with PowerShell alias or windows utilities, you might need to remove them
in a PowerShell Profile:
```powershell
# This is needed for commands that are aliases
Remove-Item Alias:rm -Force
# This is needed for commands that are not alias
Set-Alias -Name mkdir -Value "Path\To\Your\mkdir.cmd"
```
Now you can run GNU `rm` in CMD or PowerShell!

### Command Runner - **ALWAYS REQUIRED**
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


### Submodule Manager
**REQUIRED only if the project uses git submodules**
Install [`magoo`](https://github.com/Pistonite/magoo), a `git` wrapper
for managing submodules.

Reason:
- Sometimes I just need to include another project, not as a `npm` or `cargo`
  dependency. Just a project in another project.
- Git submodule is great that it's built-in to git. However, the CLI is not so intuitive.
- `magoo` is a wrapper that manages submodules using the `.gitmodules` file - no extra
  files. It behaves like a modern package manager like `npm` or `cargo`, and does due diligence
  to make sure the local submodule state is consistent. For example, running `magoo install`
  updates the local submodule state to match the repo's index (no, that does not happen automatically
  with `git pull`)

### Rust
The [Rust Toolchain](https://rustup.rs) is required for working with my projects
that involve the Rust programming language. Most projects use the latest stable version
of Rust. A few might require nightly.

There is a task `install-cargo-extra-tools` (`icets`) to
install everything needed that's `cargo-install`-able.
```bash
task icets
```
For example, this will build and install `wasm-pack` for WebAssembly projects,
and `mdbook` for mdbook-based documentation.

`cargo` is Rust's package manager, linter and formatter

### TypeScript
The ecosystem is insanely complicated but this is what you need:

- Node.JS v20
- Latest pnpm

If you are new to the JS ecosystem, the recommended way is to just install
Node from https://nodejs.org or from your package manager. Otherwise,
you should probably use [`nvm`](https://github.com/nvm-sh/nvm) or [`nvm-for-windows`](https://github.com/coreybutler/nvm-windows)

After installing NodeJS, install `pnpm` with `npm`
```bash
npm i -g pnpm
```

I try to keep all tools required by JS projects managed by NPM dependencies,
so there should be no extra installation needed.

We use:
- `tsc` for type checking
- `prettier` for formatting
- `eslint` for linting

Reason:
- `pnpm` is just for managing packages (i.e. putting things in the correct `node_modules`, and finding the executable using `pnpm exec`).
  `node` is still needed to run those packages. Yes `bun`/`deno` exists, but deno has terrible interop with NPM registry, and `bun`
  has very limited package support (sometimes just segfaults). Those are good for small toy projects or demos, but not close to reliable enough
  for production
- `prettier` is used over `dprint` because it is opinionated, i.e. output does not depend on the input
  

### Python
Python is used mostly for data processing and metaprogramming (generate code from data).
We use the latest stable version of Python.

Python is not used in production for any of my projects, so there is not formatting/linting.

### Go
I am starting to explore [`Go`](https://go.dev/) as a replace for Rust
in the server land. Install from the official website for Windows,
or through your package manager for Linux.

`go` is Go's package manager, linter and formatter

### C/C++
Most of my projects using C/C++ are for embedded systems, since the tooling
for normal desktop system is really lacking compared to Rust or Go.

Most likely you will need Clang or GCC, CMake, and Ninja, and Windows is often
not supported.

### Docker
Docker is required if you want to build and test the docker container for projects
that publish container images
