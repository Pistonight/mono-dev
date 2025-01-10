# Contributing to a downstream project

## Setup your environment
If this is the first time contributing to one of my projects following
the `mono-dev` standard, see [here](./DOWNSTREAM.md#technologies) for
what you need to install on your system.

If you are a returning contributor, but contributing to a project
with a different language or after a long time, please also double
check the link in case anything changed. (And thank you for your
contribution <3)

## Setup up the repo
1. Check you have everything installed from the previous section,
   and any extra tools mentioned in the project
2. Clone the repo
    ```bash
    git clone <REPO>
    cd <REPO>
    ```
3. Install additional tools with `cargo` (if the task doesn't exist then there's no
   additional tools needed)
    ```bash
    task icets
    ```
4. Install and setup other dependencies
    ```bash
    task install
    ```

To update the repo after merging upstream, run `task install`

## Making a change
My projects does not retrict on what IDE/editor you have to use.
Use whatever you like to change the files.

## Testing a change
You can generally run `task dev` to run the inner-loop workflow in watch mode
(meaning you get feedback as you change the file, whether it's UI refresh, test re-run, etc)

You can also run `task test` to run the tests.

If it's a monorepo, you can run these commands only in the package that you are touching.

## Before PR
To make the process as efficient as possible, make sure you have tested the changes.
Use `task check`, `task fix`, `task test`, and `task build` to help you.

The same checks are run in CI. If CI fails, fix it with a command or manually.
I don't use any git hooks.

