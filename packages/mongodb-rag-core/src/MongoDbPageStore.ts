import { pageIdentity } from "./pageIdentity";
import { DatabaseConnection } from "./DatabaseConnection";
import {
  MakeMongoDbDatabaseConnectionParams,
  makeMongoDbDatabaseConnection,
} from "./MongoDbDatabaseConnection";
import { LoadPagesArgs, LoadPagesQuery, PageStore, PersistedPage } from "./Page";
import { Filter } from "mongodb";

/**
  Data store for {@link Page} objects using MongoDB.
 */
export function makeMongoDbPageStore({
  connectionUri,
  databaseName,
}: MakeMongoDbDatabaseConnectionParams): PageStore & DatabaseConnection {
  const { db, drop, close } = makeMongoDbDatabaseConnection({
    connectionUri,
    databaseName,
  });
  const pagesCollection = db.collection<PersistedPage>("pages");
  return {
    drop,
    close,
    async loadPages(args) {
      const _query = (args as LoadPagesQuery)?.query
      const filter: Filter<PersistedPage> = _query ?? {};
      if (!_query) {
        const { sources, updated } = args as LoadPagesArgs;
        if (sources !== undefined) {
          filter.sourceName = { $in: sources };
        }
        if (updated !== undefined) {
          filter.updated = { $gte: updated };
        }
      }
      return pagesCollection.find(filter).toArray();
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
}
