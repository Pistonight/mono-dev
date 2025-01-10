# mono-dev
This repo is for myself to align on common tools and practices used in my projects.
(a.k.a dependency hell for config files).

## Technologies
For details on what technologies/programs are used and why, see [DOWNSTREAM.md](./DOWNSTREAM.md#technologies)

## Standard
For details on how to use the technologies, see [STANDARD.md](./STANDARD.md)

## Enablement
There are 3 ways `mono-dev` is enabled for a project

### Monorepo - installed as a submodule
Add the submodule
```bash
mkdir -p packages
magoo install https://github.com/Pistonight/mono-dev packages/mono-dev --branch main --name mono-dev
```

(PNPM-only) Add to workspace (`pnpm-workspace.yaml`)
```yaml
packages:
- packages/mono-dev
```

(PNPM-only) Add `magoo install` to root level `install` task so
submodules are updated before pnpm install
```yaml
tasks:
  install:
    desc: Install NPM modules
    cmds:
      - magoo install
      - pnpm install
```

### Singlerepo - standalone JS project
This applies if both are true:
- The project is not meant to be included in a monorepo, as a package
- The project uses JS ecosystem

If that's the case, it's easier to just `pnpm add` the project
```bash
pnpm add https://github.com/Pistonight/mono-dev#main
```

### Singlerepo - other
Otherwise, clone `mono-dev` to a gitignored place and use it

Add to .gitignore
```
/mono-dev
```

Add a task
```yaml
tasks:
  install:
    cmds:
      - rm -rf mono-dev
      - git clone https://github.com/Pistonight/mono-dev --depth 1
```

Run it
```bash
task install
```

