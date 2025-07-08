import "dotenv/config";
import { Eval, EvalCase, EvalScorer } from "mongodb-rag-core/braintrust";
import { createAzure } from "mongodb-rag-core/aiSdk";
import {
  assertEnvVars,
  CORE_OPENAI_ENV_VARS,
  defaultConversationConstants,
  SomeMessage,
} from "mongodb-rag-core";
import {
  FindContentFunc,
  FindContentFuncArgs,
  MongoDbPageStore,
  PersistedPage,
} from "mongodb-rag-core";
import {
  GenerateResponseParams,
  GenerateResponseReturnValue,
} from "mongodb-chatbot-server";
import { systemPrompt } from "../systemPrompt";
import { makeGenerateResponseWithTools } from "./generateResponseWithTools";
import { makeMongoDbReferences } from "./makeMongoDbReferences";
import { makeFetchPageTool, FETCH_PAGE_TOOL_NAME } from "../tools/fetchPage";
import { makeSearchTool, SEARCH_TOOL_NAME } from "../tools/search";
import { ObjectId } from "mongodb-rag-core/mongodb";

const { OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT } = assertEnvVars({
  ...CORE_OPENAI_ENV_VARS,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
});

// Store the desired content for each test in the EvalCase metadata
type IntermediateToolResponse = {
  loadPageReturnContent?: string;
  findContentReturnContent?: string;
};

type GenerateResponseInput = Partial<GenerateResponseParams> &
  Pick<GenerateResponseParams, "conversation" | "latestMessageText"> &
  IntermediateToolResponse;

type GenerateResponseExpectedMessage = {
  role: SomeMessage["role"] | "assistant-tool";
  toolCallName?: string;
  toolCallArgs?: Record<string, string>;
};

type GenerateResponseExpected = {
  messages: GenerateResponseExpectedMessage[];
};

const evalCases: EvalCase<
  GenerateResponseInput,
  GenerateResponseExpected,
  IntermediateToolResponse
>[] = [
  {
    input: {
      conversation: {
        _id: new ObjectId(),
        messages: [
          // {id: content: createdAt: role: }
        ],
        createdAt: new Date(),
      },
      latestMessageText:
        "Summarize this page https://www.mongodb.com/docs/atlas/data-federation/overview/",
      // customData: {}, // TODO For handling origin URL ("On this page...")
    },
    expected: {
      messages: [
        { role: "user" },
        {
          role: "assistant-tool",
          toolCallName: FETCH_PAGE_TOOL_NAME,
          toolCallArgs: {
            pageUrl:
              "https://www.mongodb.com/docs/atlas/data-federation/overview/",
          },
        },
        { role: "tool" },
        { role: "assistant" },
      ],
    },
    metadata: {
      loadPageReturnContent: `About Atlas Data Federation
Atlas Data Federation is a distributed query engine that allows you to natively query, transform, and move data across various sources inside & outside of MongoDB Atlas.

Key Concepts
Data Federation
Data Federation is a strategy that separates compute from storage. When you use Data Federation, you associate data from multiple physical sources into a single virtual source of data for your applications. This enables you to query your data from a single endpoint without physically copying or moving it.

Federated Database Instance
A federated database instance is a deployment of Atlas Data Federation. Each federated database instance contains virtual databases and collections that map to data in your data stores.`,
    },
  },
];

// const loadEvalCases = async () => {
// }

function doRolesMatch(expectedRole: string, actualRole: string): boolean {
  if (expectedRole === "assistant-tool" && actualRole === "assistant") {
    return true;
  }
  return expectedRole === actualRole;
}

/** Verify the correct tool calls were generated. */
const ScoreCorrectToolsCalled: EvalScorer<
  GenerateResponseInput,
  GenerateResponseReturnValue,
  GenerateResponseExpected
> = ({ output, expected }) => {
  if (output.messages.length !== expected.messages.length) {
    return {
      name: "CorrectToolCall",
      score: 0,
      metadata: {
        message: "Output and expected messages length were different",
      },
    };
  }

  // Verify messages[i].toolCall is the same as expected.messages[i]
  for (let i = 0; i < output.messages.length; i++) {
    const expectedMessage = expected.messages[i];
    const outputMessage = output.messages[i];

    // Do the message types match?
    if (!doRolesMatch(expectedMessage.role, outputMessage.role)) {
      return {
        name: "CorrectToolCall",
        score: 0,
        metadata: {
          message: `Role mismatch at index ${i}: Expected ${expectedMessage.role}, got ${outputMessage.role}`,
        },
      };
    }

    // Check for expected assistant tool call by matching assistant role and toolCall presence
    if (expectedMessage.role === "assistant-tool") {
      // Type guard for AssistantMessage with toolCall
      const hasToolCall =
        "toolCall" in outputMessage &&
        outputMessage.toolCall &&
        typeof outputMessage.toolCall === "object" &&
        "function" in outputMessage.toolCall;

      if (!hasToolCall) {
        return {
          name: "CorrectToolCall",
          score: 0,
          metadata: {
            message: `Assistant did not return a tool call`,
          },
        };
      }
      if (
        expectedMessage.toolCallName !== outputMessage.toolCall?.function.name
      ) {
        return {
          name: "CorrectToolCall",
          score: 0,
          metadata: {
            message: `Assistant returned the wrong tool call`,
          },
        };
      }
    }
  }
  return {
    name: "CorrectToolCall",
    score: 1,
  };
};

/** Verify the correct args were generated for the tool call(s) */
const ScoreToolsUsedCorrectly: EvalScorer<
  GenerateResponseInput,
  GenerateResponseReturnValue,
  GenerateResponseExpected
> = ({ output, expected }) => {
  let totalToolArgsCorrect = 0;
  let totalToolArgs = 0;
  for (
    let i = 0;
    i < output.messages.length && i < expected.messages.length;
    i++
  ) {
    const expectedMessage = expected.messages[i];
    const outputMessage = output.messages[i];

    // Not expecting tool call/no expected args to validate against.
    if (expectedMessage.role !== "assistant-tool") {
      continue;
    }
    if (!expectedMessage.toolCallArgs) {
      continue;
    }

    // Other scorer checks if correct tool was called
    const hasToolCall =
      "toolCall" in outputMessage &&
      outputMessage.toolCall &&
      typeof outputMessage.toolCall === "object" &&
      "function" in outputMessage.toolCall;
    if (!hasToolCall) {
      continue;
    }

    const outputArguments = JSON.parse(
      outputMessage.toolCall?.function.arguments ?? "{}"
    );
    for (const [key, value] of Object.entries(expectedMessage.toolCallArgs)) {
      totalToolArgs++;
      if (outputArguments?.[key] && outputArguments[key] === value) {
        totalToolArgsCorrect++;
      } else {
        console.log(
          `Mismatch on key ${key} between expected ${value} and output ${outputArguments[key]}`
        );
      }
    }
  }

  if (totalToolArgs === 0) {
    return {
      name: "CorrectToolCallUsage",
      score: null,
      metadata: {
        message: "No evaluation to peform - Zero expected args passed.",
      },
    };
  }
  return {
    name: "CorrectToolCallUsage",
    score: totalToolArgsCorrect / totalToolArgs,
  };
};

// Mock dependencies
const azureOpenAi = createAzure({
  apiKey: OPENAI_API_KEY,
  resourceName: process.env.OPENAI_RESOURCE_NAME,
});
const languageModel = azureOpenAi(OPENAI_CHAT_COMPLETION_DEPLOYMENT);

// Run the eval. We recreate generateResponseWithTools each time so
// we can pass different intermediate return values for lookup/search
Eval("mongodb-chatbot-generate-w-tools", {
  data: evalCases,
  experimentName: "mongodb-chatbot-generate-w-tools",
  maxConcurrency: 10,
  async task(input, hooks) {
    // Set up the findContent and loadPage functions with the return values in the eval case.
    const mockFindContent: FindContentFunc = async (
      _args: FindContentFuncArgs
    ) => {
      return {
        queryEmbedding: [1, 2, 3],
        content: hooks.metadata?.findContentReturnContent
          ? [
              {
                url: "<This is the URL>",
                score: 0.9,
                sourceName: "<This is the source name>",
                text:
                  (hooks.metadata?.findContentReturnContent as string) ??
                  "<Placeholder text>",
                tokenCount: 100,
                embeddings: { key: [1, 2, 3] },
                updated: new Date(),
              },
            ]
          : [],
      };
    };

    const loadPage: MongoDbPageStore["loadPage"] = async () => {
      return {
        url: "<This is the URL>",
        body:
          (hooks.metadata?.loadPageReturnContent as string) ??
          "<Placeholder content>",
        format: "md",
        sourceName: "<This is the source name>",
        metadata: {},
        title: "<This is the page title>",
        updated: new Date(),
        action: "updated",
      } satisfies PersistedPage;
    };

    const generateResponseWithTools = makeGenerateResponseWithTools({
      languageModel,
      systemMessage: systemPrompt,
      llmRefusalMessage: defaultConversationConstants.NO_RELEVANT_CONTENT,
      filterPreviousMessages: async (conversation) => {
        return conversation.messages.filter((message) => {
          return (
            message.role === "user" ||
            // Only include assistant messages that are not tool calls
            (message.role === "assistant" && !message.toolCall)
          );
        });
      },
      llmNotWorkingMessage: defaultConversationConstants.LLM_NOT_WORKING,
      searchTool: makeSearchTool({
        findContent: mockFindContent,
        makeReferences: makeMongoDbReferences,
      }),
      fetchPageTool: makeFetchPageTool({
        loadPage,
        findContent: mockFindContent,
        makeReferences: makeMongoDbReferences,
      }),
      toolChoice: "auto",
      maxSteps: 5,
    });

    const result = await generateResponseWithTools({
      conversation: input.conversation,
      latestMessageText: input.latestMessageText,
      reqId: "mock_req_id",
      shouldStream: false,
    });
    return result;
  },
  scores: [ScoreCorrectToolsCalled, ScoreToolsUsedCorrectly],
});
