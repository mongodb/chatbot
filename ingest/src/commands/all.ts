import { CommandModule } from "yargs";
import { doPagesCommand as officialDoPages } from "./pages";
import { doEmbedCommand } from "./embed";
import {
  makeMongoDbEmbeddedContentStore,
  makeMongoDbPageStore,
  assertEnvVars,
  EmbeddedContentStore,
  PageStore,
  logger,
} from "chat-core";
import "dotenv/config";
import { INGEST_ENV_VARS } from "../IngestEnvVars";
import { makeIngestMetaStore } from "../IngestMetaStore";

const commandModule: CommandModule<unknown, unknown> = {
  command: "all",
  async handler() {
    const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } =
      assertEnvVars(INGEST_ENV_VARS);

    const embeddedContentStore = makeMongoDbEmbeddedContentStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    });
    const pageStore = makeMongoDbPageStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    });

    try {
      await doAllCommand({
        pageStore,
        embeddedContentStore,
        connectionUri: MONGODB_CONNECTION_URI,
        databaseName: MONGODB_DATABASE_NAME,
      });
    } finally {
      await pageStore.close();
      await embeddedContentStore.close();
    }
  },
  describe: "Run 'pages' and 'embed' since last successful run",
};

export default commandModule;

export const doAllCommand = async ({
  pageStore,
  embeddedContentStore,
  connectionUri,
  databaseName,
  doPagesCommand = officialDoPages,
}: {
  pageStore: PageStore;
  embeddedContentStore: EmbeddedContentStore;
  connectionUri: string;
  databaseName: string;

  // Mockable for unit test - otherwise will actually load pages from all
  // sources, waste time
  doPagesCommand?: typeof officialDoPages;
}) => {
  const ingestMetaStore = await makeIngestMetaStore({
    connectionUri,
    databaseName,
    entryId: "all",
  });

  try {
    const lastSuccessfulRunDate =
      await ingestMetaStore.loadLastSuccessfulRunDate();

    logger.info(`Last successful run date: ${lastSuccessfulRunDate}`);

    await doPagesCommand({
      store: pageStore,
    });

    await doEmbedCommand({
      since: lastSuccessfulRunDate ?? new Date("2023-01-01"),
      pageStore,
      embeddedContentStore,
    });

    logger.info(`Updating last successful run date`);
    await ingestMetaStore.updateLastSuccessfulRunDate();
  } finally {
    await ingestMetaStore.close();
  }
};
