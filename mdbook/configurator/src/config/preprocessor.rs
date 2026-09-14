use crate::config::{ConfigNode, verbatim};

pub fn transform_preprocessor_config(nodes: &mut Vec<ConfigNode>) -> cu::Result<()> {
    for node in &mut *nodes {
        if let ConfigNode::Section(_, name, nodes) = node {
            if name == "nvim-treesitter" {
                *nodes = get_nvim_treesitter_config();
            }
        }
    }

    Ok(())
}

fn get_nvim_treesitter_config() -> Vec<ConfigNode> {
    verbatim![
        r#"[preprocessor.nvim-treesitter]"#,
        r#"command = "./.cache/mono-dev-mdbook/mdbook-nvim-treesitter""#,
    ]
}
