import { userMessageMongoDbGuardrail } from "./userMessageMongoDbGuardrail";

import { UserMessageMongoDbGuardrailFunction } from "./userMessageMongoDbGuardrail";
import OpenAI from "openai";

const funcRes = {
  reasoning: "foo",
  rejectMessage: false,
} satisfies UserMessageMongoDbGuardrailFunction;

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
                      arguments: JSON.stringify(funcRes),
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

const args = {
  openAiClient: new OpenAI({ apiKey: "fake-api-key" }),
  model: "best-model-eva",
  userMessageText: "hi",
};

describe("userMessageMongoDbGuardrail", () => {
  test("should return metadata", async () => {
    expect(await userMessageMongoDbGuardrail(args)).toEqual(funcRes);
  });
});
