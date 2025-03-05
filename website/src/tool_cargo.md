# Rust (Cargo)

## Check and Fix
`mono-dev` provides wrapper for clippy with common clippy flags

```yaml
version: '3'

includes:
  cargo:
    taskfile: ../mono-dev/task/cargo.yaml
    internal: true

tasks:
  check:
    cmds:
      - task: cargo:clippy-all
      - task: cargo:fmt-check

  fix:
    cmds:
      - task: cargo:fmt-fix
```

```admonish note
Clippy fix is not automated, because IMO sometimes the suggestions
lead to worse code style and should be ignored.
```

For other `clippy` options, including feature flags and targets,
see the included Taskfile.

## Test
There's no wrapper for test - just run `cargo test`
