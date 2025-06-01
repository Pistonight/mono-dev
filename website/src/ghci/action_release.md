# Action: Release

[Workflow file](https://github.com/Pistonight/mono-dev/tree/main/acitons/release/action.yml)

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

          files: |
            path/to/file1.zip
            path/to/file2.tar.gz

          # default
          tag: ${{ github.ref_name }}
```
