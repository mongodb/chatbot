import { logRequest } from "../../utils";
import { extractTracingData } from "../extractTracingData";
import { analyzeMessage, MessageAnalysis } from "./analyzeMessage";
import { redactPii } from "./redactPii";
import { ScrubbedMessage } from "./ScrubbedMessage";
import { LanguageModel } from "mongodb-rag-core/aiSdk";

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

  const userAnalysis = analysis
    ? await analyzeMessage(userMessage.content, analysis.model).catch(
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
  const scrubbedAssistantMessage = {
    _id: assistantMessage.id,
    conversationId: tracingData.conversationId,
    index: tracingData.assistantMessageIndex,
    role: assistantMessage.role,
    content: redactedAssistantContent,
    createdAt: assistantMessage.createdAt,
    customData: assistantMessage.customData,
    pii: assistantMessagePii?.length ? true : undefined,
    metadata: assistantMessage.metadata,
    messagePii: assistantMessagePii.length ? assistantMessagePii : undefined,
  } satisfies ScrubbedMessage<MessageAnalysis>;
  return [scrubbedUserMessage, scrubbedAssistantMessage];
}
