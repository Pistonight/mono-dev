use cu::pre::*;

mod config;

#[derive(Debug, clap::Parser, AsRef)]
struct Cli {
    /// The absolute path to directory containing book.toml
    #[clap(long, default_value = ".")]
    dir: String,

    /// The path to the task executable
    #[clap(long, default_value = "task")]
    task_exe: String,

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

    /// Run the first preprocessor
    Preproc1 {
        #[clap(subcommand)]
        command: Option<PreprocessorCommand>,
    },
}

#[derive(Debug, clap::Parser)]
enum PreprocessorCommand {
    Supports { renderer: String },
}

#[cu::cli]
fn main(args: Cli) -> cu::Result<()> {
    cu::lv::disable_print_time();
    match &args.command {
        Command::Config => config::process_config(&args),
        Command::Preproc1 { command } => {
            if command.is_some() { return Ok(())}
            std::io::copy(&mut std::io::stdin(), &mut std::io::stdout())?;
            Ok(())
        }
    }
}
