// TODO: support deleting pages
// to elegantly refactor, i think we should shift the current logic from
// `ingest pages --source <name>` to `ingest pages update --source <name>`.
// then we can add a new command `ingest pages delete --source <name>  --permanent <boolean>` to delete pages from a source.
// see https://chatgpt.com/share/6734f1c9-9be4-8010-a2e1-317c9cd8baec
import { CommandModule } from "yargs";
import { logger, updatePages } from "mongodb-rag-core";
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
  { pageStore, dataSources, concurrencyOptions }: ResolvedConfig,
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
    concurrencyOptions: concurrencyOptions?.pages,
  });
};
