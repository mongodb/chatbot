import { CommandModule } from "yargs";
import { LoadConfigArgs, withConfig, withConfigOptions } from "../withConfig";
import { EvalConfig } from "../EvalConfig";
import { generateReportAndMetadata } from "../report/generateReportAndMetadata";
import { ObjectId } from "mongodb-rag-core";

interface ReportCommandArgs {
  name: string;
  evalResultsRunId: string;
}

const commandModule: CommandModule<
  unknown,
  LoadConfigArgs & ReportCommandArgs
> = {
  command: "report",
  builder(args) {
    return withConfigOptions(args)
      .option("name", {
        type: "string",
        description: "Name of the report.",
        demandOption: true,
      })
      .option("evalResultsRunId", {
        type: "string",
        description:
          "RunId for a 'evaluate' command that you want to create a report for.",
        demandOption: true,
      });
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
  config: EvalConfig,
  { name, evalResultsRunId }: { name: string; evalResultsRunId: string }
) => {
  // Set up config
  if (!ObjectId.isValid(evalResultsRunId)) {
    throw new Error(
      `'evalResultsRunId' must be a valid ObjectId. Received: ${evalResultsRunId}`
    );
  }

  const { reportStore, evaluationStore, metadataStore } = config;
  const reportCommand = config.commands.report?.[name];
  if (!reportCommand) {
    throw new Error(`No report command found with name: ${name}`);
  }
  const { reporter } = reportCommand;

  const evaluationRunId = ObjectId.createFromHexString(evalResultsRunId);

  // Run command
  await generateReportAndMetadata({
    name,
    reportEvalFunc: reporter,
    reportStore,
    evaluationStore,
    metadataStore,
    evaluationRunId,
  });
};
