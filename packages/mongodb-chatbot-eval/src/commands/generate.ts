import { CommandModule } from "yargs";
import { LoadConfigArgs, withConfig, withConfigOptions } from "../withConfig";
import { generateDataAndMetadata } from "../generate/generateDataAndMetadata";
import { EvalConfig } from "../EvalConfig";

interface GenerateCommandArgs {
  name: string;
}

const commandModule: CommandModule<
  unknown,
  LoadConfigArgs & GenerateCommandArgs
> = {
  command: "generate",
  builder(args) {
    return withConfigOptions(args).option("name", {
      type: "string",
      demandOption: true,
      description: "Name of the data generation.",
    });
  },
  async handler(args) {
    return withConfig(generateCommand, {
      ...args,
      name: args.name,
    });
  },
  describe: "Generate data for evaluation.",
};

export default commandModule;

export const generateCommand = async (
  config: EvalConfig,
  { name }: { name: string }
) => {
  // Get config
  const {
    generatedDataStore,
    metadataStore,
    commands: { generate },
  } = config;
  if (!generate?.[name]) {
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
