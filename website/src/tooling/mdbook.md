# Mdbook

[`mdbook`](https://github.com/rust-lang/mdBook) is a Rust tool for generating documentation website from Markdown.

## Install theme
`mono-dev` ships a configurator and scripts for theme and preprocessor configuration:
- CSS for [`catppuccin`](https://github.com/catppuccin/catppuccin) themes.
  The theme files are forked and modified from the official catppuccin mdbook theme to my liking.
- [`mdbook-nvim-treesitter`](https://github.com/Pistonite/mdbook-nvim-treesitter) for tree-sitter
  based highlighting, much better than highlight.js

```yaml
version: '3'

includes:
  mdbook:
    taskfile: ../mono-dev/task/mdbook.yaml
    internal: true

tasks:
  install:
    - task: mdbook:config
  dev:
    cmds:
      - rm -rf book
      - shwoop book -w src --host -- {{.TASK_EXE}} build
  build:
    - task: mdbook:call-mdbook
      vars:
        COMMAND: build
```

Template `.gitignore`
```gitignore
/.cache
/book
/theme
```

## Configuration
Run ```bash`task install``` and the `mdbook:config` task will generate a base config.
Edit the `CHANGE ME` fields.

To add `nvim-treesitter` support, add a `#@mono-dev:    nvim-treesitter {}` directive
in the preprocessor config section, then rerun the configurator.

```toml
#@mono-dev:preprocessor {
#@mono-dev:    nvim-treesitter {}
#@mono-dev:}
```
