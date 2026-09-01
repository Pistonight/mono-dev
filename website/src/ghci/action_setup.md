# Action: Setup

[Workflow file](https://github.com/Pistonight/mono-dev/tree/main/actions/setup/action.yml)

```yaml
jobs:
  change-me:
    runs-on: blacksmith-4vcpu-ubuntu-2404

    steps:
      - uses: Pistonight/mono-dev/actions/setup@main
        with:
          # ALL VALUES BELOW ARE OPTIONAL

          # -- clone mono-dev in the repo --
          # Default: 'auto' - special value:
          #   - if pnpm-lock.yaml exists at root, then pnpm install will run, to pull
          #     in mono-dev and also all other dependencies.
          #     pnpm and node will also be installed without having to specify ecma-pnpm
          #   - otherwise, cloned to `/mono-dev` of the repo
          #
          # Set to `false` to not clone
          # Anything else indicates the ref to clone instead of `main`
          mono-dev: auto
          # Where to clone mono-dev, /mono-dev is the default
          mono-dev-path: mono-dev

          # -- whether to clone submodules, default false
          submodules: true

          # -- setup NodeJS/PNPM --
          # ecma-pnpm sets up both NodeJS and PNPM. If ecma-pnpm is set, ecma-node is ignored.
          # Note that the setup action requires NodeJS to run. If NodeJS is not available
          # on the runner image, then you need to set at least ecma-node to true
          # even if the project is not NodeJS
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

          # install mdbook
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

          # Setup C/CPP tooling
          ccpp-lint: true # clang-tidy and clang-format
          ccpp-cmake: true
          # note ninja is installed by GH runners by default

          # setup python, use `true` for vanilla python
          python: uv

      # repo-specific setup (if needed ..)
      - uses: ./.github/steps/setup
      - run: task install
```
