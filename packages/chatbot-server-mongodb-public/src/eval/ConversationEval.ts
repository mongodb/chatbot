import "dotenv/config";
import {
  Eval,
  EvalCase,
  EvalScorer,
  traced,
} from "mongodb-rag-core/braintrust";
import {
  Conversation,
  generateResponse,
  GenerateResponseParams,
  logger,
  Message,
} from "mongodb-chatbot-server";
import { ObjectId } from "mongodb-rag-core/mongodb";

import {
  AnswerRelevancy,
  ContextRelevancy,
  Faithfulness,
  Factuality,
} from "autoevals";
import { strict as assert } from "assert";
import { MongoDbTag } from "../mongoDbMetadata";
import { fuzzyLinkMatch } from "./fuzzyLinkMatch";
import { binaryNdcgAtK } from "./scorers/binaryNdcgAtK";
import { ConversationEvalCase as ConversationEvalCaseSource } from "mongodb-rag-core/eval";
import {
  getLastUserMessageFromMessages,
  getLastAssistantMessageFromMessages,
  getContextsFromUserMessage,
} from "./evalHelpers";

interface ConversationEvalCaseInput {
  previousConversation: Conversation;
  latestMessageText: string;
}

type ConversationEvalCaseExpected = {
  links?: string[];
  reference?: string;
  expectation?: string;
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
    return Faithfulness(getConversationRagasConfig(args, judgeModelConfig));
  };

const makeConversationAnswerRelevancy: ConversationEvalScorerConstructor =
  (judgeModelConfig) => async (args) => {
    return AnswerRelevancy(getConversationRagasConfig(args, judgeModelConfig));
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
  generate: Pick<
    GenerateResponseParams,
    | "filterPreviousMessages"
    | "generateUserPrompt"
    | "llmNotWorkingMessage"
    | "llm"
    | "noRelevantContentMessage"
  > & {
    systemPrompt: {
      content: string;
      role: "system";
    };
  };
}
export function makeConversationEval({
  conversationEvalCases,
  judgeModelConfig,
  projectName,
  experimentName,
  metadata,
  maxConcurrency,
  generate,
}: MakeConversationEvalParams) {
  const Factuality = makeFactuality(judgeModelConfig);
  const Faithfullness = makeConversationFaithfulness(judgeModelConfig);
  const AnswerRelevancy = makeConversationAnswerRelevancy(judgeModelConfig);
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
        prevConversationMessages.unshift({
          ...generate.systemPrompt,
          id: new ObjectId(),
          createdAt: new Date(),
        } satisfies Message);
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
        const generated = await traced(
          async () =>
            generateResponse({
              conversation: input.previousConversation,
              latestMessageText: input.latestMessageText,
              llm: generate.llm,
              llmNotWorkingMessage: generate.llmNotWorkingMessage,
              noRelevantContentMessage: generate.noRelevantContentMessage,
              reqId: input.latestMessageText,
              shouldStream: false,
              generateUserPrompt: generate.generateUserPrompt,
              filterPreviousMessages: generate.filterPreviousMessages,
            }),
          {
            name: "generateResponse",
          }
        );
        const userMessage = getLastUserMessageFromMessages(generated.messages);
        const finalAssistantMessage = getLastAssistantMessageFromMessages(
          generated.messages
        );
        const contextInfo = getContextsFromUserMessage(userMessage);
        return {
          assistantMessageContent: finalAssistantMessage.content,
          context: contextInfo?.contexts,
          urls: contextInfo?.urls,
          allowedQuery: !userMessage.rejectQuery,
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
      AnswerRelevancy,
      ContextRelevancy,
    ],
  });
}
