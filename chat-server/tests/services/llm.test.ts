import { stripIndent } from "common-tags";
import {
  OpenAiChatClient,
  SYSTEM_PROMPT,
  GENERATE_USER_PROMPT,
} from "../../src/integrations/openai";
import { OpenAiLlmProvider } from "../../src/services/llm";
import "dotenv/config";

jest.setTimeout(10000);

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
    role: "assistant",
    content:
      "Hello, I'm a MongoDB documentation chatbot. How can I help you today?",
  },
  {
    role: "user",
    content: "How do I connect to my cluster?",
  },
];

describe("LLM", () => {
  describe("OpenAiLlmProvider", () => {
    const {
      OPENAI_ENDPOINT,
      OPENAI_CHAT_COMPLETION_DEPLOYMENT,
      OPENAI_API_KEY,
    } = process.env;
    const openAiClient = new OpenAiChatClient(
      OPENAI_ENDPOINT!,
      OPENAI_CHAT_COMPLETION_DEPLOYMENT!,
      OPENAI_API_KEY!
    );
    const openAiLlmService = new OpenAiLlmProvider(openAiClient);

    test("should answer question in conversation - awaited", async () => {
      const response = await openAiLlmService.answerQuestionAwaited({
        messages: conversation,
        chunks,
      });
      expect(response.role).toBe("assistant");
      expect(response.content).toContain("MongoDB Compass");
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
    test("should not answer if second to last message not assistant", async () => {
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
      await expect(response).rejects.toThrow(
        "Second to last message must be assistant message"
      );
    });
    test("should not answer if last message not user", async () => {
      const response = async () =>
        await openAiLlmService.answerQuestionAwaited({
          messages: [
            SYSTEM_PROMPT,
            {
              role: "assistant",
              content:
                "Hello, I'm a MongoDB documentation chatbot. How can I help you today?",
            },
            {
              role: "assistant",
              content:
                "Hello, I'm a MongoDB documentation chatbot. How can I help you today?",
            },
          ],
          chunks,
        });
      await expect(response).rejects.toThrow(
        "Last message must be user message"
      );
    });
  });
});
