# Action: Release

[Workflow file](https://github.com/Pistonight/mono-dev/tree/main/actions/release/action.yml)

Use this action to create release notes automatically and draft a release with artifacts

Uses `RELEASE_NOTES_HEADER.md` and `RELEASE_NOTES_FOOTER.md` in the `.github` directory

```yaml
    # permission for publish release
    permissions:
      contents: write
    steps:
      - uses: Pistonight/mono-dev/actions/release@main
        with:
          # optional: download artifacts from a previous workflow
          artifacts-workflow: build.yml
          artifacts-name: packages/server/dist

          # optional: run a task after downloading artifacts
          task: server:package-assets

          # optional: determine how releases are packed
          # by default, each artifact is packed into an archive
          # use pattern with * in the beginning or end to match the artifact
          # name. ** or true matches everything (the default). false disables packing
          # and only files in `files` are uploaded
          pack: server-*
          
          # whether to append the version tag to the archive name
          # default is true
          append-version: true

          # optional. if provided, release artifacts will be signed
          minisign-key: ${{ secrets.MINISIGN_KEY }}

          files: |
            path/to/file1.zip
            path/to/file2.tar.gz

          # default
          tag: ${{ github.ref_name }}
```
