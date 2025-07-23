import { DatabaseNlQueryDatasetEntryBraintrust } from "../DatabaseNlQueryDatasetEntry";
import { Eval, EvalScorer, wrapAISDKModel } from "mongodb-rag-core/braintrust";
import {
  makeRewriteNlQueryPrompt,
  RewriteClassification,
} from "./rewriteNlQuery";
import { LanguageModel } from "mongodb-rag-core/aiSdk";
import { makeOpenAiProvider } from "../../../openAi";
import { models } from "mongodb-rag-core/models";

type RewriteNlQueryInput = DatabaseNlQueryDatasetEntryBraintrust;

type RewriteNlQueryExpected = {
  classification: RewriteClassification["classification"];
};

type RewriteNlQueryOutput = {
  classification: RewriteClassification;
  datasetEntry: DatabaseNlQueryDatasetEntryBraintrust;
};

const correctRewriteClassification: EvalScorer<
  RewriteNlQueryInput,
  RewriteNlQueryOutput,
  RewriteNlQueryExpected
> = function ({ output, expected }) {
  return {
    name: "CorrectRewriteClassification",
    score:
      output.classification.classification === expected.classification ? 1 : 0,
    metadata: {
      classification: output.classification,
      expectedClassification: expected.classification,
    },
  };
};

interface RewriteNlQueryDatasetEntry {
  input: RewriteNlQueryInput;
  expected: RewriteNlQueryExpected;
  tags?: string[];
}

function runRewriteNlQueryEval({
  model,
  dataset,
}: {
  model: LanguageModel;
  dataset: RewriteNlQueryDatasetEntry[];
}) {
  const rewriteNlQuery = makeRewriteNlQueryPrompt(model);
  return Eval<
    RewriteNlQueryInput,
    RewriteNlQueryOutput,
    RewriteNlQueryExpected
  >("rewrite-nl-query", {
    data: dataset,
    task: rewriteNlQuery,
    scores: [correctRewriteClassification],
    experimentName: `rewrite-nl-query-${model.modelId}`,
    metadata: {
      model: model.modelId,
    },
  });
}

const dataset: RewriteNlQueryDatasetEntry[] = [
  // 5 Ambiguous examples
  {
    input: {
      input: {
        nlQuery:
          "Find all shipwrecks within 5 kilometers of coordinates 45.483, -86.665.",
        databaseName: "sample_geospatial",
      },
      expected: {
        dbQuery:
          'db.shipwrecks.find({coordinates: {$near: {$geometry: {type: "Point", coordinates: [-86.665, 45.483]}, $maxDistance: 5000}}}, {_id: 1, feature_type: 1, latdec: 1, londec: 1, depth: 1, history: 1, coordinates: 1})',
        executionTimeMs: 5238,
        result: [
          {
            _id: "578f6fa3df35c7fbdbaf0030",
            coordinates: [-86.6652573, 45.4831299],
            depth: 0,
            feature_type: "Wrecks - Submerged, dangerous",
            history: "reported 1995",
            latdec: 45.4831299,
            londec: -86.6652573,
          },
        ],
      },
      tags: ["simple", "mongosh", "sample_geospatial"],
      metadata: {
        methods: ["find"],
        queryOperators: ["$near", "$geometry", "$maxDistance"],
        language: "mongosh",
        complexity: "simple",
      },
    },
    expected: {
      classification: "ambiguous",
    },
  },
  {
    input: {
      input: {
        nlQuery:
          "Show me the 15 largest sell transactions for Apple (AAPL) stock in 2016 with transaction amounts over 500 shares.",
        databaseName: "sample_analytics",
      },
      expected: {
        dbQuery:
          'db.transactions.aggregate([{$unwind: "$transactions"}, {$match: {"transactions.date": {$gte: new Date("2016-01-01"), $lt: new Date("2017-01-01")}, "transactions.symbol": "aapl", "transactions.transaction_code": "sell", "transactions.amount": {$gt: 500}}}, {$sort: {"transactions.amount": -1}}, {$limit: 15}, {$project: {_id: 0, account_id: 1, date: "$transactions.date", amount: "$transactions.amount", price: "$transactions.price", total: "$transactions.total"}}])',
        executionTimeMs: 1689,
        result: [
          {
            account_id: 418570,
            amount: 9959,
            date: "2016-12-19T00:00:00Z",
            price: "113.9603089288650750177112058736383914947509765625",
            total: "1134930.716622567282101385899",
          },
        ],
      },
      tags: ["moderate", "mongosh", "sample_analytics"],
      metadata: {
        methods: ["aggregate"],
        queryOperators: [
          "$unwind",
          "$match",
          "$gte",
          "$lt",
          "$gt",
          "$sort",
          "$limit",
          "$project",
        ],
        language: "mongosh",
        complexity: "moderate",
      },
    },
    expected: {
      classification: "ambiguous",
    },
  },
  {
    input: {
      input: {
        nlQuery: "Show me the 5 most recent buy transactions for EBAY.",
        databaseName: "sample_analytics",
      },
      expected: {
        dbQuery:
          'db.transactions.aggregate([{$unwind: "$transactions"}, {$match: {"transactions.symbol": "ebay", "transactions.transaction_code": "buy"}}, {$sort: {"transactions.date": -1}}, {$limit: 5}, {$project: {_id: 0, date: "$transactions.date", amount: "$transactions.amount", price: "$transactions.price", total: "$transactions.total", symbol: "$transactions.symbol", transaction_code: "$transactions.transaction_code"}}])',
        executionTimeMs: 5032,
        result: [
          {
            amount: 7866,
            date: "2017-01-06T00:00:00Z",
            price: "30.7483446996547655771792051382362842559814453125",
            symbol: "ebay",
            total: "241866.4794074843860300916276",
            transaction_code: "buy",
          },
        ],
      },
      tags: ["simple", "mongosh", "sample_analytics"],
      metadata: {
        methods: ["aggregate"],
        queryOperators: ["$unwind", "$match", "$sort", "$limit", "$project"],
        language: "mongosh",
        complexity: "simple",
      },
    },
    expected: {
      classification: "ambiguous",
    },
  },
  {
    input: {
      input: {
        nlQuery:
          "Get titles, directors, writers, and main cast for the top 15 movies with IMDb rating above 8.0 and more than 10000 votes.",
        databaseName: "sample_mflix",
      },
      expected: {
        dbQuery:
          'db.movies.aggregate([{$match: {"imdb.rating": {$gt: 8.0}, "imdb.votes": {$gt: 10000}}}, {$sort: {"imdb.rating": -1}}, {$limit: 15}, {$project: {_id: 0, title: 1, directors: 1, writers: 1, cast: 1}}])',
        executionTimeMs: 1728,
        result: [
          {
            cast: [
              "Scott Grimes",
              "Matthew Leitch",
              "Damian Lewis",
              "Ron Livingston",
            ],
            title: "Band of Brothers",
          },
        ],
      },
      tags: ["complex", "mongosh", "sample_mflix"],
      metadata: {
        methods: ["aggregate"],
        queryOperators: ["$match", "$gt", "$sort", "$limit", "$project"],
        language: "mongosh",
        complexity: "complex",
      },
    },
    expected: {
      classification: "ambiguous",
    },
  },
  {
    input: {
      input: {
        nlQuery:
          "List 8 shared rooms under $35 that mention bus stops in their transit information with a location score of 9 or higher.",
        databaseName: "sample_airbnb",
      },
      expected: {
        dbQuery:
          'db.listingsAndReviews.find({room_type: "Shared room", price: {$lt: Decimal128("35")}, transit: {$regex: /bus/i}, "review_scores.review_scores_location": {$gte: 9}}, {name: 1, price: 1, room_type: 1, transit: 1, "review_scores.review_scores_location": 1, _id: 0}).limit(8)',
        executionTimeMs: 4061,
        result: [
          {
            name: "GuestHouse Antero de Quental -Triple Bedroom 1Bed",
            price: { $numberDecimal: "25.00" },
            review_scores: { review_scores_location: 9 },
            room_type: "Shared room",
            transit: "Walking distance from all type of transports...",
          },
        ],
      },
      tags: ["simple", "mongosh", "sample_airbnb"],
      metadata: {
        methods: ["find", "limit"],
        queryOperators: ["$lt", "$regex", "$gte"],
        language: "mongosh",
        complexity: "simple",
      },
    },
    expected: {
      classification: "ambiguous",
    },
  },
  // 5 Unambiguous examples
  {
    input: {
      input: {
        nlQuery:
          "Show me the average customer satisfaction rating for online purchases versus in-store purchases.",
        databaseName: "sample_supplies",
      },
      expected: {
        dbQuery:
          'db.sales.aggregate([{$group: {_id: "$purchaseMethod", averageSatisfaction: {$avg: "$customer.satisfaction"}}}])',
        executionTimeMs: 1708,
        result: [
          { _id: "Online", averageSatisfaction: 3.7709779179810727 },
          { _id: "Phone", averageSatisfaction: 3.837248322147651 },
          { _id: "In store", averageSatisfaction: 3.79638169563675 },
        ],
      },
      tags: ["simple", "mongosh", "sample_supplies"],
      metadata: {
        methods: ["aggregate"],
        queryOperators: ["$group", "$avg"],
        language: "mongosh",
        complexity: "simple",
      },
    },
    expected: {
      classification: "unambiguous",
    },
  },
  {
    input: {
      input: {
        nlQuery: "Which boroughs have fewer than 1000 restaurants?",
        databaseName: "sample_restaurants",
      },
      expected: {
        dbQuery:
          'db.restaurants.aggregate([{$group: {_id: "$borough", count: {$sum: 1}}}, {$match: {count: {$lt: 1000}}}, {$project: {_id: 1, count: 1}}])',
        executionTimeMs: 1903,
        result: [
          { _id: "Staten Island", count: 969 },
          { _id: "Missing", count: 51 },
        ],
      },
      tags: ["simple", "mongosh", "sample_restaurants"],
      metadata: {
        methods: ["aggregate"],
        queryOperators: ["$group", "$sum", "$match", "$lt", "$project"],
        language: "mongosh",
        complexity: "simple",
      },
    },
    expected: {
      classification: "unambiguous",
    },
  },
  {
    input: {
      input: {
        nlQuery:
          "Count the total number of transactions for each store location in the first quarter of 2017.",
        databaseName: "sample_supplies",
      },
      expected: {
        dbQuery:
          'db.sales.aggregate([{$match: {saleDate: {$gte: ISODate("2017-01-01T00:00:00.000Z"), $lte: ISODate("2017-03-31T23:59:59.999Z")}}}, {$group: {_id: "$storeLocation", transactionCount: {$sum: 1}}}, {$project: {_id: 0, storeLocation: "$_id", transactionCount: 1}}, {$sort: {storeLocation: 1}}])',
        executionTimeMs: 1318,
        result: [
          { storeLocation: "Austin", transactionCount: 27 },
          { storeLocation: "Denver", transactionCount: 73 },
        ],
      },
      tags: ["simple", "mongosh", "sample_supplies"],
      metadata: {
        methods: ["aggregate"],
        queryOperators: [
          "$match",
          "$gte",
          "$lte",
          "$group",
          "$sum",
          "$project",
          "$sort",
        ],
        language: "mongosh",
        complexity: "simple",
      },
    },
    expected: {
      classification: "unambiguous",
    },
  },
  {
    input: {
      input: {
        nlQuery:
          "Show me how many award-winning movies (with at least 3 wins) we have in each genre, sorted by count descending, limit to top 12 genres.",
        databaseName: "sample_mflix",
      },
      expected: {
        dbQuery:
          'db.movies.aggregate([{$match: {"awards.wins": {$gte: 3}}}, {$unwind: "$genres"}, {$group: {_id: "$genres", count: {$sum: 1}}}, {$sort: {count: -1}}, {$limit: 12}])',
        executionTimeMs: 1257,
        result: [
          { _id: "Drama", count: 5542 },
          { _id: "Comedy", count: 2122 },
          { _id: "Romance", count: 1369 },
        ],
      },
      tags: ["moderate", "mongosh", "sample_mflix"],
      metadata: {
        methods: ["aggregate"],
        queryOperators: [
          "$match",
          "$gte",
          "$unwind",
          "$group",
          "$sum",
          "$sort",
          "$limit",
        ],
        language: "mongosh",
        complexity: "moderate",
      },
    },
    expected: {
      classification: "unambiguous",
    },
  },
  {
    input: {
      input: {
        nlQuery: "Which planets in our solar system have rings?",
        databaseName: "sample_guides",
      },
      expected: {
        dbQuery:
          "db.planets.find({hasRings: true}, {name: 1, hasRings: 1, _id: 0})",
        executionTimeMs: 1270,
        result: [
          { hasRings: true, name: "Neptune" },
          { hasRings: true, name: "Uranus" },
          { hasRings: true, name: "Jupiter" },
          { hasRings: true, name: "Saturn" },
        ],
      },
      tags: ["simple", "mongosh", "sample_guides"],
      metadata: {
        methods: ["find"],
        queryOperators: [],
        language: "mongosh",
        complexity: "simple",
      },
    },
    expected: {
      classification: "unambiguous",
    },
  },
].map(
  (entry) =>
    ({
      ...entry,
      tags: [entry.expected.classification, ...entry.input.tags],
    } as RewriteNlQueryDatasetEntry)
);

const modelDeployment: (typeof models)[number]["deployment"] =
  "claude-opus-4-20250514";
runRewriteNlQueryEval({
  model: wrapAISDKModel(makeOpenAiProvider()(modelDeployment)),
  dataset,
});
