# Action: Release

[Workflow file](https://github.com/Pistonight/mono-dev/tree/main/actions/release/action.yml)

Use this action to create release notes automatically and draft a release with artifacts

Uses `RELEASE_NOTES_HEADER.md` and `RELEASE_NOTES_FOOTER.md` in the `.github` directory

```yaml
name: Release
on:
  push:
    tags:
      - v*.*.*

jobs:
  release:
    runs-on: ubuntu-latest
    # permission for publish release
    permissions:
      contents: write
    steps:
      - uses: Pistonight/mono-dev/actions/release@main
        with:
          # optional: download artifacts from a previous workflow
          artifacts-workflow: build.yml
          artifacts-path: packages/server/dist

          # optional: run a task after downloading artifacts
          task: server:package-assets

          # optional: determine how releases are packed
          # by default, each artifact is packed into an archive
          # use pattern with * in the beginning or end to match the artifact
          # name. ** or true matches everything (the default). false disables packing.
          # artifacts that are not packed are not uploaded; use `files` for that
          pack: server-*
          
          # whether to append the version tag to the archive name
          # default is true
          append-version: true

          # optional. if provided, packed archives and `files` will be signed
          # (each file gets a `.sig` file uploaded next to it)
          minisign-key: ${{ secrets.MINISIGN_KEY }}

          # optional: extra files uploaded as-is (not packed)
          # relative to the workspace, globs are supported (e.g. **/*.whl).
          # each entry must match at least one file
          files: |
            path/to/file1.zip
            dist/*.tar.gz

          # default
          tag: ${{ github.ref_name }}
```
