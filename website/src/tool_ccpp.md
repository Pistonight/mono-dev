# C/C++

C/C++ codebase will typically have its own build system. `mono-dev`
on the other hand, ships the formatting config

## Check and Fix
```admonish note
`fd` and `clang-format` are required
```

```yaml
version: '3'

includes:
  ccpp:
    taskfile: ../mono-dev/task/ccpp.yaml
    internal: true

tasks:
  check:
    cmds:
      - task: ccpp:fmt-check

  fix:
    cmds:
      - task: ccpp:fmt-fix
```
