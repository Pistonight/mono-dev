# Common

> [!NOTE]
> This chapter is mainly documentation for myself as a single source of truth
> for configurations.
> 
> If you are looking for setup documentation, see [Standard](./standard.md)

#### Template: root `Taskfile.yml`

```yaml
version: '3'

includes:
  common:
    taskfile: ./mono-dev/task/common.yaml
    flatten: true
    optional: true
```

