import { pageIdentity } from ".";
import { DatabaseConnection } from "../DatabaseConnection";
import { EmbeddedContent, EmbeddedContentStore } from "./EmbeddedContent";
import { FindNearestNeighborsOptions, WithScore } from "../VectorStore";
import {
  MakeMongoDbDatabaseConnectionParams,
  makeMongoDbDatabaseConnection,
} from "../MongoDbDatabaseConnection";
import { strict as assert } from "assert";
import {
  Collection,
  Document,
  MongoServerError,
  SearchIndexDescription,
} from "mongodb";

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

      /**
        Config for full text search.
       */
      fullText?: {
        /**
          The name of the full text index to use.
          @default "default"
         */
        name?: string;
        // TODO: anything else?
      };
    };
  };

export type MongoDbEmbeddedContentStore = EmbeddedContentStore &
  DatabaseConnection & {
    metadata: {
      databaseName: string;
      collectionName: string;
      embeddingPath: string;
      embeddingName: string;
      ftsPath: string;
    };
    init(): Promise<void>;
    hybridSearchRrf(params: RrfConfig): Promise<WithScore<EmbeddedContent>[]>;
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
    ],
    name = "vector_index",
    fullText,
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

  const ftsIndexedPath = "text";
  return {
    drop,
    close,
    metadata: {
      databaseName,
      collectionName,
      embeddingName,
      embeddingPath,
      ftsPath: ftsIndexedPath,
    },
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

    /**
      @param vector - The vector to search for nearest neighbors to.
      @param options - Options for performing a nearest-neighbor search.
     */
    async findNearestNeighbors(vector, options) {
      return embeddedContentCollection
        .aggregate<WithScore<EmbeddedContent>>(
          makeVectorSearchAggStages(vector, embeddingPath, options)
        )
        .toArray();
    },

    async hybridSearchRrf({ vectorSearch, fts, k, limit }) {
      return embeddedContentCollection
        .aggregate<WithScore<EmbeddedContent>>(
          makeReciprocalRankFusionSearchAggStages({
            collectionName,
            limit,
            k: k,
            fts,
            vectorSearch,
          })
        )
        .toArray();
    },
    async init() {
      await embeddedContentCollection.createIndex({ sourceName: 1 });
      await embeddedContentCollection.createIndex({ url: 1 });

      await tryToMakeSearchIndex(embeddedContentCollection, {
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
      });
      if (fullText) {
        // TODO: do i need to apply same filters as for VS?
        await tryToMakeSearchIndex(embeddedContentCollection, {
          name: fullText.name ?? "default",
          type: "search",
          definition: {
            mappings: {
              dynamic: false,
              fields: {
                [ftsIndexedPath]: [
                  {
                    type: "string",
                  },
                ],
              },
            },
          },
        });
      }
    },
}

async function tryToMakeSearchIndex<T extends Document>(
  atlasCollection: Collection<T>,
  atlasSearchIndex: SearchIndexDescription
) {
  try {
    await atlasCollection.createSearchIndex(atlasSearchIndex);
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
}

const embeddedContentProjection = {
  _id: 1,
  url: 1,
  sourceName: 1,
  text: 1,
  metadata: 1,
  tokenCount: 1,
  updated: 1,
  chunkIndex: 1,
} satisfies MdbProjection<Omit<EmbeddedContent, "embeddings">>;

function makeVectorSearchAggStages(
  vector: number[],
  embeddingPath: string,
  options?: Partial<FindNearestNeighborsOptions>
) {
  const defaultOptions = {
    indexName: "vector_index",
    k: 3,
    minScore: 0,
  } satisfies Partial<FindNearestNeighborsOptions>;

  const usedOptions = {
    ...defaultOptions,
    path: embeddingPath,
    numCandidates: options?.numCandidates ?? defaultOptions.k * 15,
    // Override default options
    ...options,
  };
  const pipeline = [
    {
      $vectorSearch: {
        index: usedOptions.indexName,
        queryVector: vector,
        path: usedOptions.path,
        limit: usedOptions.k,
        numCandidates: usedOptions.numCandidates,
        ...(usedOptions.filter ? { filter: usedOptions.filter } : {}),
      },
    },
    {
      $addFields: {
        score: {
          $meta: "vectorSearchScore",
        },
      },
    },
    { $match: { score: { $gte: usedOptions.minScore } } },
  ];

  return pipeline;
}

interface RrfVectorSearchConfig {
  /**
    How much to weigh VS results.

    @example .5
   */
  weight: number;

  /**
    Embedding to perform vector search on.
   */
  embedding: number[];

  /**
    Path to perform vector search on.
   */
  embeddingPath: string;
  options: Partial<FindNearestNeighborsOptions>;
}

interface RrfFtsConfig {
  /**
    FTS index name.
   */
  indexName: string;

  /**
    How much to weigh FTS results.

    @example .5
   */
  weight: number;

  /**
    Query to perform FTS on.
   */
  query: string;

  /**
    Path to field for FTS.
   */
  path: string;

  /**
    Maximum number of results to include.
   */
  limit: number;
}

export interface RrfConfig {
  vectorSearch: RrfVectorSearchConfig;
  fts: RrfFtsConfig;
  /**
    Maximum number of results to include.
   */
  limit: number;

  /**
    Constant used in the denominator of the RRF calculation.
    @default
    60 // this is standard practice
   */
  k?: number;
}

type MakeReciprocalRankFusionSearchAggStages = RrfConfig & {
  /**
    Collection on which to perform the aggregation
   */
  collectionName: string;
};

/**
  Hybrid search (VS and FTS) using reciprocal rank fusion.
 */
function makeReciprocalRankFusionSearchAggStages(
  params: MakeReciprocalRankFusionSearchAggStages
) {
  const rrfK = params.k ?? 60;

  const vsScoreKey = "vs_score";
  const ftsScoreKey = "fts_score";
  const docsKey = "docs";

  return [
    // Perform VS
    ...makeVectorSearchAggStages(
      params.vectorSearch.embedding,
      params.vectorSearch.embeddingPath,
      params.vectorSearch.options
    ),
    // Calculate VS reciprocal ranks
    ...makeCalculateReciprocalRankAggStages(
      params.vectorSearch.weight,
      rrfK,
      vsScoreKey,
      docsKey,
      embeddedContentProjection
    ),
    // Perform FTS
    {
      $unionWith: {
        coll: params.collectionName,
        pipeline: [
          // This is the FTS
          ...makeFtsAggStages(params.fts),
          // Calculate reciprocal ranks
          ...makeCalculateReciprocalRankAggStages(
            params.fts.weight,
            rrfK,
            ftsScoreKey,
            docsKey,
            embeddedContentProjection
          ),
        ],
      },
    },
    // Merge the results into a single doc
    // TODO: this feels vaguely wrong..confirm
    {
      $group: {
        _id: "$_id",
        vs_score: { $max: "$vs_score" },
        fts_score: { $max: "$fts_score" },
        ...makeFirstProjection(embeddedContentProjection, ["_id"]),
      },
    },
    // Set vsScoreKey and ftsScoreKey to 0 if no value exists.
    {
      $project: {
        ...embeddedContentProjection,
        // Sets keys to 0 if value doesn't exist for them.
        [vsScoreKey]: { $ifNull: [`$${vsScoreKey}`, 0] },
        [ftsScoreKey]: { $ifNull: [`$${ftsScoreKey}`, 0] },
      },
    },
    // Creates new score field that adds FTS score with VS score
    {
      $project: {
        ...embeddedContentProjection,
        score: { $add: [`$${ftsScoreKey}`, `$${vsScoreKey}`] },
        [vsScoreKey]: 1,
        [ftsScoreKey]: 1,
      },
    },
    // Sorts from high to low
    { $sort: { score: -1 } },
    // Limits results to max number of results.
    { $limit: params.limit },
  ];
}

type MdbProjectionValue = 1 | 0 | string;
type MdbProjection<T> = {
  [K in keyof T]: MdbProjectionValue;
} & { _id: MdbProjectionValue };

function projectFromEmbeddedDoc(
  projectionKey: string,
  embeddedDocFormat: Record<string, string | number>
) {
  const keys = Object.keys(embeddedDocFormat);
  const project: Record<string, string | number> = {};
  for (const key of keys) {
    project[key] = `$${projectionKey}.${key}`;
  }
  return project;
}

function makeFtsAggStages({
  indexName,
  query,
  path,
  limit,
}: {
  indexName: string;
  query: string;
  path: string;
  limit: number;
}) {
  return [
    {
      $search: {
        index: indexName,
        phrase: {
          query,
          path,
        },
      },
    },
    {
      $limit: limit,
    },
  ];
}

/**
  Include all the keys
 */
function makeFirstProjection<T>(
  projection: MdbProjection<T>,
  omittedKeys: (keyof MdbProjection<T> extends string
    ? keyof MdbProjection<T>
    : never)[]
) {
  const keys = Object.keys(projection);
  const firsts: Record<string, { $first: string }> = {};
  for (const key of keys) {
    if (isKeyofProjection<T>(projection, key) && !omittedKeys.includes(key)) {
      firsts[key] = { $first: `$${key}` };
    }
  }
  return firsts;
}
// Type guard to ensure `key` is a valid key of `projection`
function isKeyofProjection<T>(
  projection: MdbProjection<T>,
  key: string
): key is keyof MdbProjection<T> extends string
  ? keyof MdbProjection<T>
  : never {
  return key in projection;
}

function makeCalculateReciprocalRankAggStages<T>(
  weight: number,
  rrfK: number,
  fieldOut: string,
  groupKey: string,
  projection: MdbProjection<T>
) {
  return [
    {
      $group: {
        _id: null,
        [groupKey]: { $push: "$$ROOT" },
      },
    },
    {
      $unwind: {
        path: `$${groupKey}`,
        includeArrayIndex: "rank",
      },
    },
    {
      $addFields: {
        [fieldOut]: {
          // Normal non-agg math for this is:
          // weight / ($rank + rrfK)
          $multiply: [
            weight,
            {
              $divide: [
                1,
                {
                  $add: ["$rank", rrfK],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        [fieldOut]: 1,
        ...projectFromEmbeddedDoc(groupKey, projection),
      },
    },
  ];
}
