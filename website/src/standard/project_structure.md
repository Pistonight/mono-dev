# Project Structure

Each project should either be a single repo (for simple projects) or a monorepo (for more complex projects).

## Single repo

A typical repo contains:
- A source directory, usually `src`
- Dependency directories, such as `node_modules` which are usually `gitignore`-ed
- Target directories, like `target` or `dist` which are usually also `gitignore`-ed
- `mono-dev` directory, usually at `node_modules/mono-dev` (for TS/JS projects)
  or `mono-dev` at root (for other projects).
- `Taskfile.yml` and other configuration files at repo root.

All `task` commands can be run from the root of the repo (or any subdirectories).

## Monorepo
This is common for large projects, where multiple small projects and
external dependencies are integrated.

Instead of a single source directories, a monorepo contains multiple packages,
which are different subsystems for the project. Each package lives
at `packages/<package_name>` and its structure is a lot like a single repo.

The root of a monorepo also contains:
- Workspace configuration such as `pnpm-workspace.yaml` or `Cargo.toml`.
  All dependency versions should be managed by the workspace and avoid
  declaring individual versions inside the packages.
- A `Taskfile.yml` for root level tasks.

`task` commands can be run at package level (in the directory for one package)
to run a task just for that package, or at repo level which may invoke commands
from multiple packages.

The root level `Taskfile.yml` also contains an `exec` task that you can use
to run a package task at the root level:

```
task exec -- <package>:<task>
# x is an alias for exec
task x -- <package>:<task>
```
