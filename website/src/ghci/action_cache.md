# Action: Permanent Cache

[Workflow file](https://github.com/Pistonight/mono-dev/tree/main/actions/permanent-cache/action.yml)

Use this action to permanently cache a directory until manually busted,
with a task to generate the data to cache if miss

```yaml
      - uses: Pistonight/mono-dev/actions/permanent-cache@main
        with:
          path: | 
            path/to/cache/dir1
            path/to/cache/dir2
          key: my-cache
          version: v1
          # task to run to generate the data to cache (task exec --)
          task: generate-data

          # If the runner is github hosted or blacksmith
          runner: blacksmith
```
