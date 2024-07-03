import { CommandModule } from "yargs";
import { LoadConfigArgs, withConfig, withConfigOptions } from "../withConfig";
import { EvalConfig } from "../EvalConfig";
import { generateEvalsAndMetadata } from "../evaluate/generateEvalsAndMetadata";
import { ObjectId } from "mongodb-rag-core";

interface EvaluateCommandArgs {
  name: string;
  generatedDataRunId: string;
}

const commandModule: CommandModule<
  unknown,
  LoadConfigArgs & EvaluateCommandArgs
> = {
  command: "evaluate",
  builder(args) {
    return withConfigOptions(args)
      .option("name", {
        type: "string",
        demandOption: true,
        description: "Name of the evaluation.",
      })
      .option("generatedDataRunId", {
        type: "string",
        description:
          "RunId for a 'generate' command that you want to create evaluations for.",
        demandOption: true,
      });
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
  config: EvalConfig,
  { name, generatedDataRunId }: EvaluateCommandArgs
) => {
  // Get config
  const {
    generatedDataStore,
    evaluationStore,
    metadataStore,
    commands: { evaluate: evaluations },
  } = config;
  if (!evaluations?.[name]) {
    throw new Error(`No generate command found with name: ${name}`);
  }
  const { evaluator } = evaluations[name];
  let generatedDataRunObjectId: ObjectId | undefined;
  if (ObjectId.isValid(generatedDataRunId)) {
    generatedDataRunObjectId = ObjectId.createFromHexString(generatedDataRunId);
  } else {
    throw new Error(`Invalid ObjectId: ${generatedDataRunId}`);
  }
  // Generate evals
  await generateEvalsAndMetadata({
    name,
    evaluator,
    generatedDataRunId: generatedDataRunObjectId,
    generatedDataStore,
    evaluationStore,
    metadataStore,
    concurrency: evaluations?.[name]?.concurrency,
  });
};
