# Motivation

inline rust: 
this is some rust:
```rust`let x: std::thread::Thread = std::thread::spawn(/* stuff */);```
, rust is very good

Test:
```rust

// comment
use dashmap::DashMap;
use lsp_types::{Location, Range, Url};
use ::std::{path::PathBuf, sync::{Arc, RwLock}};

#[derive::a::b(Debug, Clone)]
struct DefSite {
    uri: Url,
    range: Range,
    kind: TokenKind,
}

#[derive::aa::b(Debug, Clone)]
struct DefSite {
    uri: Url,
    range: Range,
    kind: TokenKind,
}

#[derive::aa::bb(Debug, Clone)]
struct DefSite {
    uri: Url,
    range: Range,
    kind: TokenKind,
}

trait DefLookup {
    fn find(&self, name: &str, skip: &Url)
        -> Vec<Location>;
    fn has(&self, name: &str) -> bool;
    fn kind(&self, name: &str, skip: &Url)
        -> Option<TokenKind>;
}

impl<T: DefLookup + ?Sized> DefLookup for Arc<T> {
    fn find(
        &self,
        name: &str,
        skip: &Url,
    ) -> Vec<Location> {
        println!("find");
        self.as_ref().find(name, skip)
    }

    fn has(&self, name: &str) -> bool {
        self.as_ref().has(name)
    }

    fn kind(
        &self,
        name: &str,
        skip: &Url,
    ) -> Option<TokenKind> {
        self.as_ref().kind(name, skip)
    }
}

/// A symbol index kept in sync with editor changes.
#[derive(Debug, Default)]
struct SymbolIndex {
    defs: DashMap<Symbol, Vec<DefSite>>,
    files: DashMap<Url, Vec<Symbol>>,
    roots: RwLock<Vec<PathBuf>>,
}

impl SymbolIndex {
    fn set_roots(&self, roots: Vec<PathBuf>) {
        *self.roots.write().expect("roots lock") = roots;
    }

    fn roots(&self) -> Vec<PathBuf> {
        self.roots.read().expect("roots\n lock").clone()
    }

    fn index<K>(&self, uri: &Url, text: &str, p: &K)
    where
        K: TypeProvider + ?Sized,
        for<'a> K::View<'a>: TokenKnowledge,
    {
        self.remove(uri);
        let defs = top_level_defs(text, p);
        if defs.is_empty() {
            return;
        }

        let mut names = Vec::with_capacity(defs.len());
        for (name, range, kind) in defs {
            let name = Symbol::new(&name);
            self.defs
                .entry(name.clone())
                .or_default()
                .push(DefSite {
                    uri: uri.clone(),
                    range,
                    kind,
                });
            names.push(name);
        }
        self.files.insert(uri.clone(), names);
    }

    fn remove(&self, uri: &Url) {
        let Some((_, names)) = self.files.remove(uri)
        else {
            return;
        };

        for name in names {
            let empty = self.defs
                .get_mut(&name)
                .is_some_and(|mut sites| {
                    sites.retain(|site| &site.uri != uri);
                    sites.is_empty()
                });
            if empty {
                self.defs.remove(&name);
            }
        }
    }
}

impl DefLookup for SymbolIndex {
    fn find(
        &self,
        name: &str,
        skip: &Url,
    ) -> Vec<Location> {
        self.defs.get(name)
            .into_iter()
            .flat_map(|sites| sites.iter())
            .filter(|site| &site.uri != skip)
            .map(|site| Location {
                uri: site.uri.clone(),
                range: site.range,
            })
            .collect()
    }

    fn has(&self, name: &str) -> bool {
        self.defs.contains_key(name)
    }

    fn kind(
        &self,
        name: &str,
        skip: &Url,
    ) -> Option<TokenKind> {
        self.defs.get(name)?
            .iter()
            .find(|site| &site.uri != skip)
            .map(|site| site.kind)
    }
}

```

> [!IMPORTANT]
> Welcome to `mono-dev` - my personal standard for all my projects.
> 
> Continue here if you are interested in the motivation. Otherwise if you are
> looking to contribute to a project of mine, proceed to [Standard](./standard.md)
> to understand the repo structure and tooling I use.

After creating so many projects across many different languages
(primarily Rust, TypeScript, JavaScript, Python, and C/C++),
I started to have this internal configuration hell, where
I constantly copy build scripts, `package.json`, CI configs,
linter rules, etc, between projects. 

The worst part is - things change. So, the "source of truth"
of these configs is basically what project I am currently working
on. These means I either never "backport" these improvements to older projects
or it's a very tedious process when I do so - as I have to copy all the configurations
from a newer project to an older project and wire up everything properly.

This was toleratable in the past when I didn't have many projects,
maybe one new project per year. However, as I make more and more projects
faster and faster, common pattern/code emerge. At some point, I started creating 
these internal libraries that all my projects would depend on. 
One of the example is [`pure`](https://pure.pistonite.dev),
a pure-TypeScript library to bootstrap a web application with dark mode,
multi-languages, `Result` type, etc. Now, I not only have a configuration
hell, I also have my internal dependency hell!!

If I only ever work with one language, say Rust or TypeScript, this might be simple
to solve - create a dev dependency that contains all my build configurations
and common code and publish it to whatever package registry the ecosystem uses.
However, I often work in multiple languages and ecosystems in the *same* project.
For example, my 
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

> [!CAUTION]
> Note that, this standard is possible because it's only used by me. I
> make assumptions about how a developer (me) works on the project.
> While all the source code are available on GitHub and you can feel free
> to use them or make PRs, I will not be implementing any fixes to support
> scenarios outside of what I use the tools for.
>
> As an example, I will not add a --config-path flag to some tool, because it
> assumes the project follows the standard, and the config is defined in the expected
> place.
>
> The standard is also unstable. Every update is a breaking update.
