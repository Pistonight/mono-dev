# Task Convention

This section defines a convention for task names, such as 
`check`, `test`, `build`. This way, commands are mapped to mental
tasks in developers' brains and the same commands work everywhere.


## `setup`/`install-cargo-extra-tools`
The `setup` task defines one-time setup on the system. such as pulling
large data or installing extra tools. It's meant to only run once when you clone
the repo and not have to run when updating the repo with `git pull`.

`install-cargo-extra-tools` (aliased `icets`) is a special setup task that installs
`cargo-binstall` and other `cargo-install`-able tools needed for development on the system.



## `install`
The `install` task installs dependencies, syncs dependencies, and setups the package
(like post-install hooks in some ecosystem).

Usually this delegates to installing dependencies with a package manager like `pnpm`.
If no `install` task is present, it means no special install logic is needed.
Either install the project like other projects (for example run `pnpm install` directly
like a regular JS project), or no installing is needed (for example running `cargo build`
or `uv run` will install the dependencies automatically).

## `dev`
The `dev` task is for the inner-most loop development workflow. For example,
it can be starting a dev server for a watch-build-serve loop, or it can start
a watch-build-test loop for non-UI projects.

## `test`
The `test` task runs all the tests in the project. Sometimes there will be multiple
parts of the test runnable through suffixes like `test-lib`, `test-e2e`, etc.

## `check`
The `check` task runs linters and formatters to check code quality.
Run this before making a commit or Pull Request.

> [!NOTE]
> Some people may prefer check/fix to automatically run when they save a file or
> when commiting (known as a pre-commit hook). This is not done for many reasons:
>
> 1. Some checkers/formatters such as gofmt are really aggressive and touches the file
>    in a way that slows the workflow. For example it may remove unused imports/variables.
>    This means you have to write some code that use the import/variable before you can save.
> 2. Consistency and performance: not all ecosystems provide performant formatters and linters,
>    I don't like the feeling when my editor is stuck when I try to save my work.
> 3. Git hooks have well-known security issues and they also slow down the workflow.
     For example commiting becomes slow because it has to run all the checks. This does
     not make sense for the scale of my projects.

## `fix`
Fixs the issues found with `check` automatically. This should always fix all formatting issues.
Some issues are not mechanically fixable (or the recommended fix doesn't always make sense).
Manual fix is required in those cases.


## `build`
The build task produces some artifacts to be published or used outside of the package.
This task can also be used as a baseline for the package to "work" (i.e. not broken).

