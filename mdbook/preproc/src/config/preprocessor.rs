use std::path::Path;

use cu::pre::*;

use crate::config::{ConfigNode, verbatim};

pub fn transform_preprocessor_config(
    nodes: &mut Vec<ConfigNode>,
    dir: &str,
    task_exe: &str,
) -> cu::Result<()> {
    let mut found_preproc1 = false;
    for node in &mut *nodes {
        match node {
            ConfigNode::Section(_, name, nodes) => match name.as_str() {
                "preproc1" => {
                    if !found_preproc1 {
                        found_preproc1 = true;
                        *nodes = get_preproc1_config();
                    }
                }
                "tree-sitter" => {
                    cu::check!(
                        transform_tree_sitter_config(nodes, dir, task_exe),
                        "failed to transform tree-sitter config"
                    )?;
                }
                other => {
                    cu::bail!("unknown mono-dev config section preprocessor.{other}");
                }
            },
            ConfigNode::Table(header, _) => {
                if header.trim() == "[preprocessor.mdmd-preproc1]" {
                    found_preproc1 = true;
                }
            }
            _ => {}
        }
    }

    if !found_preproc1 {
        nodes.push(ConfigNode::Section(
            4,
            "preproc1".to_string(),
            get_preproc1_config(),
        ));
    }

    Ok(())
}
pub fn transform_tree_sitter_config(
    nodes: &mut Vec<ConfigNode>,
    dir: &str,
    task_exe: &str,
) -> cu::Result<()> {
    let mut found_base = false;
    for node in &mut *nodes {
        match node {
            ConfigNode::Section(_, name, nodes) => {
                let name = name.as_str();
                if name == "-" {
                    // base config
                    if !found_base {
                        found_base = true;
                        *nodes = get_tree_sitter_base_config();
                    }
                    continue;
                }
                let name = name.trim_end_matches('/');
                let (name, repo) = if name.contains('/') {
                    // git repo..
                    let repo = name;
                    // unwrap: contains -------------^
                    let i = repo.rfind('/').unwrap();
                    let name = &repo[i + 1..];
                    let name = name.strip_prefix("tree-sitter-").unwrap_or(name);
                    (name, repo.to_string())
                } else {
                    // known language names
                    let entity = match name {
                        "yaml" => "tree-sitter-grammars",
                        "json5" => "Joakker",
                        _ => "tree-sitter"
                    };
                    ( name,
                        format!("https://github.com/{entity}/tree-sitter-{name}"),
                    )
                };
                if name.is_empty() {
                    cu::bail!("tree sitter parser name cannot be empty");
                }
                if name
                    .chars()
                    .any(|c| c != '-' && c != '_' && !c.is_ascii_alphanumeric())
                {
                    cu::bail!("not a valid tree sitter parser name: {name}");
                }
                let task_exe = Path::new(task_exe);
                let child= task_exe
                // let (child, bar, _) = task_exe
                    .command()
                    .env("MDMDBOOK_TREE_SITTER_NAME", name)
                    .env("MDMDBOOK_TREE_SITTER_REPO", repo)
                    .current_dir(dir)
                    // .stdoe(cu::pio::spinner(format!(
                    //     "resolve tree-sitter parser for {name}"
                    // )).print())
                    .all_inherit()
                    .args(["resolve-tree-sitter-parser"])
                    .spawn()?;
                cu::check!(
                    child.wait_nz(),
                    "failed to resolve tree-sitter parser for {name}"
                )?;
                // bar.done();

                let installed_path_rel = format!("./.cache/mono-dev-mdbook/tree-sitter-installed/{name}");
                let installed_path = Path::new(dir).join(&installed_path_rel);
                let parser_path = installed_path.join("parser.so");
                if !parser_path.exists() {
                    cu::bail!("unexpected: parser.so not found after compiling: '{}'", parser_path.display());
                }

                *nodes = get_tree_sitter_language_config(name, &installed_path_rel, 
                    installed_path.join("queries/injections.scm").exists(),
                    installed_path.join("queries/locals.scm").exists(),
                );
                
            }
            ConfigNode::Table(header, _) => {
                if header.trim() == "[preprocessor.tsitter]" {
                    found_base = true;
                }
            }
            _ => {}
        }
    }
    if !found_base {
        nodes.push(ConfigNode::Section(
            8,
            "-".to_string(),
            get_tree_sitter_base_config(),
        ));
    }
    Ok(())
}

fn get_preproc1_config() -> Vec<ConfigNode> {
    verbatim![
        r#"[preprocessor.mdmd-preproc1]"#,
        r#"renderers = ["html"]"#,
        r#"command = "./.cache/mono-dev-mdbook/mdmdbook-prproc preproc1""#,
    ]
}

fn get_tree_sitter_base_config() -> Vec<ConfigNode> {
    verbatim![
        r#"[preprocessor.tsitter]"#,
        r#"renderers = ["html"]"#,
        r#"command = "./.cache/mono-dev-mdbook/mdbook-tsitter""#,
        r#"inject = true"#,
    ]
}

fn get_tree_sitter_language_config(
    name: &str,
    base_path: &str, injections: bool, locals: bool
) -> Vec<ConfigNode> {
    let mut out = vec![
        ConfigNode::Verbatim(format!(r#"[preprocessor.tsitter.languages.{name}]"#)),
        ConfigNode::Verbatim(format!(r#"library = "{base_path}/parser.so""#)),
        ConfigNode::Verbatim(format!(r#"highlights = "{base_path}/queries/highlights.scm""#)),
    ];
    if injections {
        out.push(
        ConfigNode::Verbatim(format!(r#"injections = "{base_path}/queries/injections.scm""#)),
        );
    }
    if locals {
        out.push(
            ConfigNode::Verbatim(format!(r#"injections = "{base_path}/queries/locals.scm""#)),
        );
    }
    out
}
