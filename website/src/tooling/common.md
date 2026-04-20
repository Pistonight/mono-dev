# Common

## Common Tasks
Each monorepo has 2 common tasks in the root: `list` and `exec`.

The usage is
```
task list                     # same as task --list
task list -- <package>        # list tasks from <package>
task exec -- <package>:<task> # execute <task> in <package>
```

The alias for `list` is `ls` and for `exec` is `x`

#### Template: root `Taskfile.yml`

```yaml
version: '3'

includes:
  common:
    taskfile: ./mono-dev/task/common.yaml
    flatten: true
    optional: true
```

