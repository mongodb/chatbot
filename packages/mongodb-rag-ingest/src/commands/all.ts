import { CommandModule } from "yargs";
import { logger } from "mongodb-rag-core";
import { doUpdatePagesCommand as standarddoUpdatePagesCommand } from "./pages";
import { doUpdateEmbedCommand } from "./embed";
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
  async handler(args) {
    return withConfig(doAllCommand, {
      ...args,
      doUpdatePagesCommand: standarddoUpdatePagesCommand,
    });
  },
  describe: "Run 'pages' and 'embed' since last successful run",
};

export default commandModule;

export const doAllCommand = async (
  config: ResolvedConfig,
  {
    doUpdatePagesCommand,
  }: {
    // Mockable for unit test - otherwise will actually load pages from all
    // sources, waste time
    doUpdatePagesCommand: typeof standarddoUpdatePagesCommand;
  }
) => {
  const { ingestMetaStore } = config;

  const lastSuccessfulRunDate =
    await ingestMetaStore.loadLastSuccessfulRunDate();

  logger.info(`Last successful run date: ${lastSuccessfulRunDate}`);

  await doUpdatePagesCommand(config, {});

  await doUpdateEmbedCommand(config, {
    since: lastSuccessfulRunDate ?? new Date("2023-01-01"),
  });

  // cleanup - delete pages and embedded content that are no longer in the data sources
  await config.pageStore.deletePages({
    dataSources: config.dataSources.map(({ name }) => name),
    permanent: true,
    inverse: true,
  });
  await config.embeddedContentStore.deleteEmbeddedContent({
    dataSources: config.dataSources.map(({ name }) => name),
    inverse: true,
  });

  logger.info(`Updating last successful run date`);
  await ingestMetaStore.updateLastSuccessfulRunDate();
};
