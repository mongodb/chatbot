import { makeMockOpenAIToolCall } from "../test/mockOpenAi";
import { makeStepBackUserQuery } from "./makeStepBackUserQuery";
import { OpenAI } from "mongodb-rag-core/openai";
jest.mock("mongodb-rag-core/openai", () =>
  makeMockOpenAIToolCall({ transformedUserQuery: "foo" })
);

describe("makeStepBackUserQuery", () => {
  const args: Parameters<typeof makeStepBackUserQuery>[0] = {
    openAiClient: new OpenAI({ apiKey: "fake-api-key" }),
    model: "best-model-ever",
    userMessageText: "hi",
  };

  test("should return step back user query", async () => {
    expect(await makeStepBackUserQuery(args)).toEqual({
      transformedUserQuery: "foo",
    });
  });
});
