import { CommandModule } from "yargs";
import { LoadConfigArgs, withConfig, withConfigOptions } from "../withConfig";
import { EvalConfig } from "../EvalConfig";

const commandModule: CommandModule<unknown, LoadConfigArgs> = {
  command: "evaluate",
  builder(args) {
    return withConfigOptions(args)
      .string("name")
      .option("generatedDataQuery", {
        type: "string",
        description: "Query to filter generated data.",
      })
      .demandOption("generatedDataQuery")
      .demandOption("name");
  },
  async handler(args) {
    return withConfig(evaluateCommand, {
      ...args,
    });
  },
  describe: "Evaluate generated data.",
};

export default commandModule;

export const evaluateCommand = async (
  config: EvalConfig
  // other args?
) => {
  // TODO: do stuff
};
