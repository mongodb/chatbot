import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import "dotenv/config";
import { strict as assert } from "assert";
import {
  EvalResult,
  makeMongoDbEvaluationStore,
} from "../evaluate/EvaluationStore";
import { reportAverageScore } from "./reportAverageScore";
import { Report } from "./ReportStore";

const { MONGODB_CONNECTION_URI } = process.env;
assert(MONGODB_CONNECTION_URI, "MONGODB_CONNECTION_URI is required");

describe("reportAverageScore", () => {
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
        type: "conversation_quality",
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
        type: "conversation_quality",
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
        commandRunMetadataId: commandRunId1,
        type: "conversation_quality",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        result: null,
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
        type: "conversation_quality",
        result: 1,
        createdAt: new Date(),
        metadata: {
          reason: "foo",
          conversationTranscript: "bar",
        },
      },
    ] satisfies EvalResult[];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await evaluationStore.insertMany(conversationEvals);
  });
  afterAll(async () => {
    await client.connect();
    await client.db(databaseName).dropDatabase();
    await client.close();
  });

  it("should capture eval run and calculate pass percentage", async () => {
    const runId = new ObjectId();
    const report = await reportAverageScore({
      evaluationRunId: commandRunId1,
      evaluationStore,
      runId,
      reportName: "retrieval_stats",
    });
    expect(report).toMatchObject({
      _id: expect.any(ObjectId),
      commandRunMetadataId: runId,
      name: "retrieval_stats",
      type: "average_score",
      data: {
        averageScore: 0.5,
        totalTestCount: 2,
      },
      createdAt: expect.any(Date),
    } satisfies Report);
  });
});
