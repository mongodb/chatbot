import { ObjectId } from "mongodb-rag-core";
import { ConversationGeneratedData } from "../generate";
import { evaluateExpectedLinks, ExpectedLinks } from "./evaluateExpectedLinks";
import { EvalResult } from "./EvaluationStore";

const generateConversationData = (expectedLinks?: string[]) =>
  ({
    _id: new ObjectId(),
    commandRunId: new ObjectId(),
    type: "conversation",
    data: {
      _id: new ObjectId(),
      createdAt: new Date(),
      messages: [
        {
          createdAt: new Date(),
          id: new ObjectId(),
          role: "user",
          content: "What's my name?",
        },
        {
          createdAt: new Date(),
          id: new ObjectId(),
          role: "assistant",
          content: "Your name is Jasper.",
          references: [
            {
              title: "foo",
              url: "bar",
            },
            {
              title: "baz",
              url: "fizz_buzz",
            },
          ],
        },
      ],
    },
    evalData: {
      qualitativeFinalAssistantMessageExpectation:
        "The assistant should correctly respond with the user's name.",
      name: "User name",
      expectedLinks,
    },
  } satisfies ConversationGeneratedData);
describe("evaluateExpectedLinks", () => {
  it("should return 1 when all expected links are found in the assistant message", async () => {
    const generatedConversationData = generateConversationData(["bar", "fizz"]);
    const runId = new ObjectId();
    const evalResult = await evaluateExpectedLinks({
      generatedData: generatedConversationData,
      runId,
    });
    expect(evalResult).toMatchObject({
      result: 1,
      generatedDataId: generatedConversationData._id,
      type: "expected_links",
      commandRunMetadataId: runId,
      createdAt: expect.any(Date),
      _id: expect.any(ObjectId),
      metadata: {
        testName: generatedConversationData.evalData.name,
        expectedLinksFound: {
          bar: ["bar"],
          fizz: ["fizz_buzz"],
        } satisfies ExpectedLinks,
      },
    } satisfies EvalResult);
  });

  it("should return 0 when no expected links are found in the assistant message", async () => {
    const generatedConversationData = generateConversationData([
      "bish",
      "bash",
    ]);
    const runId = new ObjectId();
    const evalResult = await evaluateExpectedLinks({
      generatedData: generatedConversationData,
      runId,
    });
    expect(evalResult).toMatchObject({
      result: 0,
      generatedDataId: generatedConversationData._id,
      type: "expected_links",
      commandRunMetadataId: runId,
      createdAt: expect.any(Date),
      _id: expect.any(ObjectId),
      metadata: {
        testName: generatedConversationData.evalData.name,
        expectedLinksFound: {
          bish: [],
          bash: [],
        },
      },
    } satisfies EvalResult);
  });

  it("should return the correct ratio when some expected links are found", async () => {
    const generatedConversationData = generateConversationData([
      "buzz",
      "bash",
    ]);
    const runId = new ObjectId();
    const evalResult = await evaluateExpectedLinks({
      generatedData: generatedConversationData,
      runId,
    });
    expect(evalResult).toMatchObject({
      result: 0.5,
      generatedDataId: generatedConversationData._id,
      type: "expected_links",
      commandRunMetadataId: runId,
      createdAt: expect.any(Date),
      _id: expect.any(ObjectId),
      metadata: {
        testName: generatedConversationData.evalData.name,
        expectedLinksFound: {
          buzz: ["fizz_buzz"],
          bash: [],
        } satisfies ExpectedLinks,
      },
    } satisfies EvalResult);
  });

  it('should throw an error if generatedData is not of type "conversation"', async () => {
    const generatedConversationData = generateConversationData([]);
    (generateConversationData as any).type = "not conversation";
    const runId = new ObjectId();
    await expect(
      evaluateExpectedLinks({
        generatedData: generatedConversationData,
        runId,
      })
    ).rejects.toThrow();
  });

  it("should throw an error if no expectedLinks are provided in the test case", async () => {
    const generatedConversationData = generateConversationData();
    const runId = new ObjectId();
    await expect(
      evaluateExpectedLinks({
        generatedData: generatedConversationData,
        runId,
      })
    ).rejects.toThrow();
    const generatedConversationDataEmptyArr = generateConversationData([]);
    await expect(
      evaluateExpectedLinks({
        generatedData: generatedConversationDataEmptyArr,
        runId,
      })
    ).rejects.toThrow();
  });

  it("should throw an error if the last message is not from the assistant", async () => {
    const generatedConversationData = generateConversationData();
    const runId = new ObjectId();
    generatedConversationData.data.messages[1].role = "user";
    await expect(
      evaluateExpectedLinks({
        generatedData: generatedConversationData,
        runId,
      })
    ).rejects.toThrow();
  });

  it("should throw an error if the final assistant message has no references", async () => {
    const generatedConversationData = generateConversationData();
    const runId = new ObjectId();
    generatedConversationData.data.messages[1].references = [];
    await expect(
      evaluateExpectedLinks({
        generatedData: generatedConversationData,
        runId,
      })
    ).rejects.toThrow();

    delete generatedConversationData.data.messages[1].references;
    await expect(
      evaluateExpectedLinks({
        generatedData: generatedConversationData,
        runId,
      })
    ).rejects.toThrow();
  });
});
