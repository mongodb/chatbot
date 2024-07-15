import {
  AssistantMessage,
  Conversation,
  ObjectId,
  UserMessage,
} from "mongodb-chatbot-server";
import { EvaluateQualityFunc } from "../EvaluateQualityFunc";
import { PatronusEvaluatorClient } from "./PatronusEvaluatorClient";
import assert from "assert/strict";
import { z } from "zod";
import { SomeGeneratedData } from "../../generate";
/**
  Construct instances of {@link EvaluateQualityFunc}
  for the Patronus evaluators.
 */
export class PatronusEvaluateFuncFactory {
  /**
    Evaluates using `retrieval-answer-relevance-v2`.
    Measures whether the model answer is relevant to the user input.
   */
  static makeEvaluateAnswerRelevanceV2(
    patronusEvaluatorClient: PatronusEvaluatorClient,
    tags?: Record<string, string>
  ): EvaluateQualityFunc {
    return async ({ generatedData, runId }) => {
      const conversation = getConversationFromGeneratedData(generatedData);
      const lastUserMessage = getLastUserMessageFromConversation(conversation);
      const lastAssistantMessage =
        getLastAssistantMessageFromConversation(conversation);

      const evaluation =
        await patronusEvaluatorClient.evaluateAnswerRelevanceV2(
          lastUserMessage.content,
          lastAssistantMessage.content,
          {
            ...(tags ?? {}),
            runId: runId.toString(),
          }
        );
      return {
        _id: new ObjectId(),
        createdAt: new Date(),
        commandRunMetadataId: runId,
        generatedDataId: generatedData._id,
        type: "patronus-retrieval-answer-relevance-v2",
        result: evaluation.evaluation_result.score_normalized,
        metadata: {
          patronusApiResult: evaluation,
        },
      };
    };
  }

  /**
    Evaluates using `retrieval-context-relevance-v1`.
    Measures whether the retrieved context is relevant to the user input.
   */
  static makeEvaluateContextRelevanceV1(
    patronusEvaluatorClient: PatronusEvaluatorClient,
    tags?: Record<string, string>
  ): EvaluateQualityFunc {
    return async ({ generatedData, runId }) => {
      const conversation = getConversationFromGeneratedData(generatedData);
      const lastUserMessage = getLastUserMessageFromConversation(conversation);
      const contexts = getContextsFromUserMessage(lastUserMessage);

      const evaluation =
        await patronusEvaluatorClient.evaluateContextRelevanceV1(
          lastUserMessage.content,
          contexts,
          {
            ...(tags ?? {}),
            runId: runId.toString(),
          }
        );
      return {
        _id: new ObjectId(),
        createdAt: new Date(),
        commandRunMetadataId: runId,
        generatedDataId: generatedData._id,
        type: "patronus-retrieval-context-relevance-v1",
        result: evaluation.evaluation_result.score_normalized,
        metadata: {
          patronusApiResult: evaluation,
        },
      };
    };
  }

  /**
    Evaluates using `retrieval-hallucination-v2`.
    Measures whether the generated model output is faithful to the retrieved context
    (i.e. is there a hallucination in the response).
   */
  static makeEvaluateHallucinationV2(
    patronusEvaluatorClient: PatronusEvaluatorClient,
    tags?: Record<string, string>
  ): EvaluateQualityFunc {
    return async ({ generatedData, runId }) => {
      const conversation = getConversationFromGeneratedData(generatedData);
      const lastUserMessage = getLastUserMessageFromConversation(conversation);
      const contexts = getContextsFromUserMessage(lastUserMessage);
      const lastAssistantMessage =
        getLastAssistantMessageFromConversation(conversation);

      const evaluation = await patronusEvaluatorClient.evaluateHallucinationV2(
        lastUserMessage.content,
        lastAssistantMessage.content,
        contexts,
        {
          ...(tags ?? {}),
          runId: runId.toString(),
        }
      );
      return {
        _id: new ObjectId(),
        createdAt: new Date(),
        commandRunMetadataId: runId,
        generatedDataId: generatedData._id,
        type: "patronus-retrieval-hallucination-v2",
        result: evaluation.evaluation_result.score_normalized,
        metadata: {
          patronusApiResult: evaluation,
        },
      };
    };
  }
}
function getConversationFromGeneratedData(generatedData: SomeGeneratedData) {
  assert(generatedData.type === "conversation", "Must be conversation data");
  return generatedData.data as Conversation;
}

function getLastUserMessageFromConversation(
  conversation: Conversation
): UserMessage {
  const userMessage = [...conversation.messages]
    .reverse()
    .find((m) => m.role === "user");
  assert(userMessage, "Conversation must have a UserMessage");
  return userMessage satisfies UserMessage;
}
function getLastAssistantMessageFromConversation(
  conversation: Conversation
): AssistantMessage {
  const assistantMessage = [...conversation.messages]
    .reverse()
    .find((m) => m.role === "assistant");
  assert(assistantMessage, "Conversation must have a AssistantMessage");
  return assistantMessage satisfies AssistantMessage;
}

function getContextsFromUserMessage(userMessage: UserMessage) {
  const { data: contexts } = z
    .array(z.string())
    .safeParse(userMessage.contextContent?.map((cc) => cc.text));
  assert(contexts, "Last user message must have contextContent with text");
  return contexts;
}
