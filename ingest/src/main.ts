import * as yargs from "yargs";

function commandDir<T>(
  argv: yargs.Argv<T>,
  directory: string,
  options?: yargs.RequireDirectoryOptions
): yargs.Argv<T> {
  // Centralize the workaround for commandDir with TS
  return argv.commandDir(directory, {
    extensions: process.env.NODE_ENV === "development" ? ["js", "ts"] : ["js"],
    exclude: /^(?:index|.*\.test)\.[jt]s$/,
    visit(commandModule) {
      return commandModule.default;
    },
    ...options,
  });
}

async function main() {
  const argv = commandDir(yargs.help(), "commands").demandCommand();

  // Accessing this property executes CLI
  argv.argv;
}

main().catch(console.error);
