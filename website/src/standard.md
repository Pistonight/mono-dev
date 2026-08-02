# The Standard


Please follow these steps to setup a project locally for development.

## Read the Guidelines
Ensure you have read the [Contributing Guidelines](./standard/pr_guidelines.md) prior
to setting up the project.
Contributing to the project assume you have agreed to everything in the guidelines.

## Prerequisite

> [!IMPORTANT]
> I assume you are familiar with basic workflows for programming and working
> with version control software (i.e. `git`). If not, my projects are not the place
> for you to make your first contribution.

Please ensure you:
1. Know how to run things from a terminal/command line
2. Have `git` installed and know the basic git workflows (clone, commit, push, Pull Request)
3. Have a working editor that supports the Language Server Protocol (LSP). For most people
   this would be [Visual Studio Code](https://code.visualstudio.com/download)


## Setting up your development environment

1. Ensure you have the prerequisites above.
2. Setup the [System Tools](./standard/tools.md)
3. Setup the language-specific tools by following the additional sections below the System Tools page,
   for the language(s) used by the project.
4. Understand the [Project structure](./standard/project_structure.md) and [Task Convention](./standard/task_convention.md)
5. If the project is complicated, follow the setup guide in the project to finish setting up the project (install dependencies, build, etc).
   For simple projects the task convention covers everything (like `task check`, `task build`, `task test`).
