import {
  Eval,
  EvalCase,
  traced,
  EvalScorer,
} from "mongodb-rag-core/braintrust";
import { getConversationsEvalCasesFromYaml } from "mongodb-rag-core/eval";
import { MongoDbTag } from "./mongoDbMetadata";
import { config, conversations } from "./config";
import { systemPrompt } from "./systemPrompt";
import {
  Conversation,
  generateResponse,
  logger,
  Message,
} from "mongodb-chatbot-server";
import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  getContextsFromUserMessage,
  getLastAssistantMessageFromMessages,
  getLastUserMessageFromMessages,
  JUDGE_EMBEDDING_MODEL,
  JUDGE_LLM,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_ENDPOINT,
} from "./eval/evalHelpers";
import { AnswerRelevancy, ContextRelevancy, Faithfulness } from "autoevals";
import fs from "fs";
import path from "path";
import { strict as assert } from "assert";

interface ConversationEvalCaseInput {
  previousConversation: Conversation;
  latestMessageText: string;
}
interface ConversationEvalCase
  extends EvalCase<ConversationEvalCaseInput, unknown, unknown> {
  name: string;
  input: ConversationEvalCaseInput;
  tags?: MongoDbTag[];
}

interface ConversationTaskOutput {
  assistantMessageContent: string;
  context?: string[];
  allowedQuery: boolean;
}

type ConversationEvalScorer = EvalScorer<
  ConversationEvalCaseInput,
  ConversationTaskOutput,
  unknown
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

function getConversationRagasConfig(
  scorerArgs: Parameters<ConversationEvalScorer>[0],
  judgeModelConfig: {
    model: string;
    azureOpenAi: {
      apiKey: string;
      apiVersion: string;
      endpoint: string;
    };
  }
) {
  return {
    output: scorerArgs.output.assistantMessageContent,
    context: scorerArgs.output.context,
    input: scorerArgs.input.latestMessageText,
    model: judgeModelConfig.model,
    azureOpenAi: judgeModelConfig.azureOpenAi,
  };
}

const judgeModelConfig = {
  model: JUDGE_LLM,
  embeddingModel: JUDGE_EMBEDDING_MODEL,
  azureOpenAi: {
    apiKey: OPENAI_API_KEY,
    apiVersion: OPENAI_API_VERSION,
    endpoint: OPENAI_ENDPOINT,
  },
};

const ConversationFaithfulness: ConversationEvalScorer = async (args) => {
  return Faithfulness(getConversationRagasConfig(args, judgeModelConfig));
};

const ConversationAnswerRelevancy: ConversationEvalScorer = async (args) => {
  return AnswerRelevancy({
    ...getConversationRagasConfig(args, judgeModelConfig),
    embeddingModel: JUDGE_EMBEDDING_MODEL,
  });
};

const ConversationContextRelevancy: ConversationEvalScorer = async (args) => {
  return ContextRelevancy(getConversationRagasConfig(args, judgeModelConfig));
};

Eval("mongodb-chatbot-conversations", {
  data: async () => {
    const basePath = path.resolve(__dirname, "..", "evalCases");
    const miscCases = getConversationsEvalCasesFromYaml(
      fs.readFileSync(path.resolve(basePath, "conversations.yml"), "utf8")
    );
    const faqCases = getConversationsEvalCasesFromYaml(
      fs.readFileSync(path.resolve(basePath, "faq_conversations.yml"), "utf8")
    );
    return [...miscCases, ...faqCases].map((evalCase) => {
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
        ...systemPrompt,
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
        expected: null,
        metadata: null,
      } satisfies ConversationEvalCase;
    });
  },
  experimentName: "mongodb-chatbot-latest",
  metadata: {
    description: "Evaluates how well the MongoDB AI Chatbot RAG pipeline works",
  },
  maxConcurrency: 2,
  async task(input): Promise<ConversationTaskOutput> {
    try {
      const generated = await traced(
        async () =>
          generateResponse({
            conversation: input.previousConversation,
            latestMessageText: input.latestMessageText,
            llm: config.conversationsRouterConfig.llm,
            llmNotWorkingMessage:
              conversations.conversationConstants.LLM_NOT_WORKING,
            noRelevantContentMessage:
              conversations.conversationConstants.NO_RELEVANT_CONTENT,
            reqId: input.latestMessageText,
            shouldStream: false,
            generateUserPrompt:
              config.conversationsRouterConfig.generateUserPrompt,
            filterPreviousMessages:
              config.conversationsRouterConfig.filterPreviousMessages,
          }),
        {
          name: "generateResponse",
        }
      );
      const userMessage = getLastUserMessageFromMessages(generated.messages);
      const finalAssistantMessage = getLastAssistantMessageFromMessages(
        generated.messages
      );
      const context = getContextsFromUserMessage(userMessage);
      return {
        assistantMessageContent: finalAssistantMessage.content,
        context,
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
    ConversationFaithfulness,
    ConversationAnswerRelevancy,
    ConversationContextRelevancy,
  ],
});
