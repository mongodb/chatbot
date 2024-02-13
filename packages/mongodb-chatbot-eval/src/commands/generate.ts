import { CommandModule } from "yargs";
import {
  ResolvedConfig,
  LoadConfigArgs,
  withConfig,
  withConfigOptions,
} from "../withConfig";

const commandModule: CommandModule<unknown, LoadConfigArgs> = {
  command: "generate",
  builder(args) {
    return withConfigOptions(args);
  },
  async handler(args) {
    return withConfig(generateCommand, {
      ...args,
    });
  },
  describe: "Generate data for evaluation.",
};

export default commandModule;

export const generateCommand = async (
  config: ResolvedConfig
  // other args?
) => {
  // TODO: do stuff
};
