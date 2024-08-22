import { OpenAIClient } from "@azure/openai";
import { makeStepBackUserQuery } from "./makeStepBackUserQuery";
import {
  openAiClient,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  cosineSimilarity,
} from "../test/testHelpers";
import { embedder } from "../config";
import { ObjectId } from "mongodb-chatbot-server";

const args: Parameters<typeof makeStepBackUserQuery>[0] = {
  openAiClient,
  deploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  userMessageText: "hi",
};

const mockOpenAIClient = {
  async getChatCompletions() {
    return {
      choices: [
        {
          message: {
            functionCall: {
              name: "step_back_user_query",
              arguments: JSON.stringify({
                transformedUserQuery: "foo",
              }),
            },
          },
        },
      ],
    };
  },
};

describe("makeStepBackUserQuery - unit tests", () => {
  test("should return step back user query", async () => {
    expect(
      await makeStepBackUserQuery({
        ...args,
        openAiClient: mockOpenAIClient as unknown as OpenAIClient,
      })
    ).toEqual("foo");
  });
});
