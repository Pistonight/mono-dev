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
      - task: mdbook:install-theme
        vars:
          MONO_DEV: mono-dev # path to mono-dev
          MDBOOK_TARGET: packages/book # path to the mdbook project
```

Also ignore the generated `theme` directory
