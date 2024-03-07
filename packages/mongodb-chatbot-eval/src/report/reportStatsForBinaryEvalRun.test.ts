import { MongoClient, ObjectId } from "mongodb-rag-core";
import "dotenv/config";
import { strict as assert } from "assert";
import {
  EvalResult,
  makeMongoDbEvaluationStore,
} from "../evaluate/EvaluationStore";
import { reportStatsForBinaryEvalRun } from "./reportStatsForBinaryEvalRun";
import { Report } from "./ReportStore";

const { MONGODB_CONNECTION_URI } = process.env;
assert(MONGODB_CONNECTION_URI, "MONGODB_CONNECTION_URI is required");

describe("reportStatsForBinaryEvalRun", () => {
  const databaseName = `test-${Date.now()}`;

  const evaluationStore = makeMongoDbEvaluationStore({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName,
  });
  const client = new MongoClient(MONGODB_CONNECTION_URI);

  const commandRunId1 = new ObjectId();
  const commandRunId2 = new ObjectId();
  beforeAll(async () => {
    // insert data into evalStore
    const conversationEvals = [
      {
        _id: new ObjectId(),
        generatedDataId: new ObjectId(),
        commandRunMetadataId: commandRunId1,
        evalName: "conversation_quality",
        result: 1,
        createdAt: new Date(),
        metadata: {
          reason: "foo",
          conversationTranscript: "bar",
        },
      },
      {
        _id: new ObjectId(),
        generatedDataId: new ObjectId(),
        commandRunMetadataId: commandRunId1,
        evalName: "conversation_quality",
        result: 0,
        createdAt: new Date(),
        metadata: {
          reason: "foo",
          conversationTranscript: "bar",
        },
      },
      {
        _id: new ObjectId(),
        generatedDataId: new ObjectId(),
        commandRunMetadataId: commandRunId2,
        evalName: "conversation_quality",
        result: 1,
        createdAt: new Date(),
        metadata: {
          reason: "foo",
          conversationTranscript: "bar",
        },
      },
    ] satisfies EvalResult[];
    await evaluationStore.insertMany(conversationEvals);
    const otherEval = {
      _id: new ObjectId(),
      generatedDataId: new ObjectId(),
      commandRunMetadataId: commandRunId1,
      evalName: "other_eval",
      result: 0,
      createdAt: new Date(),
    } satisfies EvalResult;
    await evaluationStore.insertOne(otherEval);
  });
  afterAll(async () => {
    await client.connect();
    await client.db(databaseName).dropDatabase();
    await client.close();
  });

  it("should capture eval run and calculate pass percentage", async () => {
    const runId = new ObjectId();
    const report = await reportStatsForBinaryEvalRun({
      evaluationRunId: commandRunId1,
      evaluationStore,
      runId: new ObjectId(),
      reportName: "conversation_quality_stats",
    });
    expect(report).toMatchObject({
      _id: expect.any(ObjectId),
      commandRunMetadataId: runId,
      name: "conversation_quality_stats",
      type: "binary_eval_stats",
      data: {
        passRate: 0.5,
        // only capture 'commandRunId1' evals that are 'conversation_quality' evals
        totalTestCount: 2,
      },
      createdAt: expect.any(Date),
    } satisfies Report);
  });
});
