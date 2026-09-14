use cu::pre::*;

mod config;

#[derive(Debug, clap::Parser, AsRef)]
struct Cli {
    /// The absolute path to directory containing book.toml
    #[clap(long, default_value = ".")]
    dir: String,

    #[clap(subcommand)]
    command: Command,

    #[clap(flatten)]
    #[as_ref]
    common: cu::cli::Flags,
}

#[derive(Debug, clap::Parser)]
enum Command {
    /// Configure the book project
    Config,
}

#[cu::cli]
fn main(args: Cli) -> cu::Result<()> {
    cu::lv::disable_print_time();
    config::process_config(&args)?;
    Ok(())
}
