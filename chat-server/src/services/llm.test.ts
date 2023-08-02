import "dotenv/config";

import { stripIndent } from "common-tags";
import { CORE_ENV_VARS, OpenAiChatMessage, assertEnvVars } from "chat-core";
import { makeOpenAiLlm } from "./llm";
import { SYSTEM_PROMPT } from "../aiConstants";

jest.setTimeout(100000);

const chunks = [
  stripIndent`You can connect to your cluster in a variety of ways. In this tutorial, you use one of the following methods:

  - The MongoDB Shell, an interactive command line interface to MongoDB. You can use  mongosh to insert and interact with data on your Atlas cluster.
  - MongoDB Compass, a GUI for your MongoDB data. You can use Compass to explore, modify, and visualize your data.
  - A MongoDB driver to communicate with your MongoDB database programmatically. To see all supported languages, refer to the MongoDB Driver documentation.`,
  stripIndent`The Connect dialog for a database deployment provides the details to connect to a database deployment with an application using a MongoDB driver.

  NOTE
  Serverless instances don't support connecting via certain drivers or driver versions at this time. To learn more, see Serverless Instance Limitations.`,
];
const conversation = [
  SYSTEM_PROMPT,
  {
    role: "user",
    content: "How do I connect to my cluster?",
  },
] as OpenAiChatMessage[];

const { OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT } =
  assertEnvVars(CORE_ENV_VARS);

describe("LLM", () => {
  describe("OpenAI Llm", () => {
    const openAiLlmService = makeOpenAiLlm({
      baseUrl: OPENAI_ENDPOINT,
      deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
      apiKey: OPENAI_API_KEY,
    });

    test.skip("should answer question in conversation - awaited", async () => {
      const response = await openAiLlmService.answerQuestionAwaited({
        messages: conversation,
        chunks,
      });
      expect(response.role).toBe("assistant");
      expect(response.content).toContain("MongoDB Shell");
      expect(response.content).toContain("MongoDB driver");
    });

    test("should answer question in conversation - streamed", async () => {
      const events = await openAiLlmService.answerQuestionStream({
        messages: conversation,
        chunks,
      });
      let count = 0;
      let message = "";
      await (async () => {
        for await (const event of events) {
          count++;
          for (const choice of event.choices) {
            const delta = choice.delta?.content;
            if (delta !== undefined) {
              message += delta;
            }
          }
        }
      })();
      expect(count).toBeGreaterThan(10);
      expect(message).toContain("MongoDB Compass");
      expect(message).toContain("MongoDB Shell");
      expect(message).toContain("MongoDB driver");
    });

    test("should not answer if no messages in conversation", async () => {
      const response = async () =>
        await openAiLlmService.answerQuestionAwaited({
          messages: [],
          chunks,
        });
      await expect(response).rejects.toThrow("No messages provided");
    });
    test("should not answer if no system prompt", async () => {
      const response = async () =>
        await openAiLlmService.answerQuestionAwaited({
          messages: conversation.slice(1),
          chunks,
        });
      await expect(response).rejects.toThrow(
        `First message must be system prompt: ${JSON.stringify(SYSTEM_PROMPT)}`
      );
    });
    test("should not answer if the second to last message is not assistant", async () => {
      const response = async () =>
        await openAiLlmService.answerQuestionAwaited({
          messages: [
            SYSTEM_PROMPT,
            {
              role: "user",
              content: "How do I connect to my cluster?",
            },
            {
              role: "user",
              content: "How do I connect to my cluster?",
            },
          ],
          chunks,
        });
      await expect(response).rejects.toThrow("Messages must alternate roles");
    });
    test("should not answer if last message not user", async () => {
      const test = async () =>
        await openAiLlmService.answerQuestionAwaited({
          messages: [
            SYSTEM_PROMPT,
            {
              role: "user",
              content: "What's the capital of the United States of America?",
            },
            {
              role: "assistant",
              content:
                "Hello, I'm a MongoDB documentation chatbot. How can I help you today?",
            },
          ],
          chunks,
        });
      await expect(test).rejects.toThrow("Last message must be user message");
    });
  });
});
