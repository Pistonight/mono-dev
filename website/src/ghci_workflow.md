# Workflow

Copy to a workflow `.yml` file, and delete things not needed
```yaml
name: CHANGEME
on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main
  workflow_dispatch:
    inputs:
      version:
        description: "Version tag of the image (e.g. 0.2.0-beta)"
        required: true

jobs:
  change-me:
    name: change-me
    runs-on: ubuntu-latest

    # runs-on: blacksmith-4vcpu-ubuntu-2204
    
    # multiple platforms
    strategy: { matrix: { os: [ ubuntu-latest, macos-latest, windows-latest ] } }
    runs-on: ${{ matrix.os }}

    # multiple platforms, with different args
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: ubuntu-latest
            foo: bar-ubuntu
          - os: macos-latest
            foo: bar-macos
          - os: macos-latest
            foo: bar-macos2
          - os: windows-latest
            foo: bar-windows
    runs-on: ${{ matrix.os }}

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

    # normal check/test/build workflow
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
          submodules: true
      - uses: ./.github/steps/setup
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      # run the thing
      - run: task install-ci
      - run: task build

      # upload artifacts
      - uses: actions/upload-artifact@v4
        with:
          path: dist/foo
          name: foo
          retention-days: 3
      
      # upload for pages
      - uses: actions/upload-pages-artifact@v3
        with:
          path: packages/app/dist
          retention-days: 3

    # release
    steps:
      # download artifacts
      - run: mkdir -p package
      - uses: dawidd6/action-download-artifact@v6
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          workflow: CHANGEME.yml
          commit: ${{ github.sha }}
          path: package

      # download release
      - uses: robinraju/release-downloader@v1
        with:
          tag: CHANGEME
          fileName: CHANGEME.7z
          out-file-path: package
          extract: false

      # draft release
      - uses: johnyherangi/create-release-notes@v1
        id: release-notes
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - run: |
          echo "${{ steps.release-notes.outputs.release-notes }}" > .github/RELEASE_NOTES.md
          cat .github/RELEASE_NOTES_FOOTER.md >> .github/RELEASE_NOTES.md
      - uses: softprops/action-gh-release@v2
        with:
          draft: true
          body_path: .github/RELEASE_NOTES.md
          files: |
            package/foo

      # docker
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/setup-buildx-action@v3
      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ghcr.io/CHANGE--------ME
          tags: |
            type=sha
            type=sha,format=long
            type=raw,value=${{ github.event.inputs.version }}
            type=raw,value=latest
      - uses: docker/build-push-action@v5
        with:
          push: true
          context: CHANGE---------ME TO DIR CONTAINING Dockerfile
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

```
