import { pageIdentity } from ".";
import { DatabaseConnection } from "../DatabaseConnection";
import {
  EmbeddedContent,
  EmbeddedContentStore,
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
  };
}

type MongoDbAtlasVectorSearchFilter = {
  sourceName?: string;
  "metadata.version.label"?: string;
  "metadata.version.isCurrent"?: boolean;
  $or?: {
    "metadata.version.isCurrent": boolean | null;
  }[];
};

const handleFilters = (
  filter: QueryFilters
): MongoDbAtlasVectorSearchFilter => {
  const vectorSearchFilter: MongoDbAtlasVectorSearchFilter = {};
  if (filter.sourceName) {
    vectorSearchFilter["sourceName"] = filter.sourceName;
  }
  // Handle version filter. Note: unversioned embeddings (isCurrent: null) are treated as current
  const { current, label } = filter.version ?? {};
  if (label) {
    vectorSearchFilter["metadata.version.label"] = label;
  }
  // Return current embeddings if either:
  // 1. current=true was explicitly requested, or
  // 2. [Default] no version filters were specified (current and label are undefined)
  else if (current === true || current === undefined) {
    vectorSearchFilter["$or"] = [
      { "metadata.version.isCurrent": true },
      { "metadata.version.isCurrent": null },
    ];
  }
  // Only find embeddings that are explicitly marked as non-current (isCurrent: false)
  else if (current === false) {
    vectorSearchFilter["metadata.version.isCurrent"] = false;
  }
  return vectorSearchFilter;
};
