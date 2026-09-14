use std::collections::BTreeMap;

use crate::config::{ConfigNode, verbatim};

pub fn transform_html_config(nodes: &mut Vec<ConfigNode>) -> cu::Result<()> {
    let mut properties = [
        ("default-theme", r#""frappe""#),
        ("preferred-dark-theme", r#""frappe""#),
        ("smart-punctuation", r#"true"#),
    ]
    .into_iter()
    .collect::<BTreeMap<_, _>>();
    let mut found_props = false;
    let mut found_css = false;
    let mut check_fn = |node: &mut ConfigNode| {
        match node {
            ConfigNode::KeyValue(k, _) => {
                properties.remove(k.as_str());
            }
            ConfigNode::Section(_, name, nodes) => match name.as_str() {
                "props" => {
                    found_props = true;
                    *nodes = std::mem::take(&mut properties)
                        .iter()
                        .map(|(k, v)| ConfigNode::KeyValue(k.to_string(), v.to_string()))
                        .collect();
                }
                "css" => {
                    found_css = true;
                    *nodes = get_css_config();
                }
                other => {
                    cu::bail!("unknown mono-dev config section html.{other}");
                }
            },
            _ => {}
        }
        Ok(())
    };
    for node in &mut *nodes {
        match node {
            ConfigNode::Table(_, nodes) => {
                for n in nodes {
                    check_fn(n)?;
                }
            }
            flat => check_fn(flat)?,
        }
    }

    if !properties.is_empty() && !found_props {
        let prop_nodes = properties
            .iter()
            .map(|(k, v)| ConfigNode::KeyValue(k.to_string(), v.to_string()))
            .collect();
        nodes.push(ConfigNode::Section(4, "props".to_string(), prop_nodes));
    }
    if !found_css {
        nodes.push(ConfigNode::Section(4, "css".to_string(), get_css_config()));
    }

    Ok(())
}

fn get_css_config() -> Vec<ConfigNode> {
    verbatim![
        r#"    "./theme/extra-css/catppuccin.css","#,
        r#"    "./theme/extra-css/patch.css","#,
        r#"    "./theme/extra-css/tree-sitter.css","#,
    ]
}
