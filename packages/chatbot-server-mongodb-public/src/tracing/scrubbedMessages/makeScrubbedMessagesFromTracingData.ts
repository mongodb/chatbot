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
}: {
  tracingData: ReturnType<typeof extractTracingData>;
  analysis?: {
    model: LanguageModel;
  };
  embeddingModelName: string;
}): Promise<ScrubbedMessage<MessageAnalysis>[]> {
  const { userMessage, assistantMessage } = tracingData;

  // User message scrubbing
  const userAnalysis = analysis
    ? await analyzeMessage(userMessage.content, analysis.model)
    : undefined;
  const { redactedText: redactedUserContent, piiFound: userMessagePii } =
    redactPii(userMessage.content);

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
  const assistantAnalysis = analysis && !tracingData.isVerifiedAnswer
    ? await analyzeMessage(assistantMessage.content, analysis.model) 
    : undefined;
  const {
    redactedText: redactedAssistantContent,
    piiFound: assistantMessagePii,
  } = redactPii(assistantMessage.content);
  
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
