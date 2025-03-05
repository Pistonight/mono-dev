# Task Convention

This section defines a convention for task names, such as 
`check`, `test`, `build`.

Note that these are just a recommendation, not a limitation.
Names outside of the ones defined here can still be used.

## Task Description
`task` has a feature where a task can be given a description. Only
tasks that have description will show up when you `task --list`

```yaml
tasks:
  check:
    desc: Check for issues
    cmds:
      - cargo check
```

Because of the Convention, common task names like `check` and `fix`
don't need to have their description repeated. Developers should
expect when they run `check`, a set of linters will run.

## Suffixes
If there are multiple of one type of task, such as `install`ing multiple
things. The tasks should be defined with a suffix after `-`. For example
`install-deps`

## Tasks

#### `list` and `exec` (`x`)
The root level of a monorepo has `list` and `exec` tasks:
- `list`: List the tasks of the root level or of a package
- `exec`: Execute a task from a package

The usage is:
```
task list              # same as task --list
task list -- <package> # list tasks from <package>
task exec -- <package>:<task> # execute <task> in <package>
```

These are defined in `task/common.yaml`, and should be included like this:
```yaml
includes:
  common:
    taskfile: ./packages/mono-dev/task/common.yaml
    flatten: true
    optional: true
```

#### `install`
At the root level, the `install` task should be defined to download
external dependencies, and make changes to the downloaded packages (a step
typically known as post-install hooks.

At package level, the `install` task can have the same functionality as a
post-install hook. Essentially, it is the script to run to setup the package
for local development.

This pattern is common at the root level:
```yaml
tasks:
  install:
    cmds:
      - magoo install
      - pnpm install
      - task: post-install
  install-ci:
    cmds:
      - pnpm install --frozen-lockfile
      - task: post-install
  post-install:
    cmds:
      - task: my-package:install
```

The root should also define a `install-cargo-extra-tools` tasks
to install the necessary development tools that can be installed with `cargo`

#### `pull`
Like `install`, `pull` indicates downloading data externally. `pull`
should be used for things that only needs to be setup once (or infrequently).
These typically include assets, data packs or generated files stored outside of the repo.

#### `push`
This is the opposite of `pull` - Uploading assets, data packs or generated files to external location.

A related task is `git-push`, typically used in atomrepos to set the correct remote address before calling `git push`

#### `dev`
The `dev` task starts the most common inner-loop development workflow.
This is typically used for running a process that watches for changes and re-build/re-test
the code.

#### `check`
Checks for code issues with linter/formater. Even though `build`
may still check the code internally in the compilers. `check` is not meant to emit any files (unlike `build`)

#### `fix`
Fixs the issues found with `check` automatically. This should always
include automatically fixing all formatting issues.

#### `test`
Run the tests. This sits somewhere in between `check` and `build`, as `check` is most often
static checks. `test` however should actually run the code and run assertion on the outcome.

#### `build`
Build should produce assets to be used outside of this package. Note the word *outside*.
A task that generates code for use within the package should be part of `install`, not `build`

