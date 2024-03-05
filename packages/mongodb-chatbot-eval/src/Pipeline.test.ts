import { ObjectId } from "mongodb-rag-core";
import { EvalConfig } from "./EvalConfig";
import { PipelineFunc, runPipeline } from "./Pipeline";
import { mockEvaluateConversation } from "./test/mockEvaluateConversation";
import { makeMockEvaluationStore } from "./test/mockEvaluationStore";
import { mockGenerateDataFunc } from "./test/mockGenerateDataFunc";
import { makeMockGeneratedDataStore } from "./test/mockGeneratedDataStore";
import { makeMockCommandMetadataStore } from "./test/mockMetadataStore";
import { mockReportEvalFunc } from "./test/mockReportFunc";
import { makeMockReportStore } from "./test/mockReportStore";

describe("runPipeline", () => {
  const generatedDataStore = makeMockGeneratedDataStore();
  const metadataStore = makeMockCommandMetadataStore();
  const evaluationStore = makeMockEvaluationStore();
  const reportStore = makeMockReportStore();
  const afterAll = jest.fn();
  const stores = [
    generatedDataStore,
    metadataStore,
    evaluationStore,
    reportStore,
  ];
  const mockExit = jest.fn() as any;
  beforeEach(() => {
    for (const store of stores) {
      jest.spyOn(store, "close");
    }
    process.exit = mockExit;
  });
  afterEach(() => {
    jest.clearAllMocks();
    mockExit.mockClear();
  });

  const configConstructor = async () => {
    return {
      generatedDataStore,
      metadataStore,
      evaluationStore,
      reportStore,
      commands: {
        generate: {
          conversations: {
            testCases: [],
            type: "conversation",
            generator: mockGenerateDataFunc,
          },
        },
        evaluate: {
          conversationQuality: {
            evaluator: mockEvaluateConversation,
          },
        },
        report: {
          conversationQualityRun: {
            reporter: mockReportEvalFunc,
          },
        },
      },
      afterAll,
    } satisfies EvalConfig;
  };
  it("should run the pipeline", async () => {
    let theEnd = false;

    await runPipeline({
      configConstructor,
      pipelineFunc: async (generate, evaluate, report) => {
        const { _id: genRunId } = await generate("conversations");
        const { _id: evalRunId } = await evaluate(
          "conversationQuality",
          genRunId
        );
        await report("conversationQualityRun", evalRunId);
        theEnd = true;
      },
    });
    // expect it to make it through the pipeline
    expect(theEnd).toBe(true);

    // expect clean up
    expect(afterAll).toHaveBeenCalled();
    for (const store of stores) {
      expect(store.close).toHaveBeenCalled();
    }
    expect(mockExit).toHaveBeenCalled();
  });
  it("should throw if command not found", async () => {
    expect(
      async () =>
        await runPipeline({
          configConstructor,
          pipelineFunc: async (generate) => {
            await generate("notFound");
          },
        })
    ).rejects.toThrow();
    expect(
      async () =>
        await runPipeline({
          configConstructor,
          pipelineFunc: async (_generate, evaluate) => {
            await evaluate("notFound", new ObjectId());
          },
        })
    ).rejects.toThrow();
    expect(
      async () =>
        await runPipeline({
          configConstructor,
          pipelineFunc: async (_generate, _evaluate, report) => {
            await report("notFound", new ObjectId());
          },
        })
    ).rejects.toThrow();
  });
});
