# Common

Each monorepo should include these common tasks at the root level
by including the following in the root `Taskfile.yml`

```yaml
includes:
  common:
    taskfile: ./packages/mono-dev/task/common.yaml
    flatten: true
    optional: true
```

The usage is
```
task list                     # same as task --list
task list -- <package>        # list tasks from <package>
task exec -- <package>:<task> # execute <task> in <package>
```

The alias for `list` is `ls` and for `exec` is `x`
