import { ObjectId, logger } from "mongodb-rag-core";
import {
  GenerateEvalsAndMetadataParams,
  generateEvalsAndMetadata,
} from "./generateEvalsAndMetadata";
import { makeMockGeneratedDataStore } from "../test/mockGeneratedDataStore";
import { makeMockCommandMetadataStore } from "../test/mockMetadataStore";
import { makeMockEvaluationStore } from "../test/mockEvaluationStore";
import {
  FAIL_ON_ME,
  mockEvaluateConversation,
} from "../test/mockEvaluateConversation";
import {
  ConversationTestCase,
  GeneratedDataStore,
  SomeGeneratedData,
  generateDataAndMetadata,
} from "../generate";
import { testCases } from "../test/mockTestCases";
import { mockGenerateDataFunc } from "../test/mockGenerateDataFunc";
import {
  CommandMetadataStore,
  CommandRunMetadata,
} from "../CommandMetadataStore";
import { MockFindFilter } from "../test/MockFindFilter";
import { EvalResult } from "./EvaluationStore";
import { Conversation } from "mongodb-chatbot-server";

const testCaseWithFail = {
  name: "conversation",
  data: {
    expectation: "I want to fail",
    name: "I WILL FAIL",
    messages: [
      {
        role: "user",
        content: "I want to fail" + FAIL_ON_ME,
      },
      {
        role: "assistant",
        content: "You have failed",
      },
    ],
  },
} satisfies ConversationTestCase;

describe("generateEvalsAndMetadata", () => {
  let generatedDataStore: GeneratedDataStore;
  let metadataStore: CommandMetadataStore;
  let generatedDataRunMetadata: CommandRunMetadata;
  const testData = [...testCases, testCaseWithFail];
  const makeBaseArgs = () =>
    ({
      name: "test",
      evaluator: mockEvaluateConversation,
      generatedDataStore,
      evaluationStore: makeMockEvaluationStore(),
      metadataStore: metadataStore,
    } satisfies Partial<GenerateEvalsAndMetadataParams>);
  let baseArgs: ReturnType<typeof makeBaseArgs>;
  beforeEach(async () => {
    generatedDataStore = makeMockGeneratedDataStore();
    metadataStore = makeMockCommandMetadataStore();
    baseArgs = makeBaseArgs();
    const res = await generateDataAndMetadata({
      generatedDataStore,
      metadataStore,
      name: "mock_conversations",
      generator: mockGenerateDataFunc,
      testCases: testData,
    });
    generatedDataRunMetadata = res.metadata;
  });

  it("should generate evals given a generateDataRunId", async () => {
    const res = await generateEvalsAndMetadata({
      ...baseArgs,
      generatedDataRunId: generatedDataRunMetadata._id,
    });
    expect(res.evalResults).toHaveLength(testData.length);
    expect(res.failedCases).toHaveLength(0);
    testEvalResults(res.evalResults);
  });

  it("should generate evals given a defaultGeneratedDataQuery", async () => {
    const targetTestCase = testData[0];
    // Filter to only get data for single test case
    const defaultQuery: MockFindFilter<SomeGeneratedData> = (genData) => {
      return (
        genData.type === "conversation" &&
        genData?.evalData?.qualitativeFinalAssistantMessageExpectation ===
          targetTestCase.data.expectation
      );
    };
    const res = await generateEvalsAndMetadata({
      ...baseArgs,
      generatedDataRunId: generatedDataRunMetadata._id,
      defaultGeneratedDataQuery: defaultQuery,
    });
    expect(res.evalResults).toHaveLength(4);
    expect(res.failedCases).toHaveLength(0);
    testEvalResults(res.evalResults);
  });

  it("should verify metadata storage with correct details", async () => {
    const res = await generateEvalsAndMetadata({
      ...baseArgs,
      generatedDataRunId: generatedDataRunMetadata._id,
    });
    const expected = {
      _id: expect.any(ObjectId),
      command: "evaluate",
      endTime: expect.any(Date),
      startTime: expect.any(Date),
      name: baseArgs.name,
    } satisfies CommandRunMetadata;
    expect(res.metadata).toMatchObject(expected);
    expect(metadataStore.findById(res.metadata._id)).resolves.toMatchObject(
      expected
    );
    expect(
      res.metadata.startTime.getTime() <= res.metadata.endTime.getTime()
    ).toBe(true);
  });

  it("should throw when neither generatedDataRunId nor defaultGeneratedDataQuery is provided", async () => {
    expect(
      async () =>
        await generateEvalsAndMetadata({
          ...baseArgs,
        })
    ).rejects.toThrow();
  });

  test("should handle failed eval generation for some test cases", async () => {
    const res = await generateEvalsAndMetadata({
      ...baseArgs,
      generatedDataRunId: generatedDataRunMetadata._id,
      evaluator: async ({ generatedData }) => {
        if (
          generatedData.type === "conversation" &&
          (generatedData?.data as Conversation)?.messages[0]?.content.includes(
            FAIL_ON_ME
          )
        ) {
          throw new Error("Failed to evaluate conversation");
        } else {
          return {
            _id: new ObjectId(),
            generatedDataId: generatedData._id,
            commandRunMetadataId: new ObjectId(),
            evalName: "test",
            result: 1,
            createdAt: new Date(),
            metadata: {
              reason: "Test passed",
            },
          } satisfies EvalResult;
        }
      },
    });
    expect(res.evalResults).toHaveLength(testData.length - 1);
    expect(res.failedCases).toHaveLength(1);
  });

  test("should log correct information during the generation process", async () => {
    const infoSpy = jest.spyOn(logger, "info").mockImplementation(jest.fn());
    const errorSpy = jest.spyOn(logger, "error").mockImplementation(jest.fn());
    await generateEvalsAndMetadata({
      ...baseArgs,
      generatedDataRunId: generatedDataRunMetadata._id,
    });
    expect(infoSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    infoSpy.mockRestore();
    errorSpy.mockRestore();
  });

  function testEvalResults(evalResults: EvalResult[]) {
    let hasFailed = false;
    let hasPassed = false;
    for (const evalResult of evalResults) {
      expect(evalResult).toMatchObject({
        _id: expect.any(ObjectId),
        commandRunMetadataId: expect.any(ObjectId),
        generatedDataId: expect.any(ObjectId),
        evalName: baseArgs.name,
        result: expect.any(Number),
        createdAt: expect.any(Date),
        metadata: {
          reason: expect.any(String),
        },
      } satisfies EvalResult);
      expect(evalResult.result).toBeGreaterThanOrEqual(0);
      expect(evalResult.result).toBeLessThanOrEqual(1);
      if (
        (evalResult?.metadata?.conversationTranscript as string).includes(
          FAIL_ON_ME
        )
      ) {
        expect(evalResult.result).toEqual(0);
        hasFailed = true;
      } else {
        hasPassed = true;
      }
    }
    expect(hasFailed).toBe(true);
    expect(hasPassed).toBe(true);
  }
});
