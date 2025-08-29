import "dotenv/config";
import {
  Eval,
  EvalCase,
  EvalScorer,
  traced,
} from "mongodb-rag-core/braintrust";
import {
  Conversation,
  GenerateResponse,
  GenerateResponseReturnValue,
  logger,
  Message,
} from "mongodb-chatbot-server";
import { AssistantMessage, SomeMessage } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { models, ModelConfig } from "mongodb-rag-core/models";
import {
  createOpenAI,
  wrapLanguageModel,
  generateObject,
} from "mongodb-rag-core/aiSdk";
import { BraintrustMiddleware } from "mongodb-rag-core/braintrust";
import { OpenAI } from "mongodb-rag-core/openai";
import { ContextRelevancy, Faithfulness, Factuality } from "autoevals";
import { strict as assert } from "assert";
import { z } from "zod";
import { MongoDbTag } from "mongodb-rag-core/mongoDbMetadata";
import { fuzzyLinkMatch } from "./fuzzyLinkMatch";
import {
  binaryNdcgAtK,
  ConversationEvalCase as ConversationEvalCaseSource,
} from "mongodb-rag-core/eval";
import { extractTracingData } from "../tracing/extractTracingData";

interface ConversationEvalCaseInput {
  previousConversation: Conversation;
  latestMessageText: string;
  customData?: Record<string, unknown>;
  customSystemPrompt?: string;
  customToolDefinitions?: OpenAI.FunctionDefinition[] | undefined;
}

type ConversationExpectedMessage = {
  role: SomeMessage["role"] | "assistant-tool";
  toolCallName?: string;
  toolCallArgs?: Record<string, string>;
};

type ConversationEvalCaseExpected = {
  links?: string[];
  promptAdherence?: string[];
  messages?: ConversationExpectedMessage[];
  reference?: string;
  expectation?: string;
  reject?: boolean;
};

interface ConversationEvalCase
  extends EvalCase<
    ConversationEvalCaseInput,
    ConversationEvalCaseExpected,
    unknown
  > {
  name: string;
  input: ConversationEvalCaseInput;
  tags?: MongoDbTag[];
  expected: ConversationEvalCaseExpected;
}

interface ConversationTaskOutput {
  messages: GenerateResponseReturnValue["messages"];
  assistantMessageContent: string;
  context?: string[];
  urls?: string[];
  allowedQuery: boolean;
}

type ConversationEvalScorer = EvalScorer<
  ConversationEvalCaseInput,
  ConversationTaskOutput,
  ConversationEvalCaseExpected
>;

// -- Evaluation metrics --
const RetrievedContext: ConversationEvalScorer = async (args) => {
  const name = "RetrievedContext";
  if (!args.output.context) {
    return {
      name,
      score: null,
    };
  }
  return {
    name,
    score: args.output.context.length ? 1 : 0,
  };
};

const AllowedQuery: ConversationEvalScorer = async (args) => {
  return {
    name: "AllowedQuery",
    score: args.output.allowedQuery ? 1 : 0,
  };
};

const InputGuardrailExpected: ConversationEvalScorer = async (args) => {
  const name = "InputGuardrail";
  // Skip running eval if no expected reject
  if (!args.expected.reject) {
    return {
      name,
      score: null,
    };
  }
  const match = args.expected.reject === !args.output.allowedQuery;
  return {
    name,
    score: match ? 1 : 0,
  };
};

const BinaryNdcgAt5: ConversationEvalScorer = async (args) => {
  const name = "BinaryNdcgAt5";
  const k = 5;
  const outputLinks = args.output.urls ?? [];
  const expectedLinks = args.expected.links;
  // Only run the eval if there are expected links
  if (!expectedLinks) {
    return {
      name,
      score: null,
    };
  } else {
    return {
      name,
      score: binaryNdcgAtK(expectedLinks, outputLinks, fuzzyLinkMatch, k),
    };
  }
};

function getConversationRagasConfig(
  scorerArgs: Parameters<ConversationEvalScorer>[0],
  judgeModelConfig: {
    model: string;
    azureOpenAi: {
      apiKey: string;
      apiVersion: string;
      endpoint: string;
    };
    embeddingModel: string;
  }
) {
  return {
    output: scorerArgs.output.assistantMessageContent,
    context: scorerArgs.output.context,
    input: scorerArgs.input.latestMessageText,
    expected: scorerArgs.expected.reference,
    model: judgeModelConfig.model,
    embeddingModel: judgeModelConfig.embeddingModel,
    azureOpenAi: judgeModelConfig.azureOpenAi,
  };
}

export interface JudgeModelConfig {
  model: string;
  embeddingModel: string;
  azureOpenAi: {
    apiKey: string;
    apiVersion: string;
    endpoint: string;
  };
  braintrustProxy: {
    apiKey: string;
    endpoint: string;
  };
}

type ConversationEvalScorerConstructor = (
  judgeModelConfig: JudgeModelConfig
) => ConversationEvalScorer;

const makeConversationFaithfulness: ConversationEvalScorerConstructor =
  (judgeModelConfig) => async (args) => {
    if (args.output.context?.length === 0) {
      return {
        name: "Faithfulness",
        score: null,
      };
    }
    return Faithfulness(getConversationRagasConfig(args, judgeModelConfig));
  };

const makeConversationContextRelevancy: ConversationEvalScorerConstructor =
  (judgeModelConfig) => async (args) => {
    return ContextRelevancy(getConversationRagasConfig(args, judgeModelConfig));
  };

const makeFactuality: ConversationEvalScorerConstructor =
  (judgeModelConfig) => async (args) => {
    const name = "Factuality";
    // Only run factuality eval if there is a reference answer to evaluate against
    if (!args.expected.reference) {
      return {
        name,
        score: null,
      };
    } else
      return Factuality({
        ...getConversationRagasConfig(args, judgeModelConfig),
      });
  };

const createEvalJudgeModel = async (judgeModelConfig: JudgeModelConfig) => {
  const modelConfig: ModelConfig | undefined = models.find(
    (m) => m.label === judgeModelConfig.model
  );
  assert(
    modelConfig !== undefined,
    "No model config for the requested judge model."
  );

  return wrapLanguageModel({
    model: createOpenAI({
      apiKey: judgeModelConfig.braintrustProxy.apiKey,
      baseURL: judgeModelConfig.braintrustProxy.endpoint,
    }).chat(modelConfig.deployment),
    middleware: [BraintrustMiddleware({ debug: true })],
  });
};

const PromptAdherenceAssessmentPrompt = `You are assessing whether the given text aligns with the expectation for that text. If the text meets the expected criterion, you will score it as 1. 
Otherwise, if the text does not meet the expected criterion, you will score it as 0.

The input will be well-formatted JSON with the following structure:
{
  "context": <string: the text to evaluate.>,
  "criteria" : [<string: criteria 1>, ...,  <string: criteria n>],
}

You must output well-formatted JSON with the following structure. Each criteria should have a corresponding assessment in the response.
{
  "assessments": [
    {
      "reason": <string: your reasoning for the score given.>,
      "score": <int: 0 or 1>,
    }, ...
  ]
}

Do not return any preamble or explanations, return only a pure JSON string.
`;

const PromptAdherenceAssessmentSchema = z.object({
  assessments: z.array(
    z.object({
      reason: z.string(),
      score: z.number().int().min(0).max(1),
    })
  ),
});

const makePromptAdherence: ConversationEvalScorerConstructor = (
  judgeModelConfig
) => {
  return async (args) => {
    const name = "PromptAdherence";
    if (
      !args.expected?.promptAdherence ||
      args.expected.promptAdherence.length === 0
    ) {
      return {
        name,
        score: null,
      };
    }

    // Use LLM to score against all the criteria
    const judgeModel = await createEvalJudgeModel(judgeModelConfig);
    const { object } = await generateObject({
      model: judgeModel,
      schema: PromptAdherenceAssessmentSchema,
      messages: [
        {
          role: "system",
          content: PromptAdherenceAssessmentPrompt,
        },
        {
          role: "user",
          content: JSON.stringify({
            context: args.output.assistantMessageContent,
            criteria: args.expected.promptAdherence,
          }),
        },
      ],
    });

    const assessments = object.assessments;
    assert(assessments.length > 0, "No assessments found");
    return {
      name,
      score:
        assessments.reduce(
          (accumulator, current) => accumulator + current.score,
          0
        ) / args.expected?.promptAdherence.length,
      metadata: {
        scores: JSON.stringify(object),
      },
    };
  };
};

const ToolCallAmountCorrect: ConversationEvalScorer = (args) => {
  const name = "ToolCallAmountCorrect";
  if (args.expected?.messages === undefined) {
    return {
      name,
      score: null,
    };
  }

  const expectedToolCallCount = args.expected.messages.filter(
    (message) => message.role === "assistant-tool"
  ).length;
  const actualToolCallCount = args.output.messages.filter(
    (message) => message.role === "assistant" && message?.toolCall !== undefined
  ).length;

  if (expectedToolCallCount === 0) {
    return {
      name,
      score: actualToolCallCount === 0 ? 1 : 0,
      metadata: {
        actualToolCallCount,
        expectedToolCallCount,
      },
    };
  }
  return {
    name,
    score: actualToolCallCount / expectedToolCallCount,
    metadata: {
      actualToolCallCount,
      expectedToolCallCount,
    },
  };
};

/** Verify the messages called in the correct order with the correct tool calls */
const MessageOrderCorrect: ConversationEvalScorer = (args) => {
  const name = "MessageOrderCorrect";
  if (args.expected?.messages === undefined) {
    return {
      name,
      score: null,
    };
  }

  if (args.output.messages.length !== args.expected.messages.length) {
    return {
      name: name,
      score: 0,
      metadata: {
        message: "Output and expected messages length were different",
      },
    };
  }

  const numMatchingMessages = args.output.messages
    .map((outputMessage, idx) => {
      const expectedMessage = args.expected.messages?.[idx];

      // If the expected message is undefined, score 0
      if (!expectedMessage) {
        return 0;
      }

      const sameRole =
        (expectedMessage.role === "assistant-tool" &&
          outputMessage.role === "assistant") ||
        expectedMessage.role === outputMessage.role;

      // If different role, score 0
      if (!sameRole) {
        return 0;
      }

      // Also validate the correct tool was called (by name)
      const toolCall = (outputMessage as AssistantMessage).toolCall;
      if (toolCall?.type !== "function") {
        throw new Error("Expected function tool call");
      }
      const hasExpectedToolCall =
        outputMessage.role === "assistant"
          ? toolCall.function.name === expectedMessage.toolCallName
          : true;

      const messageScore: number = sameRole && hasExpectedToolCall ? 1 : 0;
      return messageScore;
    })
    .reduce((acc, score) => acc + score, 0);

  return {
    name: name,
    score: numMatchingMessages / args.output.messages.length,
    metadata: {
      numMatchingMessages,
      totalMessages: args.output.messages.length,
    },
  };
};

/** Verify the correct args were generated for the tool call(s) */
const ToolArgumentsCorrect: ConversationEvalScorer = (args) => {
  const name = "ToolArgumentsCorrect";
  if (args.expected?.messages === undefined) {
    return {
      name,
      score: null,
    };
  }
  let totalToolArgsCorrect = 0;
  let totalToolArgs = 0;

  args.output.messages.forEach((outputMessage, idx) => {
    const expectedMessage = args.expected.messages?.[idx];

    // We're not expecting anything.
    if (!expectedMessage) return;

    const sameRole =
      (expectedMessage.role === "assistant-tool" &&
        outputMessage.role === "assistant") ||
      expectedMessage.role === outputMessage.role;

    // There's a role mismatch (already caught in MessageOrderCorrect)
    if (!sameRole) return;

    const hasExpectedToolCallAndArgs =
      expectedMessage.role === "assistant-tool" &&
      expectedMessage.toolCallArgs !== undefined;

    // Check the correct args were passed to the tool
    if (hasExpectedToolCallAndArgs) {
      const toolCall = (outputMessage as AssistantMessage).toolCall;
      if (toolCall?.type !== "function") {
        throw new Error("Expected function tool call");
      }
      const outputArguments = JSON.parse(toolCall.function.arguments ?? "{}");
      for (const [key, value] of Object.entries(
        expectedMessage.toolCallArgs as Record<string, string>
      )) {
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
  });
  if (totalToolArgs === 0) {
    return {
      name,
      score: null,
      metadata: {
        message: "No evaluation to peform - Zero expected args passed.",
      },
    };
  }
  return {
    name,
    score: totalToolArgsCorrect / totalToolArgs,
    metadata: { totalToolArgsCorrect, totalToolArgs },
  };
};

export interface MakeConversationEvalParams {
  conversationEvalCases: ConversationEvalCaseSource[];
  judgeModelConfig: JudgeModelConfig;
  projectName: string;
  experimentName: string;
  metadata?: Record<string, unknown>;
  maxConcurrency?: number;
  generateResponse: GenerateResponse;
}
export async function makeConversationEval({
  conversationEvalCases,
  judgeModelConfig,
  projectName,
  experimentName,
  metadata,
  maxConcurrency,
  generateResponse,
}: MakeConversationEvalParams) {
  const Factuality = makeFactuality(judgeModelConfig);
  const Faithfullness = makeConversationFaithfulness(judgeModelConfig);
  const ContextRelevancy = makeConversationContextRelevancy(judgeModelConfig);
  const PromptAdherence = makePromptAdherence(judgeModelConfig);

  return Eval(projectName, {
    data: async () => {
      return conversationEvalCases.map((evalCase) => {
        const prevConversationMessages = evalCase.messages.slice(0, -1).map(
          (m) =>
            ({
              content: m.content,
              role: m.role,
              id: new ObjectId(),
              createdAt: new Date(),
              toolCall: m.toolCallName
                ? {
                    id: "tool-id",
                    type: "function",
                    function: {
                      name: m.toolCallName,
                      arguments: "{}",
                    },
                  }
                : undefined,
            } satisfies Message)
        );
        const latestMessageText = evalCase.messages.at(-1)?.content;
        assert(latestMessageText, "No latest message text found");
        return {
          name: evalCase.name,
          tags: evalCase.tags as MongoDbTag[],
          input: {
            latestMessageText,
            previousConversation: {
              messages: prevConversationMessages,
              _id: new ObjectId(),
              createdAt: new Date(),
            },
            customData: evalCase.customData,
            customSystemPrompt: evalCase.customSystemPrompt,
            customToolDefinitions:
              evalCase.customTools !== undefined
                ? evalCase.customTools.map((tool) => {
                    const functionDefinition: OpenAI.FunctionDefinition = {
                      name: tool.name,
                      description: tool.description,
                      strict: tool.strict,
                    };
                    if (tool.parameters) {
                      functionDefinition.parameters = {
                        type: "object",
                        properties: tool.parameters,
                      };
                    }
                    return functionDefinition;
                  })
                : undefined,
          },
          expected: {
            expectation: evalCase.expectation,
            reference: evalCase.reference,
            promptAdherence: evalCase.expectedPromptAdherence,
            messages: evalCase.expectedMessageDetail,
            links: evalCase.expectedLinks,
            reject: evalCase.reject,
          },
          metadata: null,
        } satisfies ConversationEvalCase;
      });
    },
    experimentName,
    metadata,
    maxConcurrency,
    async task(input): Promise<ConversationTaskOutput> {
      try {
        const id = new ObjectId();
        const { messages } = await traced(
          async () =>
            generateResponse({
              conversation: input.previousConversation,
              latestMessageText: input.latestMessageText,
              reqId: id.toHexString(),
              shouldStream: false,
              customSystemPrompt: input.customSystemPrompt,
              toolDefinitions: input.customToolDefinitions,
              customData: input.customData,
            }),
          {
            name: "generateResponse",
          }
        );
        const mockDbMessages = messages.map((m, i) => {
          const msgId = i === messages.length - 1 ? id : new ObjectId();
          return { ...m, id: msgId, createdAt: new Date() };
        });
        const assistantMessageIdx = mockDbMessages.findLastIndex(
          (m) => m.role === "assistant"
        );
        const assistantMessageId = mockDbMessages[assistantMessageIdx].id;

        const { rejectQuery, userMessage, contextContent, assistantMessage } =
          extractTracingData(mockDbMessages, assistantMessageId, id);
        assert(assistantMessage, "No assistant message found");
        assert(contextContent, "No context content found");
        assert(userMessage, "No user message found");
        return {
          messages,
          assistantMessageContent: assistantMessage.content,
          context: contextContent.map((c) => c.text),
          urls: assistantMessage.references?.map((r) => r.url),
          allowedQuery: !rejectQuery,
        };
      } catch (error) {
        logger.error(`Error evaluating input: ${input.latestMessageText}`);
        logger.error(error);
        throw error;
      }
    },
    scores: [
      AllowedQuery,
      RetrievedContext,
      BinaryNdcgAt5,
      Factuality,
      Faithfullness,
      InputGuardrailExpected,
      ContextRelevancy,
      PromptAdherence,
      ToolCallAmountCorrect,
      MessageOrderCorrect,
      ToolArgumentsCorrect,
    ],
  });
}
