import { pageIdentity } from "./pageIdentity";
import { DatabaseConnection } from "./DatabaseConnection";
import {
  MakeMongoDbDatabaseConnectionParams,
  makeMongoDbDatabaseConnection,
} from "./MongoDbDatabaseConnection";
import { LoadPagesArgs, LoadPagesQuery, PageStore, PersistedPage, parseLoadPagesArgs } from "./Page";
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
    queryType: "mongodb",
    drop,
    close,
    async loadPages(
      args: LoadPagesQuery<Filter<PersistedPage>> | LoadPagesArgs | undefined
    ) {
      let filter: Filter<PersistedPage> = {};
      if (args) {
        const parsedArgs = parseLoadPagesArgs<Filter<PersistedPage>>(args);
        if (parsedArgs.type === "query") {
          filter = parsedArgs.query;
        } else {
          filter = createLoadPagesQueryFilterFromArgs(parsedArgs.args);
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

function createLoadPagesQueryFilterFromArgs(args: LoadPagesArgs): Filter<PersistedPage> {
  const { updated, urls, sources } = args;
  let filter: Filter<PersistedPage> = {};

  if (updated !== undefined) {
    filter.updated = { $gte: updated };
  }
  if (urls !== undefined) {
    filter.url = { $in: urls };
  }
  if (sources !== undefined) {
    filter.sourceName = { $in: sources };
  }

  return filter;
}
