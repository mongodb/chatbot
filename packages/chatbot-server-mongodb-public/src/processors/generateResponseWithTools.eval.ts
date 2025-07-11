import "dotenv/config";
import path from "path";
import { strict as assert } from "assert";
import {
  getOpenAiEndpointAndApiKey,
  models,
  ModelConfig,
} from "mongodb-rag-core/models";
import { createOpenAI } from "mongodb-rag-core/aiSdk";
import { Eval, EvalCase, EvalScorer } from "mongodb-rag-core/braintrust";
import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  assertEnvVars,
  CORE_OPENAI_ENV_VARS,
  SomeMessage,
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
import {
  filterPreviousMessages,
  conversations,
  toolChoice,
  maxSteps,
} from "../config";
import { makeGenerateResponseWithTools } from "./generateResponseWithTools";
import { makeMongoDbReferences } from "./makeMongoDbReferences";
import { makeFetchPageTool } from "../tools/fetchPage";
import { makeSearchTool } from "../tools/search";
import { getGenerateWithToolsEvalCasesFromYamlFile } from "../eval/getGenerateWithToolEvalCasesFromYaml";

const { OPENAI_CHAT_COMPLETION_DEPLOYMENT } = assertEnvVars({
  ...CORE_OPENAI_ENV_VARS,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
});

// Store the desired content for each test in the EvalCase metadata
type IntermediateToolResponse = {
  loadPageReturnContent?: string;
  findContentReturnContent?: string;
};

type GenerateResponseInput = Partial<GenerateResponseParams> &
  Pick<GenerateResponseParams, "latestMessageText">;

type GenerateResponseExpectedMessage = {
  role: SomeMessage["role"] | "assistant-tool";
  toolCallName?: string;
  toolCallArgs?: Record<string, string>;
};

type GenerateResponseExpected = {
  messages: GenerateResponseExpectedMessage[];
};

// Load eval cases from a YAML file.
const evalCases: EvalCase<
  GenerateResponseInput,
  GenerateResponseExpected,
  IntermediateToolResponse
>[] = getGenerateWithToolsEvalCasesFromYamlFile(
  path.resolve(
    __dirname,
    "..",
    "..",
    "evalCases",
    "generate_response_with_tools.yml"
  )
);

/** Verify the correct tool calls were generated. */
const CorrectToolCall: EvalScorer<
  GenerateResponseInput,
  GenerateResponseReturnValue,
  GenerateResponseExpected
> = ({ output, expected }) => {
  const scoreName = "CorrectToolCall";
  if (output.messages.length !== expected.messages.length) {
    return {
      name: scoreName,
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

    // Check if the message types match
    if (
      !(
        expectedMessage.role === "assistant-tool" &&
        outputMessage.role === "assistant"
      ) &&
      expectedMessage.role !== outputMessage.role
    ) {
      return {
        name: scoreName,
        score: 0,
        metadata: {
          message: `Role mismatch at index ${i}: Expected ${expectedMessage.role}, got ${outputMessage.role}`,
        },
      };
    }

    // Check for expected assistant tool call by matching assistant role and toolCall presence
    if (expectedMessage.role === "assistant-tool") {
      const hasToolCall =
        "toolCall" in outputMessage &&
        outputMessage.toolCall &&
        typeof outputMessage.toolCall === "object" &&
        "function" in outputMessage.toolCall;

      if (!hasToolCall) {
        return {
          name: scoreName,
          score: 0,
          metadata: {
            message: `Assistant did not return a tool call where one was expected`,
            actual: outputMessage,
          },
        };
      }
      if (
        expectedMessage.toolCallName !== outputMessage.toolCall?.function.name
      ) {
        return {
          name: scoreName,
          score: 0,
          metadata: {
            message: `Assistant returned the wrong tool call`,
            actualToolCall: outputMessage.toolCall?.function.name,
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
const ToolsUsedCorrectly: EvalScorer<
  GenerateResponseInput,
  GenerateResponseReturnValue,
  GenerateResponseExpected
> = ({ output, expected }) => {
  const scoreName = "ToolsUsedCorrectly";
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

    // ScoreCorrectToolsCalled already checks if a tool was called, let's not duplicate that score.
    const hasToolCall =
      "toolCall" in outputMessage &&
      outputMessage.toolCall &&
      typeof outputMessage.toolCall === "object" &&
      "function" in outputMessage.toolCall;
    if (hasToolCall) {
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
  }

  if (totalToolArgs === 0) {
    return {
      name: scoreName,
      score: null,
      metadata: {
        message: "No evaluation to peform - Zero expected args passed.",
      },
    };
  }
  return {
    name: scoreName,
    score: totalToolArgsCorrect / totalToolArgs,
  };
};

const modelConfig: ModelConfig | undefined = models.find(
  (m) => m.label === OPENAI_CHAT_COMPLETION_DEPLOYMENT
);
assert(modelConfig, `Model ${OPENAI_CHAT_COMPLETION_DEPLOYMENT} not found`);

const createEvalLanguageModel = async (modelConfig: ModelConfig) => {
  const openai = createOpenAI(await getOpenAiEndpointAndApiKey(modelConfig));
  return openai.languageModel(OPENAI_CHAT_COMPLETION_DEPLOYMENT);
};

// Run the eval. We recreate generateResponseWithTools each time so
// we can pass different intermediate return values for lookup/search tools
Eval("mongodb-chatbot-generate-with-tools", {
  data: evalCases,
  experimentName: `generate-with-tools-${modelConfig.label}`,
  maxConcurrency: modelConfig.maxConcurrency,
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
      languageModel: await createEvalLanguageModel(modelConfig),
      systemMessage: systemPrompt,
      llmRefusalMessage:
        conversations.conversationConstants.NO_RELEVANT_CONTENT,
      filterPreviousMessages,
      llmNotWorkingMessage: conversations.conversationConstants.LLM_NOT_WORKING,
      searchTool: makeSearchTool({
        findContent: mockFindContent,
        makeReferences: makeMongoDbReferences,
      }),
      fetchPageTool: makeFetchPageTool({
        loadPage,
        findContent: mockFindContent,
        makeReferences: makeMongoDbReferences,
      }),
      toolChoice,
      maxSteps,
    });

    const result = await generateResponseWithTools({
      conversation: {
        _id: new ObjectId(),
        messages: [],
        createdAt: new Date(),
      },
      latestMessageText: input.latestMessageText,
      reqId: "mock_req_id",
      shouldStream: false,
    });
    return result;
  },
  scores: [CorrectToolCall, ToolsUsedCorrectly],
});
