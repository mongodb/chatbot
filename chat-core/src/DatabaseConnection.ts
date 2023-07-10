import { strict as assert } from "assert";
import { MongoClient, Filter } from "mongodb";
import { PageStore, Page, PersistedPage } from "./Page";
import {
  EmbeddedContentStore,
  EmbeddedContent,
  FindNearestNeighborsOptions,
  WithScore,
} from "./EmbeddedContent";
import { multiply, max, subtract } from "mathjs";

export type DatabaseConnection = {
  /**
    Close the connection.

    @param force - Force close, emitting no events
   */
  close(force?: boolean): Promise<void>;
  drop(): Promise<void>;
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
}): Promise<DatabaseConnection & PageStore & EmbeddedContentStore> => {
  const client = await new MongoClient(connectionUri).connect();
  const db = client.db(databaseName);
  const embeddedContentCollection =
    db.collection<EmbeddedContent>("embedded_content");
  const pagesCollection = db.collection<PersistedPage>("pages");
  const instance: DatabaseConnection & PageStore & EmbeddedContentStore = {
    async drop() {
      await db.dropDatabase();
    },

    async close(force) {
      client.close(force);
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
      embeddedContent.forEach((embeddedContent) => {
        assert(
          embeddedContent.sourceName === page.sourceName &&
            embeddedContent.url === page.url,
          `EmbeddedContent source/url (${embeddedContent.sourceName} / ${embeddedContent.url}) must match give page source/url (${page.sourceName} / ${page.url})!`
        );
      });
      await client.withSession(async (session) => {
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
      const { indexName, path, k, minScore }: FindNearestNeighborsOptions = {
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
    async findMmrNearestNeighbors(vector, options, mmrOptions) {
      const embeddedContentResults = await this.findNearestNeighbors(
        vector,
        options
      );
      const mmrIndexes = maximalMarginalRelevance(
        vector,
        embeddedContentResults.map((content) => content.embedding),
        mmrOptions?.k,
        mmrOptions?.lambdaMult
      );
      const mmrEmbeddedContent: WithScore<EmbeddedContent>[] = [];
      embeddedContentResults.forEach((result, i) => {
        if (mmrIndexes.includes(i)) {
          mmrEmbeddedContent.push(result);
        }
      });
      return mmrEmbeddedContent;
    },

    async loadPages(args) {
      const filter: Filter<PersistedPage> = {};
      if (args?.sourceName !== undefined) {
        filter.sourceName = args.sourceName;
      }
      if (args?.updated !== undefined) {
        filter.updated = { $gte: args.updated };
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
  return instance;
};

/**
  Returns a query filter that represents a unique page in the system.
 */
export const pageIdentity = ({ url, sourceName }: Page) => ({
  url,
  sourceName,
});

export function cosineSimilarity(A: number[][], B: number[][]): number[][] {
  const similarities = [];
  for (let i = 0; i < A.length; i++) {
    const rowSimilarities = [];
    for (let j = 0; j < B.length; j++) {
      let dotProduct = 0;
      let mA = 0;
      let mB = 0;
      for (let k = 0; k < A[0].length; k++) {
        dotProduct += A[i][k] * B[j][k];
        mA += A[i][k] * A[i][k];
        mB += B[j][k] * B[j][k];
      }
      mA = Math.sqrt(mA);
      mB = Math.sqrt(mB);
      const similarity = dotProduct / (mA * mB);
      rowSimilarities.push(similarity);
    }
    similarities.push(rowSimilarities);
  }
  return similarities;
}

/**
 *
 * @param queryEmbedding query to check for MMR against
 * @param embeddingList embedding where finding MMR
 * @param lambdaMult lambda multiplier constant
 * @param k number of results
 * @returns indexes of embeddingList that are MMR for the queryEmbedding
 */
export function maximalMarginalRelevance(
  queryEmbedding: number[],
  embeddingList: number[][],
  lambdaMult: number = 0.5,
  k: number = 4
): number[] {
  // Return an empty array if k is less than or equal to 0
  if (Math.min(k, embeddingList.length) <= 0) {
    return [];
  }

  const similarityToQuery = cosineSimilarity(
    [queryEmbedding],
    embeddingList
  )[0];

  let mostSimilarScore = max(similarityToQuery);
  let mostSimilarIdx = similarityToQuery.indexOf(mostSimilarScore);
  const mmrIndexes = [mostSimilarIdx];
  const mmrEmbeddings = [embeddingList[mostSimilarIdx]];
  while (mmrIndexes.length < Math.min(k, embeddingList.length)) {
    let bestScore = -Infinity;
    let idxToAdd = -1;

    const similarityToSelected = cosineSimilarity(embeddingList, mmrEmbeddings);

    for (let i = 0; i < similarityToQuery.length; i++) {
      if (mmrIndexes.includes(i)) {
        continue;
      }
      const redundantScore = max(similarityToSelected[i]);
      const equationScore = subtract(
        multiply(lambdaMult, similarityToQuery[i]),
        multiply(1 - lambdaMult, redundantScore)
      );
      if (equationScore > bestScore) {
        bestScore = equationScore;
        idxToAdd = i;
      }
    }
    mmrIndexes.push(idxToAdd);
    mmrEmbeddings.push(embeddingList[idxToAdd]);
  }
  return mmrIndexes;
}
