import { Db, MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { strict as assert } from "assert";
import {
  EvalResult,
  EvaluationStore,
  makeMongoDbEvaluationStore,
} from "./EvaluationStore";

describe("MongoDbReportStore", () => {
  const { MONGODB_CONNECTION_URI } = process.env;
  assert(MONGODB_CONNECTION_URI);
  const connectionUri = MONGODB_CONNECTION_URI;
  const client = new MongoClient(connectionUri);

  let testDbName: string;
  let db: Db;
  let evalStore: EvaluationStore;

  beforeEach(() => {
    testDbName = "test" + Math.random().toString(36).substring(7);
    db = client.db(testDbName);
    evalStore = makeMongoDbEvaluationStore({
      connectionUri: connectionUri,
      databaseName: testDbName,
    });
  });
  afterEach(async () => {
    await db.dropDatabase();
    await evalStore.close();
  });

  it("should insert one new evaluation result", async () => {
    const evalResult = {
      _id: new ObjectId(),
      createdAt: new Date(),
      commandRunMetadataId: new ObjectId(),
      type: "foo",
      result: 0.5,
      generatedDataId: new ObjectId(),
    } satisfies EvalResult;
    const inserted = await evalStore.insertOne(evalResult);
    expect(inserted).toBe(true);
  });
  it("should insert many new evaluation results", async () => {
    const evalResult1 = {
      _id: new ObjectId(),
      createdAt: new Date(),
      commandRunMetadataId: new ObjectId(),
      type: "foo",
      result: 0.5,
      generatedDataId: new ObjectId(),
    } satisfies EvalResult;
    const evalResult2 = {
      _id: new ObjectId(),
      createdAt: new Date(),
      commandRunMetadataId: new ObjectId(),
      type: "bar",
      result: 0.7,
      generatedDataId: new ObjectId(),
    } satisfies EvalResult;
    const inserted = await evalStore.insertMany([evalResult1, evalResult2]);
    expect(inserted).toBe(true);
  });
  it("should find data with arbitrary mongodb filter", async () => {
    const evalResult = {
      _id: new ObjectId(),
      createdAt: new Date(),
      commandRunMetadataId: new ObjectId(),
      type: "foo",
      result: 0.5,
      generatedDataId: new ObjectId(),
    } satisfies EvalResult;
    await evalStore.insertOne(evalResult);
    const found = await evalStore.find({ result: 0.5, type: "foo" });
    expect(found && found[0]).toMatchObject(evalResult);
  });
  it("should aggregate data", async () => {
    const evalResult1 = {
      _id: new ObjectId(),
      createdAt: new Date(),
      commandRunMetadataId: new ObjectId(),
      type: "foo",
      result: 0.5,
      generatedDataId: new ObjectId(),
    } satisfies EvalResult;
    const evalResult2 = {
      _id: new ObjectId(),
      createdAt: new Date(),
      commandRunMetadataId: new ObjectId(),
      type: "bar",
      result: 0.123,
      generatedDataId: new ObjectId(),
    } satisfies EvalResult;
    await evalStore.insertMany([evalResult1, evalResult2]);
    const aggregated = await evalStore.aggregate([
      { $match: { result: 0.5, type: "foo" } },
    ]);
    expect(aggregated).toHaveLength(1);
    expect(aggregated[0]).toMatchObject(evalResult1);
  });
});
