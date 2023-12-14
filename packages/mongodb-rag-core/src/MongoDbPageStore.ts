import { pageIdentity } from "./pageIdentity";
import { DatabaseConnection } from "./DatabaseConnection";
import {
  MakeMongoDbDatabaseConnectionParams,
  makeMongoDbDatabaseConnection,
} from "./MongoDbDatabaseConnection";
import { LoadPagesArgs, PageStore, PersistedPage } from "./Page";
import { Filter } from "mongodb";

export type MongoDbPageStore = DatabaseConnection &
  Omit<PageStore, "loadPages"> // We omit loadPages so that the generic override below works
  & {
    queryType: "mongodb";
    loadPages(
      args?: LoadPagesArgs<Filter<PersistedPage>>
    ): Promise<PersistedPage[]>;
  };

/**
  Data store for {@link Page} objects using MongoDB.
 */
export function makeMongoDbPageStore({
  connectionUri,
  databaseName,
}: MakeMongoDbDatabaseConnectionParams): MongoDbPageStore {
  const { db, drop, close } = makeMongoDbDatabaseConnection({
    connectionUri,
    databaseName,
  });
  const pagesCollection = db.collection<PersistedPage>("pages");
  return {
    queryType: "mongodb",
    drop,
    close,
    async loadPages(args) {
      const filter: Filter<PersistedPage> = args
        ? createQueryFilterFromLoadPagesArgs(args)
        : {};
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

function createQueryFilterFromLoadPagesArgs(args: LoadPagesArgs) {
  const { query, sources, updated, urls } = args;

  // We use $and to support custom queries along with the other filters.
  // The $and operator requires at least one element, so we add an empty
  // filter.
  const filter = {
    $and: [{} as Filter<PersistedPage>],
  } satisfies Filter<PersistedPage>;

  // Handle custom queries
  if (query !== undefined) {
    if (typeof query === "object" && query !== null) {
      filter["$and"].push(query);
    } else {
      throw new Error(
        `Invalid query - MongoDbPageStore expects a MongoDB query filter. Instead, got: ${query}`
      );
    }
  }

  // Handle other query filters
  if (updated !== undefined) {
    filter["$and"][0].updated = { $gte: updated };
  }
  if (urls !== undefined) {
    filter["$and"][0].url = { $in: urls };
  }
  if (sources !== undefined) {
    filter["$and"][0].sourceName = { $in: sources };
  }

  return filter;
}
