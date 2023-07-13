import { CommandModule } from "yargs";
import { doPagesCommand as officialDoPages } from "./pages";
import { doEmbedCommand } from "./embed";
import {
  makeDatabaseConnection,
  assertEnvVars,
  EmbeddedContentStore,
  PageStore,
} from "chat-core";
import { MongoClient } from "mongodb";
import { INGEST_ENV_VARS } from "../IngestEnvVars";

const commandModule: CommandModule<unknown, unknown> = {
  command: "all",
  async handler() {
    const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } =
      assertEnvVars(INGEST_ENV_VARS);

    const store = await makeDatabaseConnection({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    });

    try {
      await doAllCommand({
        pageStore: store,
        embeddedContentStore: store,
        connectionUri: MONGODB_CONNECTION_URI,
        databaseName: MONGODB_DATABASE_NAME,
      });
    } finally {
      await store.close();
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

    await doPagesCommand({
      store: pageStore,
    });

    await doEmbedCommand({
      since: lastSuccessfulRunDate ?? new Date("2023-01-01"),
      pageStore,
      embeddedContentStore,
    });

    await ingestMetaStore.updateLastSuccessfulRunDate();
  } finally {
    await ingestMetaStore.close();
  }
};

export type IngestMetaEntry = {
  _id: string;
  lastIngestDate: Date;
};

/**
  The ingest meta has information about ingest runs so that the script can
  resume from a known successful run date.

  If the 'since' date given to the embed command is too late, pages that were
  updated during a failed run will not be picked up.

  If too early, more pages and embeddings will be checked than necessary. The
  embed command will not unnecessarily create new embeddings for page updates
  that it has already created embeddings for, but it would still be wasteful to
  have to check potentially all pages and embeddings when the date is early
  enough. 
 */
export type IngestMetaStore = {
  /**
    The ID of the specific metadata document this store is associated with.
    Generally there should be only one document per ingest_meta collection per
    database.
   */
  readonly entryId: string;

  /**
    Returns the last successful run date for the store's entry.
   */
  loadLastSuccessfulRunDate(): Promise<Date | null>;

  /**
    Sets the store's entry to the current date.
   */
  updateLastSuccessfulRunDate(): Promise<void>;

  /**
    Closes the connection. Must be called when done.
   */
  close(): Promise<void>;
};

/**
  Creates a connection to ingest meta collection.
 */
export const makeIngestMetaStore = async ({
  connectionUri,
  databaseName,
  entryId,
}: {
  connectionUri: string;
  databaseName: string;
  entryId: string;
}): Promise<IngestMetaStore> => {
  const client = await MongoClient.connect(connectionUri);
  const collection = client
    .db(databaseName)
    .collection<IngestMetaEntry>("ingest_meta");
  return {
    entryId,

    async close() {
      await client.close();
    },
    async loadLastSuccessfulRunDate() {
      return (
        (await collection.findOne({ _id: entryId }))?.lastIngestDate ?? null
      );
    },
    async updateLastSuccessfulRunDate() {
      await collection.updateOne(
        {
          _id: entryId,
        },
        {
          $set: {
            _id: entryId,
            lastIngestDate: new Date(),
          },
        },
        { upsert: true }
      );
    },
  };
};
