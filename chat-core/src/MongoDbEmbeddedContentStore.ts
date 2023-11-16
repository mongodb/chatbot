import { pageIdentity } from "./pageIdentity";
import { DatabaseConnection } from "./DatabaseConnection";
import {
  EmbeddedContent,
  EmbeddedContentStore,
  FindNearestNeighborsOptions,
  WithScore,
} from "./EmbeddedContent";
import {
  MakeMongoDbDatabaseConnectionParams,
  makeMongoDbDatabaseConnection,
} from "./MongoDbDatabaseConnection";
import { strict as assert } from "assert";

export function makeMongoDbEmbeddedContentStore({
  connectionUri,
  databaseName,
}: MakeMongoDbDatabaseConnectionParams): EmbeddedContentStore &
  DatabaseConnection {
  const { mongoClient, db, drop, close } = makeMongoDbDatabaseConnection({
    connectionUri,
    databaseName,
  });
  const embeddedContentCollection =
    db.collection<EmbeddedContent>("embedded_content");
  return {
    drop,
    close,
    async loadEmbeddedContent({ page }) {
      return await embeddedContentCollection.find(pageIdentity(page)).toArray();
    },

    async deleteEmbeddedContent({ page }) {
      const deleteResult = await embeddedContentCollection.deleteMany(
        pageIdentity(page)
      );
      if (!deleteResult.acknowledged) {
        throw new Error("EmbeddedContent deletion not acknowledged!");
      }
    },

    async updateEmbeddedContent({ page, embeddedContent }) {
      assert(embeddedContent.length !== 0);
      embeddedContent.forEach((embeddedContent) => {
        assert(
          embeddedContent.sourceName === page.sourceName &&
            embeddedContent.url === page.url,
          `EmbeddedContent source/url (${embeddedContent.sourceName} / ${embeddedContent.url}) must match give page source/url (${page.sourceName} / ${page.url})!`
        );
      });
      await mongoClient.withSession(async (session) => {
        await session.withTransaction(async () => {
          // First delete all the embeddedContent for the given page
          const deleteResult = await embeddedContentCollection.deleteMany(
            pageIdentity(page),
            { session }
          );
          if (!deleteResult.acknowledged) {
            throw new Error("EmbeddedContent deletion not acknowledged!");
          }

          // Insert the embedded content for the page
          const insertResult = await embeddedContentCollection.insertMany(
            [...embeddedContent],
            {
              session,
            }
          );

          if (!insertResult.acknowledged) {
            throw new Error("EmbeddedContent insertion not acknowledged!");
          }
          const { insertedCount } = insertResult;
          if (insertedCount !== embeddedContent.length) {
            throw new Error(
              `Expected ${embeddedContent.length} inserted, got ${insertedCount}`
            );
          }
        });
      });
    },

    async findNearestNeighbors(vector, options) {
      const {
        indexName,
        path,
        k,
        minScore,
        filter,
      }: Partial<FindNearestNeighborsOptions> = {
        // Default options
        indexName: "default",
        path: "embedding",
        k: 3,
        minScore: 0.9,

        // User options override
        ...(options ?? {}),
      };
      return embeddedContentCollection
        .aggregate<WithScore<EmbeddedContent>>([
          {
            $search: {
              index: indexName,
              knnBeta: {
                vector,
                path,
                k,
                filter,
              },
            },
          },
          {
            $addFields: {
              score: {
                $meta: "searchScore",
              },
            },
          },
          { $match: { score: { $gte: minScore } } },
        ])
        .toArray();
    },
  };
}
