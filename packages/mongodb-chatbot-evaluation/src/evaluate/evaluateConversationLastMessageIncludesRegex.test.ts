import { ObjectId } from "mongodb-rag-core";
import { ConversationGeneratedData } from "../generate";
import { EvalResult } from "./EvaluationStore";
import { makeEvaluateConversationLastMessageIncludesRegex } from "./evaluateConversationLastMessageIncludesRegex";

const generateConversationData = (lastMessageContent: string) =>
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
          content: lastMessageContent,
        },
      ],
    },
    evalData: {
      name: "User name",
    },
    createdAt: new Date(),
  } satisfies ConversationGeneratedData);
describe("evaluateLastMessageIncludesRegex", () => {
  const testRegex = /foo/i;
  const evaluateLastMessageIncludesRegex =
    makeEvaluateConversationLastMessageIncludesRegex({
      regex: testRegex,
    });
  it("should return 1 when matches regex", async () => {
    const testString = "FooBar";
    const generatedConversationData = generateConversationData(testString);
    const runId = new ObjectId();
    const evalResult = await evaluateLastMessageIncludesRegex({
      generatedData: generatedConversationData,
      runId,
    });
    expect(evalResult).toMatchObject({
      result: 1,
      generatedDataId: generatedConversationData._id,
      type: "conversation_last_message_includes_regex",
      commandRunMetadataId: runId,
      createdAt: expect.any(Date),
      _id: expect.any(ObjectId),
      metadata: {
        testName: generatedConversationData.evalData.name,
        regex: testRegex.toString(),
        lastMessageContent: testString,
      },
    } satisfies EvalResult);
  });
  it("should return 0 when does not match regex", async () => {
    const testString = "fizzbuzz";
    const generatedConversationData = generateConversationData(testString);
    const runId = new ObjectId();
    const evalResult = await evaluateLastMessageIncludesRegex({
      generatedData: generatedConversationData,
      runId,
    });
    expect(evalResult).toMatchObject({
      result: 0,
      generatedDataId: generatedConversationData._id,
      type: "conversation_last_message_includes_regex",
      commandRunMetadataId: runId,
      createdAt: expect.any(Date),
      _id: expect.any(ObjectId),
      metadata: {
        testName: generatedConversationData.evalData.name,
        regex: testRegex.toString(),
        lastMessageContent: testString,
      },
    } satisfies EvalResult);
  });
});
