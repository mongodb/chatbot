import { CommandModule } from "yargs";
import { updateEmbeddedContent } from "../embed/updateEmbeddedContent";
import {
  ResolvedConfig,
  LoadConfigArgs,
  withConfig,
  withConfigOptions,
} from "../withConfig";

type EmbeddedContentCommandArgs = {
  since: string;
  source?: string | string[];
};

const commandModule: CommandModule<
  unknown,
  LoadConfigArgs & EmbeddedContentCommandArgs
> = {
  command: "embed",
  builder(args) {
    return withConfigOptions(args)
      .string("since")
      .option("source", {
        string: true,
        description:
          "A source name to load. If unspecified, loads all sources.",
      })
      .demandOption("since");
  },
  async handler({ since: sinceString, source, ...args }) {
    if (isNaN(Date.parse(sinceString))) {
      throw new Error(
        `The value for 'since' (${sinceString}) must be a valid JavaScript date string.`
      );
    }
    const since = new Date(sinceString);
    return withConfig(doEmbedCommand, { ...args, since, source });
  },
  describe: "Update embedded content data from pages",
};

export default commandModule;

export const doEmbedCommand = async (
  { pageStore, embeddedContentStore, embedder, chunkOptions, concurrencyOptions }: ResolvedConfig,
  {
    since,
    source,
  }: {
    since: Date;
    source?: string | string[];
  }
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
    embedConcurrencyOptions: concurrencyOptions?.embed,
  });
};
