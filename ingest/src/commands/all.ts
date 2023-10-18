import { CommandModule } from "yargs";
import { logger } from "chat-core";
import { doPagesCommand as standardDoPagesCommand } from "./pages";
import { doEmbedCommand } from "./embed";
import {
  ResolvedConfig,
  LoadConfigArgs,
  withConfig,
  withConfigOptions,
} from "../withConfig";

const commandModule: CommandModule<unknown, LoadConfigArgs> = {
  command: "all",
  builder(args) {
    return withConfigOptions(args);
  },
  async handler() {
    return withConfig(doAllCommand, {
      doPagesCommand: standardDoPagesCommand,
    });
  },
  describe: "Run 'pages' and 'embed' since last successful run",
};

export default commandModule;

export const doAllCommand = async (
  config: ResolvedConfig,
  {
    doPagesCommand,
  }: {
    // Mockable for unit test - otherwise will actually load pages from all
    // sources, waste time
    doPagesCommand: typeof standardDoPagesCommand;
  }
) => {
  const { ingestMetaStore } = config;

  const lastSuccessfulRunDate =
    await ingestMetaStore.loadLastSuccessfulRunDate();

  logger.info(`Last successful run date: ${lastSuccessfulRunDate}`);

  await doPagesCommand(config, {});

  await doEmbedCommand(config, {
    since: lastSuccessfulRunDate ?? new Date("2023-01-01"),
  });

  logger.info(`Updating last successful run date`);
  await ingestMetaStore.updateLastSuccessfulRunDate();
};
