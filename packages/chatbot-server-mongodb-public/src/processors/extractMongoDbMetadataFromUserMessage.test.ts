import { makeMockOpenAIToolCall } from "../test/mockOpenAi";
import { extractMongoDbMetadataFromUserMessage } from "./extractMongoDbMetadataFromUserMessage";
import { OpenAI } from "openai";

jest.mock("openai", () => {
  return makeMockOpenAIToolCall({
    productName: "foo",
  });
});

describe("extractMongoDbMetadataFromUserMessage", () => {
  const args: Parameters<typeof extractMongoDbMetadataFromUserMessage>[0] = {
    openAiClient: new OpenAI({ apiKey: "fake-api-key" }),
    model: "best-model-eva",
    userMessageText: "hi",
  };
  test("should return metadata", async () => {
    const res = await extractMongoDbMetadataFromUserMessage(args);
    console.log(res);
    expect(res).toEqual({
      productName: "foo",
    });
  });
});
