import { CommandModule } from "yargs";
import { LoadConfigArgs, withConfig, withConfigOptions } from "../withConfig";
import { EvalConfig } from "../EvalConfig";
import { generateEvalsAndMetadata } from "../evaluate/generateEvalsAndMetadata";
import { ObjectId } from "mongodb-rag-core";

const commandModule: CommandModule<unknown, LoadConfigArgs> = {
  command: "evaluate",
  builder(args) {
    return withConfigOptions(args)
      .string("name")
      .option("generatedDataRunId", {
        type: "string",
        description:
          "RunId for a 'generate' command that you want to create evaluations for. If not provided, uses the `defaultGeneratedDataQuery` from the config. Throws an error if no filter provided here or there's no default.",
      })
      .demandOption("name");
  },
  async handler(args) {
    return withConfig(evaluateCommand, {
      ...args,
      name: args.name as string,
      generatedDataRunId: args.generatedDataRunId as string | undefined,
    });
  },
  describe: "Evaluate generated data.",
};

export default commandModule;

export const evaluateCommand = async (
  config: EvalConfig,
  { name, generatedDataRunId }: { name: string; generatedDataRunId?: string }
) => {
  // Get config
  const {
    generatedDataStore,
    evaluationStore,
    metadataStore,
    commands: { evaluate: evaluations },
  } = config;
  if (!evaluations || !evaluations[name]) {
    throw new Error(`No generate command found with name: ${name}`);
  }
  const { evaluator, defaultGeneratedDataQuery } = evaluations[name];
  let generatedDataRunObjectId: ObjectId | undefined;
  if (generatedDataRunId && ObjectId.isValid(generatedDataRunId)) {
    generatedDataRunObjectId = ObjectId.createFromHexString(generatedDataRunId);
  }
  // Generate evals
  await generateEvalsAndMetadata({
    name,
    evaluator,
    generatedDataRunId: generatedDataRunObjectId,
    generatedDataStore,
    evaluationStore,
    metadataStore,
    defaultGeneratedDataQuery,
  });
};
