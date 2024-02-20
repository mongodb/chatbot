import { CommandModule } from "yargs";
import {
  ResolvedConfig,
  LoadConfigArgs,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { ObjectId, logger } from "mongodb-rag-core";

const commandModule: CommandModule<unknown, LoadConfigArgs> = {
  command: "generate",
  builder(args) {
    return withConfigOptions(args).string("name").demandOption("name");
  },
  async handler(args) {
    return withConfig(generateCommand, {
      ...args,
      name: args.name as string,
    });
  },
  describe: "Generate data for evaluation.",
};

export default commandModule;

export const generateCommand = async (
  config: ResolvedConfig,
  { name }: { name: string }
) => {
  const startTime = new Date();
  const {
    generatedDataStore,
    metadataStore,
    commands: { generate },
  } = config;
  if (!generate || !generate[name]) {
    throw new Error(`No generate command found with name: ${name}`);
  }
  const runId = new ObjectId();
  const { generator, testCases } = generate[name];
  logger.info(`Generating ${testCases.length} test cases for ${name}`);
  // do stuff
  const { generatedData, failedCases } = await generator({ testCases, runId });
  for (const failedCase of failedCases) {
    logger.error(`Failed to generate data for test case: ${failedCase.name}`);
  }
  await generatedDataStore.insertMany(generatedData);

  const endTime = new Date();
  const metadata = {
    _id: runId,
    command: "generate",
    name,
    startTime,
    endTime,
  };
  await metadataStore.insertOne(metadata);
  logger.info(
    `Generated data for ${generatedData.length}/${testCases.length} test cases for generate data command '${name}'`
  );
  logger.info(metadata);
};
