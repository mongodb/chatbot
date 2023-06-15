import { Db, MongoClient, UpdateResult } from "mongodb";
import { PageStore, PersistedPage } from "./updatePages";
import { ChunkStore } from "./updateChunks";

export type DatabaseConnection = {
  /**
    Close the connection.

    @param force - Force close, emitting no events
   */
  close(force?: boolean): Promise<void>;
};

export const makeDatabaseConnection = async ({
  connectionUri,
  databaseName,
}: {
  connectionUri: string;
  databaseName: string;
}): Promise<DatabaseConnection & PageStore & ChunkStore> => {
  const client = await new MongoClient(connectionUri).connect();
  const db = client.db(databaseName);
  const chunksCollection = db.collection("chunks");
  const pagesCollection = db.collection<PersistedPage>("pages");
  const instance: DatabaseConnection & PageStore & ChunkStore = {
    close: client.close,

    async deleteChunks({ page }) {
      const deleteResult = await chunksCollection.deleteMany({
        page,
      });
      if (!deleteResult.acknowledged) {
        throw new Error("Chunk deletion not acknowledged!");
      }
    },

    async updateChunks({ page, chunks }) {
      await client.withSession(async (session) => {
        await session.withTransaction(async () => {
          // First delete all the chunks for the given page
          const deleteResult = await chunksCollection.deleteMany(
            {
              page,
            },
            { session }
          );
          if (!deleteResult.acknowledged) {
            throw new Error("Chunk deletion not acknowledged!");
          }

          // Insert the chunks for the page
          const insertResult = await chunksCollection.insertMany([...chunks], {
            session,
          });

          if (!insertResult.acknowledged) {
            throw new Error("Chunk insertion not acknowledged!");
          }
          const { insertedCount } = insertResult;
          if (insertedCount !== chunks.length) {
            throw new Error(
              `Expected ${chunks.length} chunks inserted, got ${insertedCount}`
            );
          }
        });
      });
    },

    async loadPages({ source }) {
      return pagesCollection.find({ source }).toArray();
    },

    async updatePages(pages) {
      const results = await pagesCollection.updateMany(
        pages.map(({ source, url }) => ({ source, url })),
        [...pages],
        { upsert: true }
      );
      if (!results.acknowledged) {
        throw new Error(`update pages not acknowledged!`);
      }
      if (results.modifiedCount + results.upsertedCount !== pages.length) {
        throw new Error(
          `unexpected result: given ${pages.length}, modified ${results.modifiedCount} and upserted ${results.upsertedCount}`
        );
      }
    },
  };
  return instance;
};
