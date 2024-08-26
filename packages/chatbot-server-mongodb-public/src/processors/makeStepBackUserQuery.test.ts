import { makeStepBackUserQuery } from "./makeStepBackUserQuery";
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
                        transformedUserQuery: "foo",
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
const args: Parameters<typeof makeStepBackUserQuery>[0] = {
  openAiClient: new OpenAI({ apiKey: "nope" }),
  model: "best-model-ever",
  userMessageText: "hi",
};

describe("makeStepBackUserQuery", () => {
  test("should return step back user query", async () => {
    expect(await makeStepBackUserQuery(args)).toEqual("foo");
  });
});
