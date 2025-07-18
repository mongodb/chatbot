import { logRequest } from "../../utils";
import { extractTracingData } from "../extractTracingData";
import { analyzeMessage, MessageAnalysis } from "./analyzeMessage";
import { redactPii } from "./redactPii";
import { ScrubbedMessage } from "./ScrubbedMessage";
import { LanguageModel } from "mongodb-rag-core/aiSdk";
import { OriginCode } from "mongodb-chatbot-server";

export async function makeScrubbedMessagesFromTracingData({
  tracingData,
  analysis,
  embeddingModelName,
  reqId,
}: {
  tracingData: ReturnType<typeof extractTracingData>;
  analysis?: {
    model: LanguageModel;
  };
  embeddingModelName: string;
  reqId: string;
}): Promise<ScrubbedMessage<MessageAnalysis>[]> {
  const { userMessage, assistantMessage } = tracingData;
  if (!userMessage) {
    throw new Error("User message not found");
  }

  const { redactedText: redactedUserContent, piiFound: userMessagePii } =
    redactPii(userMessage.content);

  const userAnalysis = analysis
    ? await analyzeMessage(redactedUserContent, analysis.model).catch(
        (error) => {
          logRequest({
            reqId,
            message: `Error analyzing scrubbed user message in tracing: ${JSON.stringify(
              error
            )}`,
            type: "error",
          });
          return undefined;
        }
      )
    : undefined;

  const scrubbedUserMessage = {
    _id: userMessage.id,
    conversationId: tracingData.conversationId,
    index: tracingData.userMessageIndex,
    analysis: userAnalysis,
    role: userMessage.role,
    content: redactedUserContent,
    createdAt: userMessage.createdAt,
    customData: userMessage.customData,
    pii: userMessagePii?.length ? true : undefined,
    metadata: userMessage.metadata,
    response: {
      isVerifiedAnswer: tracingData?.isVerifiedAnswer ? true : false,
    },
    embedding: userMessage.embedding,
    embeddingModelName,
    messagePii: userMessagePii.length ? userMessagePii : undefined,
    userCommentPii: undefined,
    rejectQuery: userMessage.rejectQuery,
  } satisfies ScrubbedMessage<MessageAnalysis>;

  // Assistant message scrubbing
  const {
    redactedText: redactedAssistantContent,
    piiFound: assistantMessagePii,
  } = redactPii(assistantMessage.content);

  const assistantAnalysis =
    analysis && !tracingData.isVerifiedAnswer
      ? await analyzeMessage(redactedAssistantContent, analysis.model).catch(
          (error) => {
            logRequest({
              reqId,
              message: `Error analyzing scrubbed assistant message in tracing: ${JSON.stringify(
                error
              )}`,
              type: "error",
            });
            return undefined;
          }
        )
      : undefined;

  const scrubbedAssistantMessage = {
    _id: assistantMessage.id,
    conversationId: tracingData.conversationId,
    index: tracingData.assistantMessageIndex,
    analysis: assistantAnalysis,
    role: assistantMessage.role,
    content: redactedAssistantContent,
    createdAt: assistantMessage.createdAt,
    customData: assistantMessage.customData,
    request: {
      userTopics: userAnalysis?.topics,
      origin: userMessage?.customData?.origin as string,
      originCode: userMessage?.customData?.originCode as OriginCode,
    },
    pii: assistantMessagePii?.length ? true : undefined,
    metadata: assistantMessage.metadata,
    messagePii: assistantMessagePii.length ? assistantMessagePii : undefined,
  } satisfies ScrubbedMessage<MessageAnalysis>;
  return [scrubbedUserMessage, scrubbedAssistantMessage];
}
