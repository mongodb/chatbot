import {
  AssistantMessage,
  Conversation,
  ObjectId,
  UserMessage,
} from "mongodb-chatbot-server";
import { EvaluateQualityFunc } from "../EvaluateQualityFunc";
import {
  PatronusEvaluationApiResult,
  PatronusEvaluatorClient,
} from "./PatronusEvaluatorClient";
import assert from "assert/strict";
import { z } from "zod";
import { SomeGeneratedData } from "../../generate";
import { EvalResult } from "../EvaluationStore";

/**
  Evaluates using `retrieval-answer-relevance-v2`.
  Measures whether the model answer is relevant to the user input.
 */
export function makeEvaluateAnswerRelevanceV2(
  patronusEvaluatorClient: PatronusEvaluatorClient,
  tags?: Record<string, string>
): EvaluateQualityFunc {
  return async ({ generatedData, runId }) => {
    const conversation = getConversationFromGeneratedData(generatedData);
    const lastUserMessage = getLastUserMessageFromConversation(conversation);
    const lastAssistantMessage =
      getLastAssistantMessageFromConversation(conversation);

    const evaluation = await patronusEvaluatorClient.evaluateAnswerRelevanceV2(
      lastUserMessage.content,
      lastAssistantMessage.content,
      {
        ...(tags ?? {}),
        runId: runId.toString(),
      }
    );

    return makeEvalResult(
      runId,
      generatedData,
      "patronus-retrieval-answer-relevance-v2",
      evaluation
    );
  };
}

/**
  Evaluates using `retrieval-context-relevance-v1`.
  Measures whether the retrieved context is relevant to the user input.
 */
export function makeEvaluateContextRelevanceV1(
  patronusEvaluatorClient: PatronusEvaluatorClient,
  tags?: Record<string, string>
): EvaluateQualityFunc {
  return async ({ generatedData, runId }) => {
    const conversation = getConversationFromGeneratedData(generatedData);
    const lastUserMessage = getLastUserMessageFromConversation(conversation);
    const contexts = getContextsFromUserMessage(lastUserMessage);

    const evaluation = await patronusEvaluatorClient.evaluateContextRelevanceV1(
      lastUserMessage.content,
      contexts,
      {
        ...(tags ?? {}),
        runId: runId.toString(),
      }
    );

    return makeEvalResult(
      runId,
      generatedData,
      "patronus-retrieval-context-relevance-v1",
      evaluation
    );
  };
}

/**
  Evaluates using `retrieval-hallucination-v2`.
  Measures whether the generated model output is faithful to the retrieved context
  (i.e. is there a hallucination in the response).
 */
export function makeEvaluateHallucinationV2(
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
    return makeEvalResult(
      runId,
      generatedData,
      "patronus-retrieval-hallucination-v2",
      evaluation
    );
  };
}

function makeEvalResult(
  runId: ObjectId,
  generatedData: SomeGeneratedData,
  type: string,
  evaluation: PatronusEvaluationApiResult
): EvalResult {
  return {
    _id: new ObjectId(),
    createdAt: new Date(),
    commandRunMetadataId: runId,
    generatedDataId: generatedData._id,
    type,
    result: evaluation.evaluation_result.score_normalized,
    metadata: {
      patronusApiResult: evaluation,
    },
  };
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
