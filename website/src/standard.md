# The `mono-dev` Standard

```admonish note
This section contains important information about working on projects that
follows the standard. Please read it all and do the setup necessary if 
you are directed here by contributing guides of my projects.
```

The `mono-dev` standard consists of:
- Tools (i.e. binaries) that must be available globally on the system
  and callable from the command line.
  - Project-specific tools, like build scripts, are not included
- Project structure
- Name convention for build tasks (like `check`, `test`, `fix`, `build`)
- Shared configurations and wrappers that invokes the tools with configurations

The last point - shared configurations, are covered by chapters in the rest of the book:
- Copy-paste instruction for setting up frameworks
- Instruction for setting up CI pipelines
