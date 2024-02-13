import { CommandModule } from "yargs";
import {
  ResolvedConfig,
  LoadConfigArgs,
  withConfig,
  withConfigOptions,
} from "../withConfig";

const commandModule: CommandModule<unknown, LoadConfigArgs> = {
  command: "report",
  builder(args) {
    return withConfigOptions(args)
      .string("name")
      .option("evalResultsQuery", {
        type: "string",
        description: "Query to filer evaluation results.",
      })
      .demandOption("evalResultsQuery")
      .demandOption("name");
  },
  async handler(args) {
    return withConfig(reportCommand, {
      ...args,
    });
  },
  describe: "Report generated data.",
};

export default commandModule;

export const reportCommand = async (
  config: ResolvedConfig
  // other args?
) => {
  // TODO: do stuff
};
