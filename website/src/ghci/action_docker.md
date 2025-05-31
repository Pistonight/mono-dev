# Action: Docker

[Workflow file](https://github.com/Pistonight/mono-dev/tree/main/acitons/docker-image/action.yml)

Use this action to download artifacts from a previous workflow,
build a docker image, and publish it to GitHub Packages.

```yaml
    # permission for publishing docker image
    permissions:
      contents: read
      packages: write
    steps:
      - uses: Pistonight/mono-dev/actions/docker-image@main
        with:
          # optional: download artifacts from a previous workflow
          artifacts-workflow: build.yml
          artifacts-path: packages/server/dist

          # optional: run a task after downloading artifacts
          task: server:package-assets

          image: pistonite/skybook-server
          path: packages/server
          version: ${{ github.events.input.version }}
```
