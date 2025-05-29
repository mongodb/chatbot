import { MockLanguageModelV1 } from "mongodb-rag-core/aiSdk";
import {
  makeMongoDbInputGuardrail,
  UserMessageMongoDbGuardrailFunction,
} from "./mongoDbInputGuardrail";
import {
  GenerateResponseParams,
  InputGuardrailResult,
} from "mongodb-chatbot-server";
import { ObjectId } from "mongodb-rag-core/mongodb";

describe("mongoDbInputGuardrail", () => {
  const mockGuardrailResult = {
    reasoning: "foo",
    type: "valid",
  } satisfies UserMessageMongoDbGuardrailFunction;
  const mockModel = new MockLanguageModelV1({
    defaultObjectGenerationMode: "json",
    doGenerate: async () => ({
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: "stop",
      usage: { promptTokens: 10, completionTokens: 20 },
      text: JSON.stringify(mockGuardrailResult),
    }),
  });

  const userMessageMongoDbGuardrail = makeMongoDbInputGuardrail({
    model: mockModel,
  });

  const mockInput: GenerateResponseParams = {
    latestMessageText: "hi",
    shouldStream: false,
    reqId: "reqId",
    conversation: {
      _id: new ObjectId(),
      messages: [],
      createdAt: new Date(),
    },
  };

  test("should return guardrail results", async () => {
    expect(await userMessageMongoDbGuardrail(mockInput)).toMatchObject({
      metadata: { type: "valid" },
      rejected: false,
      reason: mockGuardrailResult.reasoning,
    } satisfies InputGuardrailResult);
  });
});
