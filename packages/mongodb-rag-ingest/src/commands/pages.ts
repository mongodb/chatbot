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
  command: "pages <action>",
  builder(args) {
    return args
      .command({
        command: "update",
        describe: "Update pages data from sources",
        builder: (updateArgs) => withConfigOptions(updateArgs).option("source", {
          string: true,
          description: "A source name to load. If unspecified, loads all sources.",
        }),
        handler: (updateArgs) => withConfig(doPagesCommand, updateArgs),
      })
      .command({
        command: "delete [permanent]",
        describe: "Delete pages data from database",
        builder: (deleteArgs) => withConfigOptions(deleteArgs).option("source", {
          string: true,
          description: "A source name to delete. If unspecified, deletes all sources. Deletion can be permanant or soft, where the page is marked deleted but not removed from the collection.",
        }),
        handler: (deleteArgs) => withConfig(doDeleteCommand, deleteArgs),
      })
      .demandCommand(1, "Specify an action for 'pages' command (e.g., 'delete' or 'update')");
  },
  describe: "Manage pages data from sources",
  handler: (args) => {
    console.error('Specify an action for "pages" command (e.g., "delete" or "update")');
  },
};

export default commandModule;

type PagesCommandArgs = {
  source?: string | string[];
  permanent?: boolean;
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

export const doDeleteCommand = async (
  { pageStore, dataSources }: ResolvedConfig,
  { source, permanent }: PagesCommandArgs
) => {
  const sourcesToDelete = new Set(Array.isArray(source) ? source : [source]);

  const sources =
    source === undefined
      ? dataSources
      : dataSources.filter(({ name }) => sourcesToDelete.has(name));

  if (sources.length === 0) {
    throw new Error(
      `Request at least one valid source. Available sources:\n${dataSources
        .map(({ name }) => `- ${name}`)
        .join("\n")}`
    );
  }
  logger.info(
    `Sources to be ${permanent ? "permanently deleted" : "marked for deletion"}:\n${sources.map(({ name }) => `- ${name}`).join("\n")}`
  );
  const sourcesToDeleteArray = Array.from(sourcesToDelete);
  const deleteFilter = {
    sourceName: {$in: sourcesToDeleteArray},
  };
  await pageStore.deletePages({filter: deleteFilter, permanent: permanent});
};