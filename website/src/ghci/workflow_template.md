# Workflow Templates

Copy to a workflow `.yml` file, and delete things not needed

## General Config
```yaml
name: _____CHANGEME_____
on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main
    tags:
      - v*.*.*
  workflow_dispatch:
    inputs:
      version:
        description: "Version tag of the image (e.g. 0.2.0-beta)"
        required: true
```

## Full Job > GitHub Pages
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: Pistonight/mono-dev/actions/setup@main
        with:
          tool-mdbook: true
      - run: task build-pages
      - uses: actions/upload-pages-artifact@v3
        with:
          path: packages/manual/book
          retention-days: 3
  deploy-pages:
    needs:
      - build
    if: github.event_name != 'pull_request'
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Full Job > Rust CLI Build & Release
See [Rust Action](./action_rust.md)

## Job > Single Platform
```yaml
jobs:
  _____CHANGEME_____:
    runs-on: ubuntu-latest
    # runs-on: blacksmith-4vcpu-ubuntu-2404
```

## Job > Multiple Platforms
```yaml
jobs:
  _____CHANGEME_____:
    strategy: { matrix: { os: [ ubuntu-latest, macos-latest, windows-latest ] } }
    runs-on: ${{ matrix.os }}
```

## Job > Multiple Platforms + Different Args
```yaml
jobs:
  _____CHANGEME_____:
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: ubuntu-latest
            target: x64
            build_args: "--target x86_64-unknown-linux-gnu"
            build_output: target/x86_64-unknown-linux-gnu/release/botwrdb
          - os: ubuntu-latest
            target: arm64
            build_args: "--target aarch64-unknown-linux-gnu"
            build_output: target/aarch64-unknown-linux-gnu/release/botwrdb
          - os: macos-latest
            target: x64
            build_args: "--target x86_64-apple-darwin"
            build_output: target/x86_64-apple-darwin/release/botwrdb
          - os: macos-latest
            target: arm64
            build_args: "--target aarch64-apple-darwin"
            build_output: target/aarch64-apple-darwin/release/botwrdb
          - os: windows-latest
            target: x64
            build_output: target/release/botwrdb.exe
    runs-on: ${{ matrix.os }}
    # use the args like ${{ matrix.target }} or ${{ matrix.build_args }}
```


## Permissions
```yaml
    # permission for publish release
    permissions:
      contents: write

    # permission for publishing docker image
    permissions:
      contents: read
      packages: write

    # permission for gcloud
    permissions:
      contents: read
      id-token: write
```

## Steps > Setup
See [Setup Action](./action_setup.md)

## Steps > Upload Artifacts
```yaml
      - uses: actions/upload-artifact@v4
        with:
          path: dist/foo
          name: foo
          retention-days: 3
```

## Steps > Download Artifacts
Note that the [Docker Image Action](./action_docker.md) automatically downloads artifacts
```yaml
      - run: mkdir -p package
        shell: bash
      - uses: dawidd6/action-download-artifact@v6
        with:
          github_token: ${{ github.token }}
          workflow: CHANGEME.yml
          commit: ${{ github.sha }}
          path: package
```

## Steps > Download Release
This is helpful if there are data files in previous releases

```yaml
      # download release
      - uses: robinraju/release-downloader@v1
        with:
          tag: CHANGEME
          fileName: CHANGEME.7z
          out-file-path: package
          extract: false
```

## Ifs > Pull Request

Only run the step if the event is or is not a pull request
```yaml
      - if: github.event_name == 'pull_request'
      - if: github.event_name != 'pull_request'
```

## Ifs > Release Tag
```yaml
      - if: startsWith(github.ref, 'refs/tags/v')
```
