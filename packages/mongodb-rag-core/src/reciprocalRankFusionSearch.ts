import { Document, MongoClient, Db as MongoDatabase } from "mongodb";

export type MakeReciprocalRankFusionSearchArgs = {
  db: MongoDatabase;
};

export type CommonSearchPipelineArgs = {
  collection: string;
  penalty: number;
  limit: number;
};

export type ReciprocalRankFusionArgs = {
  fulltext: CommonSearchPipelineArgs & {
    index: string;
  };
  vector: CommonSearchPipelineArgs & {
    index: string;
    path: string;
    numCandidates: number;
    queryVector: number[];
  };
};

export function makeReciprocalRankFusionSearch({
  db,
}: MakeReciprocalRankFusionSearchArgs) {
  return function reciprocalRankFusionSearch<Result extends Document>({
    fulltext,
    vector,
  }: ReciprocalRankFusionArgs) {
    const FTS_DOCS_FIELD = "__fts_docs";
    const FTS_RANK_FIELD = "__fts_rank";
    const FTS_SCORE_FIELD = "__fts_score";
    const VS_DOCS_FIELD = "__vs_docs";
    const VS_RANK_FIELD = "__vs_rank";
    const VS_SCORE_FIELD = "__vs_score";

    return db.collection(vector.collection).aggregate<Result>([
      // First, run the vector search
      {
        $vectorSearch: {
          index: vector.index,
          path: vector.path,
          queryVector: vector.queryVector,
          numCandidates: vector.numCandidates,
          limit: vector.limit,
        },
      },
      // Calculate an RRF score for each vector search result
      {
        $group: {
          _id: null,
          [VS_DOCS_FIELD]: { $push: "$$ROOT" },
        },
      },
      {
        $unwind: {
          path: `$${VS_DOCS_FIELD}`,
          includeArrayIndex: VS_RANK_FIELD,
        },
      },
      {
        $addFields: {
          [`${VS_DOCS_FIELD}.${VS_SCORE_FIELD}`]: {
            $divide: [1.0, { $add: [`$${VS_RANK_FIELD}`, vector.penalty, 1] }],
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: `$${VS_DOCS_FIELD}`,
        },
      },
      // At the same time as the vector search, run a full-text search
      {
        $unionWith: {
          coll: fulltext.collection,
          pipeline: [
            {
              $search: {
                index: fulltext.index,
                // TODO - figure out what is optional in FTS and let users pass it in
                phrase: {
                  query: "new york",
                  path: "title",
                },
              },
            },
            {
              $limit: fulltext.limit,
            },
            // Calculate an RRF score for each FTS search result using the same pattern as VS
            {
              $group: {
                _id: null,
                [FTS_DOCS_FIELD]: { $push: "$$ROOT" },
              },
            },
            {
              $unwind: {
                path: `$${FTS_DOCS_FIELD}`,
                includeArrayIndex: FTS_RANK_FIELD,
              },
            },
            {
              $addFields: {
                [`${FTS_DOCS_FIELD}.${FTS_SCORE_FIELD}`]: {
                  $divide: [
                    1.0,
                    { $add: [`$${FTS_RANK_FIELD}`, fulltext.penalty, 1] },
                  ],
                },
              },
            },
            {
              $replaceRoot: {
                newRoot: `$${FTS_DOCS_FIELD}`,
              },
            },
          ],
        },
      },
      // At this point we have two sets of results, each with a reciprocal rank
      // score. To achieve fusion, we need to merge these two sets of results
      // together and sort by the RRF score.
      {
        $group: {
          _id: "$title",
          vs_score: { $max: "$vs_score" },
          fts_score: { $max: "$fts_score" },
          docs: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 1,
          score: {
            $add: [
              { $ifNull: ["$vs_score", 0] },
              { $ifNull: ["$fts_score", 0] },
            ],
          },
          content: "$docs",
        },
      },
      { $sort: { score: -1 } },
      { $limit: 10 },
    ]);
  };
}
