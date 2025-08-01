import { pageIdentity } from ".";
import { DatabaseConnection } from "../DatabaseConnection";
import {
  DataSourceMetadata,
  EmbeddedContent,
  EmbeddedContentStore,
  GetSourcesMatchParams,
  QueryFilters,
} from "./EmbeddedContent";
import { FindNearestNeighborsOptions, WithScore } from "../VectorStore";
import {
  MakeMongoDbDatabaseConnectionParams,
  makeMongoDbDatabaseConnection,
} from "../MongoDbDatabaseConnection";
import { strict as assert } from "assert";
import { MongoServerError } from "mongodb";

export type MakeMongoDbEmbeddedContentStoreParams =
  MakeMongoDbDatabaseConnectionParams & {
    /**
      The name of the collection in the database that stores {@link EmbeddedContent} documents.
      @default "embedded_content"
     */
    collectionName?: string;
    searchIndex: {
      /**
        Name of the search index to use for nearest-neighbor search.
        @default "vector_index"
       */
      name?: string;
      /**
        Embedding field name. Stored in the `EmbeddedContent.embeddings[embeddingName]` field.
       */
      embeddingName: string;
      /**
        Number of dimensions in the embedding field to index.
        Only used in index creation.
        @default 1536
       */
      numDimensions?: number;
      /**
        Atlas Vector Search filters to apply to the index creation.
        Only used in index creation.
        @default
        ```js
        [{ type: "filter", path: "sourceName" }]
        ```
       */
      filters?: {
        type: "filter";
        path: string;
      }[];
    };
  };

export type MongoDbEmbeddedContentStore = EmbeddedContentStore &
  DatabaseConnection & {
    metadata: {
      databaseName: string;
      collectionName: string;
      embeddingPath: string;
      embeddingName: string;
    };
    init(): Promise<void>;
  };

function makeMatchQuery({ sourceNames, chunkAlgoHash }: GetSourcesMatchParams) {
  const operator = chunkAlgoHash.operation === "equals" ? "$eq" : "$ne";
  return {
    chunkAlgoHash: { [operator]: chunkAlgoHash.hashValue },
    // run on specific source names if specified, run on all if not
    ...(sourceNames
      ? {
          sourceName: {
            $in: sourceNames,
          },
        }
      : undefined),
  };
}

/**
  24-hour cache of listDataSources aggregation as query is a full scan of all documents in collection
 */
export const listDataSourcesCache: {
  data: DataSourceMetadata[] | null;
  expiresAt: number;
  isRefreshing: boolean;
} = {
  data: null,
  expiresAt: 0,
  isRefreshing: false,
};
const CACHE_STALE_AGE = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days

export function makeMongoDbEmbeddedContentStore({
  connectionUri,
  databaseName,
  searchIndex: {
    embeddingName,
    numDimensions = 1536,
    filters = [
      {
        type: "filter",
        path: "sourceName",
      },
      {
        type: "filter",
        path: "metadata.version.label",
      },
      {
        type: "filter",
        path: "metadata.version.isCurrent",
      },
      {
        type: "filter",
        path: "sourceType",
      },
      {
        type: "filter",
        path: "url",
      },
    ],
    name = "vector_index",
  },
  collectionName = "embedded_content",
}: MakeMongoDbEmbeddedContentStoreParams): MongoDbEmbeddedContentStore {
  const { mongoClient, db, drop, close } = makeMongoDbDatabaseConnection({
    connectionUri,
    databaseName,
  });
  const embeddedContentCollection =
    db.collection<EmbeddedContent>(collectionName);
  const embeddingPath = `embeddings.${embeddingName}`;

  async function fetchFreshListDataSources(): Promise<DataSourceMetadata[]> {
    const freshData = await embeddedContentCollection
      .aggregate<DataSourceMetadata>([
        {
          $group: {
            _id: "$sourceName",
            versions: {
              $addToSet: {
                $cond: [
                  { $ifNull: ["$metadata.version.label", false] },
                  {
                    label: "$metadata.version.label",
                    isCurrent: "$metadata.version.isCurrent",
                  },
                  "$$REMOVE",
                ],
              },
            },
            sourceType: { $addToSet: "$sourceType" },
          },
        },
        {
          $project: {
            _id: 0,
            id: "$_id",
            versions: {
              $map: {
                input: {
                  $filter: {
                    input: "$versions",
                    as: "v",
                    cond: { $ne: ["$$v.label", null] },
                  },
                },
                as: "v",
                in: {
                  label: "$$v.label",
                  isCurrent: { $ifNull: ["$$v.isCurrent", false] },
                },
              },
            },
            type: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$sourceType",
                    as: "t",
                    cond: { $ne: ["$$t", null] },
                  },
                },
                0,
              ],
            },
          },
        },
      ])
      .toArray();

    listDataSourcesCache.data = freshData;
    listDataSourcesCache.expiresAt = Date.now() + CACHE_STALE_AGE;
    listDataSourcesCache.isRefreshing = false;

    return freshData;
  }

  return {
    drop,
    close,
    metadata: {
      databaseName,
      collectionName,
      embeddingName,
      embeddingPath,
    },
    async loadEmbeddedContent({ page }) {
      return await embeddedContentCollection.find(pageIdentity(page)).toArray();
    },

    async deleteEmbeddedContent({
      page,
      dataSources,
      inverseDataSources = false,
    }) {
      const deleteResult = await embeddedContentCollection.deleteMany({
        ...(page ? pageIdentity(page) : undefined),
        ...(dataSources
          ? {
              sourceName: {
                [inverseDataSources ? "$nin" : "$in"]: dataSources,
              },
            }
          : undefined),
      });
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

    /**
      @param vector - The vector to search for nearest neighbors to.
      @param options - Options for performing a nearest-neighbor search.
     */
    async findNearestNeighbors(vector, options) {
      const {
        indexName,
        path,
        k,
        minScore,
        filter = {},
        numCandidates,
      }: Partial<FindNearestNeighborsOptions> = {
        // Default options
        indexName: name,
        path: embeddingPath,
        k: 3,
        minScore: 0,
        // User options override
        ...(options ?? {}),
      };
      return embeddedContentCollection
        .aggregate<WithScore<EmbeddedContent>>([
          {
            $vectorSearch: {
              index: indexName,
              queryVector: vector,
              path,
              limit: k,
              numCandidates: numCandidates ?? k * 15,
              filter: handleFilters(filter),
            },
          },
          {
            $addFields: {
              score: {
                $meta: "vectorSearchScore",
              },
            },
          },
          { $match: { score: { $gte: minScore } } },
        ])
        .toArray();
    },
    async init() {
      await embeddedContentCollection.createIndex({ sourceName: 1 });
      await embeddedContentCollection.createIndex({ url: 1 });
      await embeddedContentCollection.createIndex({
        "metadata.version.isCurrent": 1,
      });
      await embeddedContentCollection.createIndex({
        "metadata.version.label": 1,
      });
      await embeddedContentCollection.createIndex({
        sourceType: 1,
      });

      try {
        const searchIndex = {
          name,
          type: "vectorSearch",
          definition: {
            fields: [
              {
                numDimensions,
                path: embeddingPath,
                similarity: "cosine",
                type: "vector",
              },
              ...filters,
            ],
          },
        };
        await embeddedContentCollection.createSearchIndex(searchIndex);
      } catch (error: unknown) {
        if (error instanceof MongoServerError) {
          assert(
            error.codeName === "IndexAlreadyExists",
            `An unexpected MongoError occurred: ${error.name}`
          );
        } else {
          throw error;
        }
      }
    },

    async listDataSources(): Promise<DataSourceMetadata[]> {
      const now = Date.now();

      // If cache is fresh (< 24h), return it immediately
      if (listDataSourcesCache.data && now < listDataSourcesCache.expiresAt) {
        return listDataSourcesCache.data;
      }

      // If cache exists but is stale (< 7 days), return it and refresh in background
      if (
        listDataSourcesCache.data &&
        now - listDataSourcesCache.expiresAt < CACHE_MAX_AGE
      ) {
        if (!listDataSourcesCache.isRefreshing) {
          listDataSourcesCache.isRefreshing = true;

          void fetchFreshListDataSources().catch((err) => {
            listDataSourcesCache.isRefreshing = false;
            console.error("Error refreshing listDataSources cache:", err);
          });
        }

        return listDataSourcesCache.data;
      }

      // Cache is too old (>= 7 days) — fetch fresh and set cache
      return await fetchFreshListDataSources();
    },

    async getDataSources(matchQuery: GetSourcesMatchParams): Promise<string[]> {
      const result = await embeddedContentCollection
        .aggregate([
          { $match: makeMatchQuery(matchQuery) },
          {
            $group: {
              _id: null,
              uniqueSources: { $addToSet: "$sourceName" },
            },
          },
          { $project: { _id: 0, uniqueSources: 1 } },
        ])
        .toArray();
      const uniqueSources = result.length > 0 ? result[0].uniqueSources : [];
      return uniqueSources;
    },
  };
}

type MongoDbAtlasVectorSearchFilter = {
  sourceName?: string | { $in: string[] };
  "metadata.version.label"?: string | { $in: string[] };
  "metadata.version.isCurrent"?: boolean | { $ne: boolean };
  sourceType?: string | { $in: string[] };
};

const handleFilters = (
  filter: QueryFilters
): MongoDbAtlasVectorSearchFilter => {
  const vectorSearchFilter: MongoDbAtlasVectorSearchFilter = {};
  if (filter.sourceName) {
    vectorSearchFilter["sourceName"] = Array.isArray(filter.sourceName)
      ? { $in: filter.sourceName }
      : filter.sourceName;
  }
  if (filter.sourceType) {
    vectorSearchFilter["sourceType"] = Array.isArray(filter.sourceType)
      ? { $in: filter.sourceType }
      : filter.sourceType;
  }
  // Handle version filter. Note: unversioned embeddings (isCurrent: null) are treated as current
  const { current, label } = filter.version ?? {};
  if (label) {
    vectorSearchFilter["metadata.version.label"] = Array.isArray(label)
      ? { $in: label }
      : label;
  }
  // Return current embeddings if either:
  // 1. current=true was explicitly requested, or
  // 2. [Default] no version filters were specified (current and label are undefined)
  else if (current === true || current === undefined) {
    vectorSearchFilter["metadata.version.isCurrent"] = { $ne: false }; // Include unversioned embeddings
  }
  // Only find embeddings that are explicitly marked as non-current (isCurrent: false)
  else if (current === false) {
    vectorSearchFilter["metadata.version.isCurrent"] = false;
  }
  return vectorSearchFilter;
};
