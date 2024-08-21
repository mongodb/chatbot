import { extractMongoDbMetadataFromUserMessage } from "./extractMongoDbMetadataFromUserMessage";
import { OpenAI } from "openai";

jest.mock("openai", () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    function_call: {
                      arguments: JSON.stringify({
                        productName: "foo",
                      }),
                    },
                  },
                },
              ],
            }),
          },
        },
      };
    }),
  };
});

const args: Parameters<typeof extractMongoDbMetadataFromUserMessage>[0] = {
  openAiClient: new OpenAI({ apiKey: "fake-api-key" }),
  model: "best-model-eva",
  userMessageText: "hi",
};

describe("extractMongoDbMetadataFromUserMessage - unit tests", () => {
  test("should return metadata", async () => {
    expect(await extractMongoDbMetadataFromUserMessage(args)).toEqual({
      productName: "foo",
    });
  });
});
