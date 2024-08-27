import { makeMockOpenAIToolCall } from "../test/mockOpenAi";
import { userMessageMongoDbGuardrail } from "./userMessageMongoDbGuardrail";
import { UserMessageMongoDbGuardrailFunction } from "./userMessageMongoDbGuardrail";
import { OpenAI } from "openai";

jest.mock("openai", () => {
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
