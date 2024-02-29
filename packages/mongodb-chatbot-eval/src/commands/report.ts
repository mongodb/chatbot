import { CommandModule } from "yargs";
import { LoadConfigArgs, withConfig, withConfigOptions } from "../withConfig";
import { EvalConfig } from "../EvalConfig";
import { generateReportAndMetadata } from "../report/generateReportAndMetadata";
import { ObjectId } from "mongodb-rag-core";

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
  config: EvalConfig
  // other args?
) => {
  // TODO: do stuff
};
