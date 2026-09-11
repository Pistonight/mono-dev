
mod parsing;
use parsing::*;
mod html;
mod preprocessor;
mod driver;
pub use driver::*;


macro_rules! verbatim {
    ($($line:literal),* $(,)*) => {
        vec![ $($crate::config::parsing::ConfigNode::verbatim($line)),* ]
    }
}
pub(crate) use verbatim;



