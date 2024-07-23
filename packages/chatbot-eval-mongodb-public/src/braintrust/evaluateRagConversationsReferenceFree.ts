import * as braintrust from "braintrust";
import { AnswerRelevancy, ContextRelevancy, Faithfulness } from "autoevals";
import { ConversationGeneratedData } from "mongodb-chatbot-evaluation";
import { PromisePool } from "@supercharge/promise-pool";
import assert from "assert";
import {
  Conversation,
  UserMessage,
  AssistantMessage,
} from "mongodb-chatbot-server";
import { z } from "zod";
export interface EvaluateRagConversationsParams {
  projectName: string;
  conversationGeneratedData: ConversationGeneratedData[];
  evaluatorConfig: {
    apiKey: string;
    modelName: string;
    baseUrl?: string;
    headers?: Record<string, string>;
  };
  metadata?: Record<string, unknown>;
  description?: string;
  experimentName?: string;
}

/**
  Evaluates a {@link ConversationGeneratedData}
  based on the reference-free evaluation metrics from the `autoevals` library:

  - {@link Faithfulness}
  - {@link AnswerRelevancy}
  - {@link ContextRelevancy}
 */
export async function evaluateRagConversationsReferenceFree({
  projectName,
  conversationGeneratedData,
  evaluatorConfig,
  metadata,
  description,
  experimentName,
}: EvaluateRagConversationsParams) {
  const experiment = braintrust.init(projectName, {
    metadata,
    // TODO: see what these are...
    description,
    experiment: experimentName,
  });

  await PromisePool.for(conversationGeneratedData)
    .withConcurrency(3)
    .process(async (conversation, index, pool) => {
      console.log(
        `Running experiment ${index + 1}/${conversationGeneratedData.length}`
      );
      await experiment.traced(async (span) => {
        const { input, output, contexts, tags } =
          extractConversationEvalData(conversation);

        const scores: Record<string, number | null> = {};
        const evaluators = [Faithfulness, AnswerRelevancy, ContextRelevancy];
        for (const evaluator of evaluators) {
          const { name, score } = await evaluator({
            input,
            output,
            context: contexts,
            openAiApiKey: evaluatorConfig.apiKey,
            model: evaluatorConfig.modelName,
            openAiBaseUrl: evaluatorConfig.baseUrl,
            openAiDefaultHeaders: evaluatorConfig.headers,
          });
          scores[name] = score;
        }

        span.log({
          input,
          output,
          tags,
          scores,
          metadata: { contexts },
        });
      });
    });

  const summary = await experiment.summarize();
  console.log(summary);
  return summary;
}

function extractConversationEvalData(
  conversationGeneratedData: ConversationGeneratedData
) {
  const { data: conversation } = conversationGeneratedData;
  const userMessage = getLastUserMessageFromConversation(conversation);
  const contexts = getContextsFromUserMessage(userMessage);
  const { content: output } =
    getLastAssistantMessageFromConversation(conversation);
  return {
    input: userMessage.content,
    output,
    contexts,
    tags: conversationGeneratedData.evalData.tags,
  };
}

function getLastUserMessageFromConversation(
  conversation: Conversation
): UserMessage {
  const userMessage = [...conversation.messages]
    .reverse()
    .find((m) => m.role === "user");
  assert(userMessage, "Conversation must have a UserMessage");
  return userMessage as UserMessage;
}
function getLastAssistantMessageFromConversation(
  conversation: Conversation
): AssistantMessage {
  const assistantMessage = [...conversation.messages]
    .reverse()
    .find((m) => m.role === "assistant");
  assert(assistantMessage, "Conversation must have a AssistantMessage");
  return assistantMessage as AssistantMessage;
}

function getContextsFromUserMessage(userMessage: UserMessage) {
  const { data: contexts } = z
    .array(z.string())
    .safeParse(userMessage.contextContent?.map((cc) => cc.text));
  // Return empty array if no context text found
  return contexts ?? [];
}
