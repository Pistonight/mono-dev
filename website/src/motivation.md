# Motivation

After creating so many projects across many different languages
(primarily Rust, TypeScript, JavaScript, Python, and C/C++),
I started to have this internal configuration hell, where
I constantly copy build scripts, `package.json`, CI configs,
linter rules, etc, between projects. 

The worst part is, things change. so the "source of truth"
of these configs is basically what project I am currently working
on. These means I never "backport" these improvements to older projects.
When I do need to upgrade other projects to "newer" standards,
I again have to remember which project has the latest standard,
and copy from that.

In the past, I don't often switch between projects. Maybe once or twice
per year. However, another problem started to surface as I created
more and more projects based on TypeScript/Web tech stacks.
Recently I have even started using [`bun`] to run TypeScript on the server,
while 5 years ago I would be disgusted at the idea of running anything
other than blazing fast, optimized, compiled languages on the server (I was a junior
back then). 

As I make these projects, common pattern/code emerge.
At some point, I started creating these internal libraries that 
all my projects would depend on. One of the example is `pure` (https://pure.pistonite.dev),
a pure-TypeScript library to bootstrap a web application with dark mode,
multi-languages, `Result` type, etc. Now, I not only have a configuration
hell, I also have my internal dependency hell!!

The solution might be simple if I only write Rust code, or TypeScript code,
as basically that's what package managers do. However,
keep in mind that I work with multiple language and ecosystems,
often in the same project. For example, my 
[`Breath of the Wild Weapon Modifier Corruption Database`](https://github.com/Pistonite/botw-recipe)
project, had:
- Python for processing BOTW data and generating source code, along with other scripts
- Rust for building the fastest simulator for cooking in BOTW. For comparison, the first
  version of a cooking simulator took 9 hours (all 32 cores) to generate the database.
  My version can do that in under 30 seconds (all 32 cores)
- C/C++ for a Switch mod that generates the same database by calling the function in the game's binary,
  to validate the database
- TypeScript for making a nice frontend for my Rust database

As I take on more and more crazy projects like these, I need to enable config- and code-sharing.
Present-me need to build abstractions for these so future-me doesn't spend all my time copy-pasting
`<ChangeDarkModeButton />` and build scripts all over the place.

Essentially, I need:
- A system to manage dependencies, and enable code-sharing and config-sharing between projects
- A system or standard to build monorepos, like how to define build steps and dependency between
  projects across ecosystem-boundaries

Well, that is exactly what `mono-dev` is. It's not a single tool or system or service.
But a combination of a set of tools, a set of documentations, a set of scripts and config files,
and finally, this website to document everything for future-me to understand.

```admonish danger
Note that, this standard is possible because it's only used by me. I
make assumptions about how a developer (me) works on the project.
While all the source code are available on GitHub and you can feel free
to use them or make PRs, I will not be implementing any fixes to support
scenarios outside of what I use the tools for.

As an example, I will not add a --config-path flag to some tool, because it
assumes the project follows the standard, and the config is defined in the expected
place.

The standard is also unstable. Every update is a breaking update.
```
