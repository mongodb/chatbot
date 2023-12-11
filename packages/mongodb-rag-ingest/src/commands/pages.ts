import { CommandModule } from "yargs";
import { logger } from "mongodb-rag-core";
import { updatePages } from "../pages/updatePages";
import { LoadConfigArgs } from "../withConfig";
import { withConfig, withConfigOptions, ResolvedConfig } from "../withConfig";

const commandModule: CommandModule<
  Record<string, unknown>,
  LoadConfigArgs & PagesCommandArgs
> = {
  command: "pages",
  builder(args) {
    return withConfigOptions(args).option("source", {
      string: true,
      description: "A source name to load. If unspecified, loads all sources.",
    });
  },
  handler(args) {
    return withConfig(doPagesCommand, args);
  },
  describe: "Update pages data from sources",
};

export default commandModule;

type PagesCommandArgs = {
  source?: string | string[];
};

export const doPagesCommand = async (
  { pageStore, dataSources }: ResolvedConfig,
  { source }: PagesCommandArgs
) => {
  const requestedSources = new Set(Array.isArray(source) ? source : [source]);

  const sources =
    source === undefined
      ? dataSources
      : dataSources.filter(({ name }) => requestedSources.has(name));

  if (sources.length === 0) {
    throw new Error(
      `Request at least one valid source. Available sources:\n${dataSources
        .map(({ name }) => `- ${name}`)
        .join("\n")}`
    );
  }

  logger.info(
    `Loaded sources:\n${sources.map(({ name }) => `- ${name}`).join("\n")}`
  );

  await updatePages({
    sources,
    pageStore,
  });
};
