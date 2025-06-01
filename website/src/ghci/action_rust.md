# Action: Rust

[Workflow file](https://github.com/Pistonight/mono-dev/tree/main/acitons/rust-xplat/action.yml)

Use the first action to build Rust CLI tool and upload it to CI artifacts,
then use the second action to download the artifacts, sign them, and create a release

```yaml
jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        include:
          - image: ubuntu-latest
            target: x64
          - image: ubuntu-24.04-arm
            target: arm64
          - image: macos-latest
            target: x64
          - image: macos-latest
            target: arm64
          - image: windows-latest
            target: x64
          - image: windows-11-arm
            target: arm64
    runs-on: ${{ matrix.image }}
    steps:
      - uses: Pistonight/mono-dev/actions/setup@main
        with:
          rust: stable
          rust-native: ${{ matrix.target }}
          rust-src: true
      - uses: Pistonight/mono-dev/actions/rust-xplat@main
        with:
          arch: ${{ matrix.target }}
          binary: botwrdb

          # optional: install tauri build dependencies, default false
          tauri: true
         
          # optional: additional build arguments
          # default build args included:
          #   --bin <binary>
          #   --release
          #   --target <triple> (for apple only)
          build-args: "--feature too"

          # optional: target directory for the build (default is `target`)
          target-dir: my-target-dir

          # optional: Task to run before building
          pre-task: exec -- pre-build
          # optional: Task to run after building (not ran if build fails)
          post-task: exec -- post-build
          # optional: Task to run instead of cargo build. cargo build args are passed in as .CLI_ARGS
          build-task: exec -- build
    
```

```yaml
name: Release
on:
  push:
    tags:
      - v*.*.*
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - if: startsWith(github.ref, 'refs/tags/v')
        uses: Pistonight/mono-dev/actions/release@main
        with:
          artifacts-workflow: build.yml
          artifacts-path: release
          pack: botwrdb-*
          minisign-key: ${{ secrets.MINISIGN_KEY }}
```
