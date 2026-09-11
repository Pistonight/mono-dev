use std::path::Path;

use cu::pre::*;
use similar::ChangeTag;

use crate::config::{html, preprocessor, Config, ConfigNode};

pub fn process_config(cli: &crate::Cli) -> cu::Result<()> {
    let path = Path::new(&cli.dir).join("book.toml");
    let book_toml_raw = if path.exists() {cu::fs::read_string(&path)? } else {
           include_str!("../../book.template.toml").to_string()
    };
    let old_lines = book_toml_raw
        .lines()
        .map(|x| x.to_string())
        .collect::<Vec<_>>();
    let mut book_toml = cu::check!(Config::parse(&book_toml_raw), "failed to parse book.toml")?;
    cu::trace!("{book_toml:#?}");
    cu::check!(
        transform_config(&mut book_toml, &cli),
        "failed to transform config"
    )?;
    let mut serialized = vec![];
    for n in book_toml.nodes {
        n.serialize(&mut serialized);
    }
    let diffs = similar::capture_diff_slices(similar::Algorithm::Myers, &old_lines, &serialized);
    let mut changed = false;
    let mut changes = vec![];
    for op in diffs {
        for change in op.iter_changes(&old_lines, &serialized) {
            if change.tag() != ChangeTag::Equal {
                changed = true;
            }
            changes.push(change);
        }
    }
    if changed {
        let ci = is_ci();
        for c in changes {
            match c.tag() {
                ChangeTag::Equal => {
                    if ci || cu::lv::D.enabled() {
                        cu::print!("   {}", c.value());
                    }
                }
                ChangeTag::Delete => {
                    cu::error!("-- {}", c.value());
                }
                ChangeTag::Insert => {
                    cu::progress("")
                        .spawn()
                        .done_with_message(&format!("++ {}", c.value()));
                }
            }
        }
        if ci {
            cu::bail!("changes required in book.toml!");
        }
        cu::fs::write(path, serialized.join("\n"))?;
        cu::print!("updated book.toml");
    } else {
        cu::print!("book.toml is up-to-date");
    }

    Ok(())
}

fn transform_config(config: &mut Config, cli: &crate::Cli) -> cu::Result<()> {
    for node in &mut config.nodes {
        if let ConfigNode::Section(_, name, node) = node {
            match name.as_str() {
                "preprocessor" => {
                    cu::check!(
                        preprocessor::transform_preprocessor_config(node, &cli.dir, &cli.task_exe),
                        "failed to transform preprocessor section"
                    )?;
                }
                "html" => {
                    cu::check!(
                        html::transform_html_config(node),
                        "failed to transform html section"
                    )?;
                }
                other => {
                    cu::bail!("unknown mono-dev config section {other}");
                }
            }
        }
    }
    Ok(())
}

pub fn is_ci() -> bool {
    !cu::env_var("CI").unwrap_or_default().is_empty()
}
