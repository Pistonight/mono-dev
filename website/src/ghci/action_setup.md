# Action: Setup

[Workflow file](https://github.com/Pistonight/mono-dev/tree/main/actions/setup/action.yml)

```yaml
jobs:
  change-me:
    runs-on: ubuntu-latest
    # runs-on: blacksmith-4vcpu-ubuntu-2404

    steps:
      - uses: Pistonight/mono-dev/actions/setup@main
        with:
          # ALL VALUES BELOW ARE OPTIONAL
          # clone mono-dev in the repo
          # Use `true` for root of the repo (/mono-dev)
          # Use a path will clone to that path (`packages` -> /packages/mono-dev)
          # default is false
          mono-dev: true

          # whether to use blacksmith-specific steps
          # rather than github ones. Default is use github
          runner: blacksmith

          # whether to glone submodules
          # default is false
          submodules: true

          # setup NodeJS/PNPM
          # default false, ecma_pnpm will also setup NodeJS
          ecma-node: true
          ecma-pnpm: false

          # setup Bun, default is false
          ecma-bun: true

          # setup Rust, default is false
          # use `stable`, `nightly` value
          # When using `nightly`, the toolchain is pinned to the nightly
          # version on the 1st of the previous UTC month
          #   - this is for efficient caching of CI
          # also setup at least one target below
          rust: stable

          # setup wasm32-unknown-unknown target for Rust, default false
          # also will install wasm-pack
          rust-wasm: true

          # setup native targets for the runner's OS
          # default is x64, only `x64` (x86_64) and `arm64` (aarch64)
          # are supported, arm is ignored on windows right now
          rust-native: x64,arm64
          
          # install the rust-src component, default false
          rust-src: true

          # installs mdbook and mdbook-admonish
          tool-mdbook: true

          # install extra tools with cargo-binstall
          # installed tools here are not cached and falling
          # back to compile from source is banned
          #
          # formats:
          # - crates.io: <crate>
          # - github: <crate>=<user>/<repo>[#<rev>]
          # - specific binary: <binary>(<crate>)[=<user>/<repo>[#<rev>]]
          # - specific version: replace <crate> with <crate>@<version>
          tool-cargo-binstall: ripgrep,workex=Pistonite/workex

          # same format as above, but uses cargo install
          # this is cached by rust-cache
          # note specifying anything here will also
          # setup rust for the current OS/Arch if not already done
          tool-cargo-install: ...

          # TODO: python support not here yet
          # setup latest version of python
          # python: true
          # python_pip: package1,package2

      # repo-specific setup
      - uses: ./.github/steps/setup
      - run: task install
```
