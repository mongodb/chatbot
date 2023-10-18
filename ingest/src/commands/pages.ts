import { CommandModule } from "yargs";
import {
  assertEnvVars,
  logger,
  makeMongoDbPageStore,
  PageStore,
} from "chat-core";
import { INGEST_ENV_VARS } from "../IngestEnvVars";
import { sourceConstructors } from "../sources/projectSources";
import { DataSource } from "../sources/DataSource";
import { updatePages } from "../pages/updatePages";

type PagesCommandArgs = {
  source?: string | string[];
};

const commandModule: CommandModule<
  Record<string, unknown>,
  PagesCommandArgs
> = {
  command: "pages",
  builder(args) {
    return args.option("source", {
      string: true,
      description: "A source name to load. If unspecified, loads all sources.",
    });
  },
  handler: async ({ source }) => {
    const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } =
      assertEnvVars(INGEST_ENV_VARS);

    const store = makeMongoDbPageStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    });

    try {
      await doPagesCommand({ source, store });
    } finally {
      await store.close();
    }
  },
  describe: "Update pages data from sources",
};

export default commandModule;

export const doPagesCommand = async ({
  source,
  store,
}: PagesCommandArgs & {
  store: PageStore;
}) => {
  const requestedSources = new Set(Array.isArray(source) ? source : [source]);

  const sourcePromises = await Promise.allSettled(
    sourceConstructors.map((constructor) => constructor())
  );

  // Log any errors in source construction
  (
    sourcePromises.filter(
      (result) => result.status === "rejected"
    ) as PromiseRejectedResult[]
  ).forEach((result) => {
    logger.error(`Source constructor failed: ${result.reason}`);
  });

  const availableSources = (
    sourcePromises.filter(
      (result) => result.status === "fulfilled"
    ) as PromiseFulfilledResult<DataSource | DataSource[]>[]
  )
    .map(({ value }) => value)
    .flat(1);

  const sources =
    source === undefined
      ? availableSources
      : availableSources.filter(({ name }) => requestedSources.has(name));

  if (sources.length === 0) {
    throw new Error(
      `Request at least one valid source. Available sources:\n${availableSources
        .map(({ name }) => `- ${name}`)
        .join("\n")}`
    );
  }

  logger.info(
    `Loaded sources:\n${sources.map(({ name }) => `- ${name}`).join("\n")}`
  );

  await updatePages({
    sources,
    pageStore: store,
  });
};
