# Action: Setup

[Workflow file](https://github.com/Pistonight/mono-dev/tree/main/acitons/setup/action.yml)

```yaml
jobs:
  change-me:
    name: change-me
    runs-on: ubuntu-latest
    # runs-on: blacksmith-4vcpu-ubuntu-2404

    # permissions for gcloud
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: Pistonight/mono-dev/actions/setup@main
        with:
          # ALL VALUES BELOW ARE OPTIONAL
          # setup mono-dev in the root of the repo
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
          # installed tools are cached by rust-cache
          # format: crate to use crates.io or crate=user/repo to use github
          tool-cargo-binstall: ripgrep,workex=Pistonite/workex

          # TODO: python support not here yet
          # setup latest version of python
          # python: true
          # python_pip: package1,package2

          # setup gcloud (default false)
          gcloud: project_id=xxx,workload_identity_provider=projects/xxx/locations/global/workloadIdentityPools/xxx/providers/xxx

      # repo-specific setup
      - uses: ./.github/steps/setup
      - run: task install
```
