// Based on https://www.mongodb.com/docs/atlas/atlas-search/tutorial/hybrid-search/
import { MongoClient } from "mongodb";
import { makeReciprocalRankFusionSearch } from "./reciprocalRankFusionSearch";

let client: MongoClient;

beforeAll(() => {
  client = new MongoClient(`localhost:27017`);
});

afterAll(async () => {
  await client.close();
});

describe.skip("reciprocalRankFusionSearch", () => {
  it("works", async () => {
    const db = client.db("sample-mflix");
    const reciprocalRankFusionSearch = makeReciprocalRankFusionSearch({
      db,
    });

    const resultsCursor = reciprocalRankFusionSearch({
      fulltext: {
        collection: "movies",
        penalty: 0.2,
        limit: 12,
        index: "rrf-fulltext-search",
      },
      vector: {
        collection: "embedded_movies",
        penalty: 0.2,
        index: "rrf-vector-search",
        path: "title",
        queryVector: [0.1, 0.2, 0.3],
        numCandidates: 20,
        limit: 20,
      },
    });

    for await (const searchResult of resultsCursor.stream()) {
      expect(searchResult.score).toBeGreaterThan(0);
    }
  });
});
