# Action: GCloud (Pistonite Storage)

[Workflow file](https://github.com/Pistonight/mono-dev/tree/main/actions/pistonstor/action.yml)

Use this action to setup gcloud for Pistonite Storage.

```yaml
    # permissions for gcloud
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: Pistonight/mono-dev/actions/pistonstor@main
```
