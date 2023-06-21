import { strict as assert } from "assert";
import { MongoClient } from "mongodb";
import { PageStore, PersistedPage } from "./updatePages.js";
import { ChunkStore, EmbeddedChunk } from "./updateChunks.js";

export type DatabaseConnection = {
  /**
    Close the connection.

    @param force - Force close, emitting no events
   */
  close(force?: boolean): Promise<void>;
};

/**
  Create a connection to the database.
 */
export const makeDatabaseConnection = async ({
  connectionUri,
  databaseName,
}: {
  connectionUri: string;
  databaseName: string;
}): Promise<DatabaseConnection & PageStore & ChunkStore> => {
  const client = await new MongoClient(connectionUri).connect();
  const db = client.db(databaseName);
  const chunksCollection = db.collection<EmbeddedChunk>("chunks");
  const pagesCollection = db.collection<PersistedPage>("pages");
  const instance: DatabaseConnection & PageStore & ChunkStore = {
    close: (force) => client.close(force),

    async loadChunks({ page }) {
      return await chunksCollection.find(pageIdentity(page)).toArray();
    },

    async deleteChunks({ page }) {
      const deleteResult = await chunksCollection.deleteMany(
        pageIdentity(page)
      );
      if (!deleteResult.acknowledged) {
        throw new Error("Chunk deletion not acknowledged!");
      }
    },

    async updateChunks({ page, chunks }) {
      chunks.forEach((chunk) => {
        assert(
          chunk.source === page.sourceName && chunk.url === page.url,
          `Chunk source/url (${chunk.source} / ${chunk.url}) must match give page source/url (${page.sourceName} / ${page.url})!`
        );
      });
      await client.withSession(async (session) => {
        await session.withTransaction(async () => {
          // First delete all the chunks for the given page
          const deleteResult = await chunksCollection.deleteMany(
            pageIdentity(page),
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

    async loadPages({ sourceName }) {
      return pagesCollection.find({ sourceName }).toArray();
    },

    async updatePages(pages) {
      await Promise.all(
        pages.map(async (page) => {
          const result = await pagesCollection.updateOne(
            pageIdentity(page),
            { $set: page },
            { upsert: true }
          );
          if (!result.acknowledged) {
            throw new Error(`update pages not acknowledged!`);
          }
          if (!result.modifiedCount && !result.upsertedCount) {
            throw new Error(
              `Page ${JSON.stringify(pageIdentity(page))} not updated!`
            );
          }
        })
      );
    },
  };
  return instance;
};

/**
  Returns a query filter that represents a unique page in the system.
 */
export const pageIdentity = ({ url, sourceName }: PersistedPage) => ({
  url,
  sourceName,
});
