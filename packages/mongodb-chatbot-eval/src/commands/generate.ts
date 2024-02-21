import { CommandModule } from "yargs";
import {
  ResolvedConfig,
  LoadConfigArgs,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { ObjectId, logger } from "mongodb-rag-core";
import { CommandMetadataStore } from "../CommandMetadataStore";
import { GenerateDataFunc } from "../generate/GenerateDataFunc";
import { GeneratedDataStore } from "../generate/GeneratedDataStore";
import { SomeTestCase } from "../generate/TestCase";
import { generateDataAndMetadata } from "../generate/generateDataAndMetadata";

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
  // Get config
  const {
    generatedDataStore,
    metadataStore,
    commands: { generate },
  } = config;
  if (!generate || !generate[name]) {
    throw new Error(`No generate command found with name: ${name}`);
  }
  const { generator, testCases } = generate[name];

  // Generate data
  await generateDataAndMetadata({
    testCases,
    name,
    generator,
    generatedDataStore,
    metadataStore,
  });
};
