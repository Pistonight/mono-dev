# Go

Go support is experimental

## Check And Fix
```yaml

includes:
  go:
    taskfile: ../mono-dev/task/go.yaml
    internal: true

tasks:
  check:
    cmds:
      - go vet
      - task: go:fmt-check
  fix:
    cmds:
      - go fmt
  
```
