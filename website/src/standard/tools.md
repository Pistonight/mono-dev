# System Tools

The system tools are expected to be installed and available globally on your system
(i.e. in `PATH`).

1. **Operating System**: Linux is preferred. Most projects also work with Windows.
   Most projects should also work with MacOS but they are not tested.
2. **GNU Utils**: Coreutils like `cp`, `rm`, `mkdir` should be available
   although they are not required for every project. For Windows users
   please use [Microsoft fork of uutils/coreutils](https://github.com/microsoft/coreutils/)

    > [!WARNING]
    > The Microsoft version of coreutils is still an early product and has some
    > rough edges. It also requires some complicated powershell integration.
    > If you have to work on Windows, it's recommended to test if the project
    > already works without Coreutils, or use Windows Subsystem for Linux directly.

   Some other utils like `find`, `xargs`, `sed`, `wget`, `grep` might be needed for some projects.
3. **Task Runner**: Please install the latest version of [`task`](https://taskfile.dev).
   This is a great cross-platform script runner 
    > [!NOTE]
    > This is a great cross-platform script runner with an implementation of coreutils
    > built-in, which is the reason why Windows don't usually need Coreutils unless for compatibility
    > reason).
    > It's also a great way to make the build system consistent across languages - 
    > instead of scripts in `package.json` which would only work with the NPM ecosystem,
    > every project has a `Taskfile.yml` which works regardless of the language/ecosystem.
4. **Git submodule manager**: For projects with submodules it's recommended
   to use [`magoo`](https://github.com/Pistonite/magoo), which is a wrapper
   for `git submodule`. If you are a veteran of git-submodule commands you can
   also run
    > [!NOTE]
    > If you are a veteran of git-submodule commands, you can also opt to run
    > the git-submodule commands directly.
    >
    > Magoo offers an interface more like a modern package manager (such as `npm` or `cargo`);
    > Most contributors just need to run `magoo install` when they `git pull` to checkout
    > the submodules.


In addition to the general system tools, please setup the language-specific
tool depending on the project you are working on. Some projects use
multiple languages and you will need to have all of them installed.

## Rust
For Rust projects:
- Install Rust (recommended through [`rustup`](https://rustup.rs))
- Windows users would need to install MSVC dependencies, please follow the guide
  on the Rustup download page.
- Projects may require additional tools that are written in Rust.
  Run `task install-cargo-extra-tools` or `task icets` for short from the repo root.
- `rust-analyzer` is the official language server. Install the `rust-analyzer`
  extension in VS Code, or if you use another editor, the corresponding extension/plugin
  for that editor for Rust Analyzer.


## TypeScript/ECMAScript/JS

> [!TIP]
> The steps below sets up PNPM and use it as the runtime/toolchain manager.
> If you already have another runtime/toolchain manager (such as `nvm`),
> you can install the runtimes use your preferred method. If it also
> supports the `devEngines` field, you will also get an error or warning
> if your currently installed engine version is not compatible.

For TypeScript/ECMAScript (aka JS) projects:
- Install [PNPM](https://pnpm.io/) which acts as a unified toolchain, engine, and package manager.
- Install NodeJS **v26** with PNPM: `pnpm i -g node@26`.
- Some projects may also need [Bun](https://bun.com/docs/installation).
  You can either install it standalone or through PNPM: `pnpm i -g bun`
- Install TypeScript and ESLint extension for VS Code, or if you use another editor,
  the corresponding TypeScript extension/plugin for that editor.

## C/C++
For C or C++ projects:
- Install [CMake](https://cmake.org/download/)
- Install [Ninja](https://github.com/ninja-build/ninja). This is especially needed for Windows
  to generate build commands for `clangd`
- Install a C compiler. For Windows this usually means you need MSVC (from Visual Studio Build Tools).
  Sometimes you need the GNU toolchain for Windows instead, one option is [LLVM-MINGW](https://github.com/mstorsjo/llvm-mingw)
- Install `clang-format` and `clang-tidy` from the LLVM toolchain. For Windows you can
  download from the [`official LLVM release`](https://github.com/llvm/llvm-project/releases/tag/llvmorg-22.1.8)
- Install the `clangd` extension for VS Code (NOT the official C/C++ extension).
  For other editor please install the corresponding `clangd` extension/plugin for that editor.

## Java
For Java projects:
- A decently modern JDK is expected to be installed on the system to run Gradle.
  You don't need to install the exact version the project uses because Gradle will handle that.
  A JDK installed through a version manager like `jabba` will also work.
- My version of [gradlew](https://github.com/Pistonite/gradle-wrapper) which
  does not require `jar` files in the repo (Read more in the link for the security
  concerns of that).
- I have a [very custom LSP setup with JDTLS and Neovim](https://github.com/Pistonite/shaft/blob/main/packages/registry/src/packages/nvim/config/piston-jdtls.nvim/lua/piston_jdtls/init.lua)
  but any editor that can work with a Gradle project should work.


## Python
For Python projects or projects that contain python scripts:
- Install [`uv`](https://docs.astral.sh/uv/)

