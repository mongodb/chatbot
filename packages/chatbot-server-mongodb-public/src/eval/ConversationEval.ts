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
  logger,
  Message,
} from "mongodb-chatbot-server";
import { ObjectId } from "mongodb-rag-core/mongodb";

import { ContextRelevancy, Faithfulness, Factuality } from "autoevals";
import { strict as assert } from "assert";
import { MongoDbTag } from "../mongoDbMetadata";
import { fuzzyLinkMatch } from "./fuzzyLinkMatch";
import { binaryNdcgAtK } from "./scorers/binaryNdcgAtK";
import { ConversationEvalCase as ConversationEvalCaseSource } from "mongodb-rag-core/eval";
import { extractTracingData } from "../tracing/extractTracingData";

interface ConversationEvalCaseInput {
  previousConversation: Conversation;
  latestMessageText: string;
}

type ConversationEvalCaseExpected = {
  links?: string[];
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
  args.output.context;
  return {
    name: "RetrievedContext",
    score: args.output.context?.length ? 1 : 0,
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
          },
          expected: {
            expectation: evalCase.expectation,
            reference: evalCase.reference,
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
            }),
          {
            name: "generateResponse",
          }
        );
        const mockDbMessages = messages.map((m, i) => {
          const msgId = i === messages.length - 1 ? id : new ObjectId();
          return { ...m, id: msgId, createdAt: new Date() };
        });

        const { rejectQuery, userMessage, contextContent, assistantMessage } =
          extractTracingData(mockDbMessages, id);
        assert(assistantMessage, "No assistant message found");
        assert(contextContent, "No context content found");
        assert(userMessage, "No user message found");
        return {
          assistantMessageContent: assistantMessage.content,
          context: contextContent.map((c) => c.text),
          urls: contextContent.map((c) => c.url),
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
    ],
  });
}
