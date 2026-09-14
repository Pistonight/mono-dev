mod parsing;
use parsing::*;
mod driver;
mod html;
mod preprocessor;
pub use driver::*;

macro_rules! verbatim {
    ($($line:literal),* $(,)*) => {
        vec![ $($crate::config::parsing::ConfigNode::verbatim($line)),* ]
    }
}
pub(crate) use verbatim;
