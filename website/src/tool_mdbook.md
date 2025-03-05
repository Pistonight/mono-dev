# Mdbook

[`mdbook`](https://github.com/rust-lang/mdBook) is a Rust tool for generating documentation website from Markdown.

## Install theme
`mono-dev` ships a mdbook template with [`catppuccin`](https://github.com/catppuccin/catppuccin) themes.
The theme files are forked and modified from the official catppuccin mdbook theme to my liking.

```yaml
version: '3'

includes:
  mdbook:
    taskfile: ../mono-dev/task/mdbook.yaml
    internal: true

tasks:
  install:
    cmds:
      - task: mdbook:install-theme-monorepo
```
```admonish warning
Because the task needs to copy theme files from `mono-dev`, it needs to
know where it is. the `-monorepo` suffix uses `../mono-dev`
```

Also ignore the generated `theme` directory
