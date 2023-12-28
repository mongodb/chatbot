import "dotenv/config";
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import { OpenAiChatMessage, Tool } from "./ChatLlm";
import { makeTestAppConfig, systemPrompt } from "../test/testHelpers";
import { makeOpenAiChatLlm } from "./openAiChatLlm";
import { assertEnvVars, CORE_ENV_VARS } from "mongodb-rag-core";
import { strict as assert } from "assert";

jest.setTimeout(30000);
const { OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT } =
  assertEnvVars(CORE_ENV_VARS);

const conversation = [
  systemPrompt,
  {
    role: "user",
    content: "How do I connect to my cluster?",
  },
] as OpenAiChatMessage[];
const testTools = [
  {
    definition: {
      name: "test_tool",
      description: "Test tool",
      parameters: {
        type: "object",
        properties: {
          test: {
            description: "Test parameter. Always be the string 'test'.",
            example: "test",
            type: "string",
          },
        },
        required: ["test"],
      },
    },
    async call() {
      return {
        functionMessage: {
          role: "assistant",
          name: "test_tool",
          content: "Test tool called",
        },
        rejectUserQuery: false,
        references: [
          {
            title: "test",
            url: "https://docs.mongodb.com",
          },
        ],
      };
    },
  },
] satisfies Tool[];

const openAiClient = new OpenAIClient(
  OPENAI_ENDPOINT,
  new AzureKeyCredential(OPENAI_API_KEY)
);
const toolOpenAiLlm = makeOpenAiChatLlm({
  openAiClient,
  deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  openAiLmmConfigOptions: {
    temperature: 0,
    maxTokens: 500,
    functionCall: {
      name: "test_tool",
    },
  },
  tools: testTools,
});

const { appConfig: config } = makeTestAppConfig();

describe("OpenAiLlm", () => {
  const openAiLlmService = config.conversationsRouterConfig.llm;
  test("should answer question in conversation - awaited", async () => {
    const response = await openAiLlmService.answerQuestionAwaited({
      messages: conversation,
    });
    expect(response.role).toBe("assistant");
    expect(response.content).toContain("MongoDB Shell");
    expect(response.content).toContain("MongoDB driver");
  });

  test("should answer question in conversation - streamed", async () => {
    const events = await openAiLlmService.answerQuestionStream({
      messages: conversation,
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
      });
    await expect(response).rejects.toThrow("No messages provided");
  });

  test("should call tool", async () => {
    const response = await toolOpenAiLlm.answerQuestionAwaited({
      messages: [
        {
          role: "user",
          content: "hi",
        },
      ],
    });
    assert(
      response.role === "assistant" && response.functionCall !== undefined
    );
    const toolResponse = await toolOpenAiLlm.callTool(response);
    expect(response.role).toBe("assistant");
    expect(response.functionCall.name).toBe("test_tool");
    expect(JSON.parse(response.functionCall.arguments)).toStrictEqual({
      test: "test",
    });
    expect(toolResponse).toStrictEqual({
      functionMessage: {
        role: "assistant",
        name: "test_tool",
        content: "Test tool called",
      },
      rejectUserQuery: false,
      references: [
        {
          title: "test",
          url: "https://docs.mongodb.com",
        },
      ],
    });
  });
  test("should throw error if calls tool that does not exist", async () => {
    await expect(
      toolOpenAiLlm.callTool({
        role: "assistant",
        functionCall: {
          name: "not_a_tool",
          arguments: JSON.stringify({
            test: "test",
          }),
        },
        content: "",
      })
    ).rejects.toThrow("Tool not found");
  });
  test("should throw error if calls a tool on a message that isn't a tool call", async () => {
    await expect(
      toolOpenAiLlm.callTool({
        role: "assistant",
        content: "",
      })
    ).rejects.toThrow("Message must be a tool call");
  });
});
