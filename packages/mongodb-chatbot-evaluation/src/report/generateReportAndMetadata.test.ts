import { ObjectId } from "mongodb-rag-core/mongodb";
import { makeMockEvaluationStore } from "../test/mockEvaluationStore";
import { makeMockCommandMetadataStore } from "../test/mockMetadataStore";
import { mockReportEvalFunc } from "../test/mockReportFunc";
import { makeMockReportStore } from "../test/mockReportStore";
import { generateReportAndMetadata } from "./generateReportAndMetadata";
import { EvalResult } from "../evaluate/EvaluationStore";
import { CommandRunMetadata } from "../CommandMetadataStore";
import { Report } from "./ReportStore";

describe("generateReportAndMetadata", () => {
  const metadataStore = makeMockCommandMetadataStore();
  const reportStore = makeMockReportStore();
  const evaluationStore = makeMockEvaluationStore();
  const evaluationRunId = new ObjectId();
  beforeAll(async () => {
    const evals = [
      {
        _id: new ObjectId(),
        generatedDataId: new ObjectId(),
        commandRunMetadataId: evaluationRunId,
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
        commandRunMetadataId: evaluationRunId,
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
        commandRunMetadataId: new ObjectId(), // Some other command run
        type: "conversation_quality",
        result: 1,
        createdAt: new Date(),
        metadata: {
          reason: "foo",
          conversationTranscript: "bar",
        },
      },
    ] satisfies EvalResult[];
    await evaluationStore.insertMany(evals);
  });
  it("should generate the report and metadata", async () => {
    const { report, metadata } = await generateReportAndMetadata({
      metadataStore,
      reportStore,
      evaluationStore,
      reportEvalFunc: mockReportEvalFunc,
      name: "mock_report",
      evaluationRunId,
    });
    expect(metadata).toMatchObject({
      command: "report",
      name: "mock_report",
      _id: expect.any(ObjectId),
      endTime: expect.any(Date),
      startTime: expect.any(Date),
    } satisfies CommandRunMetadata);
    expect(report).toMatchObject({
      _id: expect.any(ObjectId),
      name: "mock_report_name",
      type: "mock_report",
      commandRunMetadataId: metadata._id,
      createdAt: expect.any(Date),
      data: {
        numEvals: 2,
      },
    } satisfies Report);
  });
});
