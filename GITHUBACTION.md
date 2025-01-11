# Recipes for GitHub Actions

Copy paste these to the projects' CI

## Seciont 0: Name
Give it a name
```yaml
name: Build
on:
```

## Section 1: Trigger
### PR Builds
Run in PR; Doesn't have access to repo's secrets
```yaml
  pull_request:
    branches:
      - main
```

### Main CI
Run in main branch after merging. Has access to secrets
```yaml
  push:
    branches:
      - main
```

### Manual
Manually deploy something.. auto-deploy should use the `push main` trigger
```yaml
  workflow_dispatch:
    inputs:
      version:
        description: "Version tag of the image (e.g. 0.2.0-beta)"
        required: true
```

## Section 1.9: Pre-baked Jobs
### Deploy to Pages
```yaml
  deploy-to-pages:
    name: Deploy To Pages
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

## Section 2: Jobs
Add a `jobs` section
```yaml
jobs:
```
### Single Platform
```yaml
  change-me:
    name: Change Me
    runs-on: ubuntu-latest
    steps:
```
### Multiple Platforms
```yaml
  change-me:
    name: Change Me
    strategy: { matrix: { os: [ ubuntu-latest, macos-latest, windows-latest ] } }
    runs-on: ${{ matrix.os }}
```
### Matrix
```yaml
  change-me:
    name: Change Me
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
```

### Permissions
#### Publish Image
```yaml
    permissions:
      contents: read
      packages: write
```

#### Publish Release
```yaml
    permissions:
      contents: write
```
    
## Section 2: Steps - Setup
```yaml
    steps:
```
### Basic
```yaml
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
          # submodules: true
      - uses: arduino/setup-task@v2
        with:
          version: 3.x
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```
### Node & pnpm
```yaml
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
```
### Rust & cargo tools
```yaml
      - uses: dtolnay/rust-toolchain@stable
        with:
          # targets: wasm32-unknown-unknown
      - uses: Swatinem/rust-cache@v2
```
```yaml
      - uses: baptiste0928/cargo-install@v3
        with:
          crate: wasm-pack
          #features: foo
```
### Python & pip
```yaml
      - uses: actions/setup-python@v5
        with:
          python-version: '3.13'
```
```yaml
      - uses: BSFishy/pip-action@v1
        with:
          packages: |
            package1
            package2
```
### Go
```yaml
      - uses: actions/setup-go@v5
```

## Section 3: Step - Run the thing

```yaml
      - run: task xxxx
```
With env
```yaml
      - run: task xxxx
        env:
          TOKEN: ${{ secrets.MY_TOKEN }}
```
Directory
```yaml
      - run: task xxxx
        working-directory: yyy
```

## Section 4: Upload
### Artifacts
```yaml
      - uses: actions/upload-artifact@v4
        with:
          path: dist/foo
          name: foo
          retention-days: 3
```
### Pages
```yaml
      - uses: actions/upload-pages-artifact@v3
        with:
          path: packages/app/dist
          retention-days: 3
```

## Section 5: Packaging
### Download Artifacts
```yaml
      - run: mkdir -p package
      - uses: dawidd6/action-download-artifact@v6
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          workflow: CHANGEME.yml
          commit: ${{ github.sha }}
          path: package
```
### Download Release
```yaml
      - uses: robinraju/release-downloader@v1
        with:
          tag: CHANGEME
          fileName: CHANGEME.7z
          out-file-path: package
          extract: false
```
### Draft Release with Notes
```yaml
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
```
### Docker
Set these on the workflow level. Also need `version` in the dispatch inputs (see above)
```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
```

Steps:
```yaml
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/setup-buildx-action@v3
      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha
            type=sha,format=long
            type=raw,value=${{ github.event.inputs.version }}
            type=raw,value=latest
      - uses: docker/build-push-action@v5
        with:
          push: true
          context: CHANGE TO PATH WITH Dockerfile
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```
