use cu::pre::*;

static MONO_DEV_DIRECTIVE: &str = "#@mono-dev:";

#[derive(Debug)]
pub struct Config {
    pub nodes: Vec<ConfigNode>,
}

#[derive(Debug)]
pub enum ConfigNode {
    /// A TOML table: [path] followed by nodes until the next table start
    Table(String, Vec<ConfigNode>),
    /// A key value `key = value`, note the value is not parsed
    KeyValue(String, String),
    /// A mono-dev section, # @mono-dev:section { to }
    Section(usize, String, Vec<ConfigNode>),
    /// A verbatim line (raw string as-is)
    Verbatim(String),
}

impl Config {
    pub fn parse(raw: &str) -> cu::Result<Self> {
        let mut iter = raw.lines().enumerate().map(|(i, l)| (i + 1, l));
        let mut nodes = vec![];
        let mut peek = iter.next();
        while let Some(node) = ConfigNode::parse(&mut peek, &mut iter)? {
            nodes.push(node);
        }
        Ok(Self { nodes })
    }
}

impl ConfigNode {
    pub fn parse<'a, I: Iterator<Item = (usize, &'a str)>>(
        peek: &mut Option<(usize, &'a str)>,
        iter: &mut I,
    ) -> cu::Result<Option<Self>> {
        // dbg!(&peek);
        let (line_num, peeked) = cu::some!(peek.as_ref());
        let node = match Self::peek_type(peeked) {
            ConfigNodeType::Table => {
                let header = peeked.to_string();
                let mut nodes = vec![];
                *peek = iter.next();
                while let Some((_, line)) = &peek {
                    // let line_num = *line_num;
                    match Self::peek_type(line) {
                        ConfigNodeType::KeyValue(key, value) => {
                            *peek = iter.next();
                            nodes.push(Self::KeyValue(key.to_string(), value.to_string()));
                        }
                        ConfigNodeType::Verbatim => {
                            let line = line.to_string();
                            *peek = iter.next();
                            nodes.push(Self::Verbatim(line));
                        }
                        ConfigNodeType::Empty => {
                            *peek = iter.next();
                            nodes.push(Self::Verbatim("".to_string()));
                            break;
                        }
                        ConfigNodeType::Table => {
                            break;
                        }
                        ConfigNodeType::SectionStart(_, _)
                        | ConfigNodeType::SectionStartEnd(_, _) => {
                            // nested section
                            let node = Self::parse(peek, iter)?;
                            let node =
                                cu::check!(node, "unexpected None node during section start")?;
                            nodes.push(node);
                        }
                        ConfigNodeType::SectionEnd => {
                            break;
                        }
                    }
                }
                Self::Table(header, nodes)
            }
            ConfigNodeType::KeyValue(key, value) => {
                *peek = iter.next();
                Self::KeyValue(key.to_string(), value.to_string())
            }
            ConfigNodeType::SectionStart(indent, name) => {
                cu::debug!("section start: {name}");
                let name = name.to_string();
                let mut nodes = vec![];
                let mut found_end = false;
                let start_num = *line_num;
                *peek = iter.next();
                while let Some((_, line)) = &peek {
                    if let ConfigNodeType::SectionEnd = Self::peek_type(line) {
                        *peek = iter.next();
                        // dbg!(peek);
                        found_end = true;
                        break;
                    }
                    let node = Self::parse(peek, iter)?;
                    let node = cu::check!(node, "unexpected None node in the middle of section")?;
                    nodes.push(node);
                }
                if !found_end {
                    cu::bail!("unclosed section started on line {start_num}");
                }
                Self::Section(indent, name, nodes)
            }
            ConfigNodeType::SectionStartEnd(indent, name) => {
                cu::debug!("same-line section start: {name}");
                let name = name.to_string();
                *peek = iter.next();
                Self::Section(indent, name, vec![])
            }
            ConfigNodeType::SectionEnd => {
                cu::bail!("line {line_num}: extra section close");
            }
            ConfigNodeType::Verbatim => {
                let line = peeked.to_string();
                *peek = iter.next();
                Self::Verbatim(line)
            }
            ConfigNodeType::Empty => {
                *peek = iter.next();
                Self::Verbatim("".to_string())
            }
        };
        Ok(Some(node))
    }

    fn peek_type(s: &str) -> ConfigNodeType<'_> {
        let trimmed = s.trim();
        if trimmed.is_empty() {
            return ConfigNodeType::Empty;
        }
        if s.starts_with('[') {
            return ConfigNodeType::Table;
        }
        if let Some(s) = s.strip_prefix(MONO_DEV_DIRECTIVE) {
            let s_trimmed = s.trim();
            if s_trimmed == "}" {
                return ConfigNodeType::SectionEnd;
            }
            let has_end = s.ends_with('}');

            let section = s
                .trim_end_matches('}')
                .trim_end()
                .trim_end_matches('{')
                .trim_end();
            let section_trimmed = section.trim_start();
            let indent = section.len() - section_trimmed.len();
            if has_end {
                return ConfigNodeType::SectionStartEnd(indent, section_trimmed);
            }
            return ConfigNodeType::SectionStart(indent, section_trimmed);
        }
        if trimmed.starts_with('#') {
            return ConfigNodeType::Verbatim;
        }
        match s.split_once('=') {
            None => ConfigNodeType::Verbatim,
            Some((k, v)) => ConfigNodeType::KeyValue(k.trim_end(), v.trim_start()),
        }
    }

    pub fn verbatim(line: &str) -> Self {
        Self::Verbatim(line.to_string())
    }

    pub fn serialize(self, out: &mut Vec<String>) {
        match self {
            ConfigNode::Table(header, nodes) => {
                out.push(header);
                for n in nodes {
                    n.serialize(out);
                }
            }
            ConfigNode::KeyValue(k, v) => {
                out.push(format!("{k} = {v}"));
            }
            ConfigNode::Section(indent, name, nodes) => {
                out.push(format!(
                    "{MONO_DEV_DIRECTIVE}{space:indent$}{name} {{",
                    space = ""
                ));
                for n in nodes {
                    n.serialize(out);
                }
                out.push(format!("{MONO_DEV_DIRECTIVE}{space:indent$}}}", space = ""));
            }
            ConfigNode::Verbatim(line) => {
                out.push(line);
            }
        }
    }
}

enum ConfigNodeType<'a> {
    Table,
    KeyValue(&'a str, &'a str),
    SectionStart(usize, &'a str),
    SectionStartEnd(usize, &'a str),
    SectionEnd,
    Empty,
    Verbatim,
}
