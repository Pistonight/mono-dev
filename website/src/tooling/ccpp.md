# C/C++

> [!NOTE]
> This chapter is mainly documentation for myself as a single source of truth
> for configurations.
> 
> If you are looking for setup documentation for C/C++ projects, see [here](../standard/tools.html#cc)

#### Template: `Taskfile.yml`

```yaml
version: '3'

includes:
  ccpp:
    taskfile: ../mono-dev/task/ccpp.yaml
    internal: true
    optional: true

tasks:
  check:
    cmds:
      - task: ccpp:clang-tidy
      - task: ccpp:fmt-check

  fix:
    cmds:
      - task: ccpp:fmt-fix
```
