import { makeMockOpenAIToolCall } from "../test/mockOpenAi";
import { userMessageMongoDbGuardrail } from "./userMessageMongoDbGuardrail";
import { OpenAI } from "mongodb-rag-core/openai";

jest.mock("mongodb-rag-core/openai", () => {
  return makeMockOpenAIToolCall({
    reasoning: "foo",
    rejectMessage: false,
  });
});

describe("userMessageMongoDbGuardrail", () => {
  const args = {
    openAiClient: new OpenAI({ apiKey: "fake-api-key" }),
    model: "best-model-eva",
    userMessageText: "hi",
  };
  test("should return metadata", async () => {
    expect(await userMessageMongoDbGuardrail(args)).toEqual({
      reasoning: "foo",
      rejectMessage: false,
    });
  });
});
