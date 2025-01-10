import { CommandModule } from "yargs";
import {
  ResolvedConfig,
  LoadConfigArgs,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { logger, updateEmbeddedContent } from "mongodb-rag-core";

const commandModule: CommandModule<unknown, LoadConfigArgs> = {
  command: "embed <action>",
  describe: "Manage embedded content",
  builder(args) {
    return args
      .command({
        command: "init",
        describe: "Initialize embedded content store",
        builder: (updateArgs) => withConfigOptions(updateArgs),
        handler: (updateArgs) => withConfig(doInitEmbedCommand, updateArgs),
      })
      .command({
        command: "update",
        describe: "Update embedded content data",
        builder: (updateArgs) =>
          withConfigOptions(updateArgs)
            .string("since")
            .option("source", {
              string: true,
              description:
                "A source name to load. If unspecified, loads all sources.",
            })
            .demandOption(
              "since",
              "Please provide a 'since' date for the update"
            ),
        handler: ({ since: sinceString, source, ...updateArgs }) => {
          if (isNaN(Date.parse(sinceString))) {
            throw new Error(
              `The value for 'since' (${sinceString}) must be a valid JavaScript date string.`
            );
          }
          const since = new Date(sinceString);
          withConfig(doUpdateEmbedCommand, { ...updateArgs, since, source });
        },
      })
      .command({
        command: "delete",
        describe: "Delete embedded content data",
        builder: (deleteArgs) =>
          withConfigOptions(deleteArgs).option("source", {
            string: true,
            description:
              "A source name to delete. If unspecified, deletes all sources.",
          }),
        handler: (deleteArgs) => withConfig(doDeleteEmbedCommand, deleteArgs),
      });
  },
  handler: (_args) => {
    logger.error('Specify an action for "embed" command');
  },
};

export default commandModule;

export const doInitEmbedCommand = async ({
  embeddedContentStore,
}: ResolvedConfig) => {
  if (!embeddedContentStore) {
    throw new Error(`Failed to initialize embedded content store.`);
  }
  await embeddedContentStore.init?.();
};

type UpdateEmbedCommandArgs = {
  since: Date;
  source?: string | string[];
};

export const doUpdateEmbedCommand = async (
  {
    pageStore,
    embeddedContentStore,
    embedder,
    chunkOptions,
    concurrencyOptions,
  }: ResolvedConfig,
  { since, source }: UpdateEmbedCommandArgs
) => {
  const sourceNames =
    source === undefined
      ? undefined
      : Array.isArray(source)
      ? source
      : [source];

  await updateEmbeddedContent({
    since,
    sourceNames,
    pageStore,
    embeddedContentStore,
    embedder,
    chunkOptions,
    concurrencyOptions: concurrencyOptions?.embed,
  });
};

type DeleteEmbedCommandArgs = {
  source?: string | string[];
};

export const doDeleteEmbedCommand = async (
  { embeddedContentStore }: ResolvedConfig,
  { source }: DeleteEmbedCommandArgs
) => {
  const sourceNames =
    source === undefined
      ? undefined
      : Array.isArray(source)
      ? source
      : [source];
  logger.info(
    `Embeddings to be deleted:\n${sourceNames
      ?.map((name) => `- ${name}`)
      .join("\n")}`
  );
  await embeddedContentStore.deleteEmbeddedContent({
    dataSources: sourceNames,
  });
};
