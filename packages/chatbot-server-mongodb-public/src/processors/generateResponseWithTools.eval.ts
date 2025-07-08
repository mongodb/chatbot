import "dotenv/config";
import { Eval, EvalCase, EvalScorer } from "mongodb-rag-core/braintrust";
import { createAzure } from "mongodb-rag-core/aiSdk";
import {
  assertEnvVars,
  CORE_OPENAI_ENV_VARS,
  defaultConversationConstants,
  SomeMessage,
  AssistantMessage,
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

// These evals only validate the correct tool / followup is chosen,
// it does not evaluate the response for correctness

type GenerateResponseInput = Partial<GenerateResponseParams> &
  Pick<GenerateResponseParams, "conversation" | "latestMessageText">;

type GenerateResponseExpectedMessage = {
  role: SomeMessage["role"] | "assistant-tool";
  toolCallName?: string;
  toolCallArgs?: string;
};

type GenerateResponseExpected = {
  messages: GenerateResponseExpectedMessage[];
};

const evalCases: EvalCase<
  GenerateResponseInput,
  GenerateResponseExpected,
  void
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
    },
    // customData: {}, // For origin URL
    expected: {
      messages: [
        { role: "user" },
        {
          role: "assistant-tool",
          toolCallName: FETCH_PAGE_TOOL_NAME,
          toolCallArgs: "",
        }, // toolCallArgs is JSON string
        { role: "tool" },
        { role: "assistant" },
      ],
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

// /** Verify the correct args were generated for the tool call(s). */
// const ScoreCorrectToolsUsage: EvalScorer<
//   GenerateResponseInput,
//   GenerateResponseReturnValue,
//   GenerateResponseExpected
// > = ({ output, expected }) => {
//     if (output.messages.length !== expected.messages.length) {
//     return {
//       name: "CorrectToolCallUsage",
//       score: 0,
//       metadata: {
//         message: "Output and expected messages length were different",
//       },
//     };
//   }
//   for (let i = 0; i < output.messages.length; i++) {
//     const expectedMessage = expected.messages[i];
//     const outputMessage = output.messages[i];
// }

// Mock dependencies & create generateResponseWithTools function
const azureOpenAi = createAzure({
  apiKey: OPENAI_API_KEY,
  resourceName: process.env.OPENAI_RESOURCE_NAME,
});
const languageModel = azureOpenAi(OPENAI_CHAT_COMPLETION_DEPLOYMENT);

const mockFindContent: FindContentFunc = async (args: FindContentFuncArgs) => {
  return {
    queryEmbedding: [1, 2, 3],
    content: [
      {
        url: "mock_url",
        score: 0.9,
        sourceName: "mock_src",
        text: "mock_text",
        tokenCount: 100,
        embeddings: { key: [1, 2, 3] },
        updated: new Date(),
      },
    ],
  };
};

const mockPageContent = {
  url: "example.com",
  body: "Example page body",
  format: "md",
  sourceName: "test source name",
  metadata: {},
  title: "Example Page",
  updated: new Date(),
  action: "created",
} satisfies PersistedPage;

const loadPage: MongoDbPageStore["loadPage"] = async () => mockPageContent;

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

// Run the Braintrust eval
// function makeGenerateResponseWithToolsEvalTask() {
//   return async function (input) {
//     const response = await generateResponseWithTools({
//       conversation: input.conversation,
//       latestMessageText: input.latestMessageText,
//       shouldStream: false,
//       reqId: "mock_req_id",
//     });
//   }
// }

// Eval<Input, GenerateResponseReturnValue>("generateResponseWithTools", {
//   data: evalCases,
//   maxConcurrency: 10,
//   task: makeGenerateResponseWithToolsEvalTask(),
//   scores: [evalScorerFxn],
// });

Eval("mongodb-chatbot-generate-w-tools", {
  data: evalCases,
  experimentName: "mongodb-chatbot-generate-w-tools",
  maxConcurrency: 10,
  async task(input) {
    const result = await generateResponseWithTools({
      conversation: input.conversation,
      latestMessageText: input.latestMessageText,
      reqId: "mock_req_id",
      shouldStream: false,
    });
    return result;
  },
  scores: [ScoreCorrectToolsCalled], //, ScoreCorrectToolsArgs],
});
