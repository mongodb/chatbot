import { Conversation, ConversationsService } from "mongodb-rag-core";
import { braintrustLogger } from "mongodb-rag-core/braintrust";
import { ObjectId } from "mongodb-rag-core/mongodb";

export type UpdateTraceFuncParams = {
  traceId: string;
  logger: typeof braintrustLogger;
  conversation: Conversation;
};

export type UpdateTraceFunc = (params: UpdateTraceFuncParams) => Promise<void>;

export async function updateTraceIfExists({
  updateTrace,
  conversations,
  assistantResponseMessageId,
  conversationId,
}: {
  updateTrace?: UpdateTraceFunc;
  conversations: ConversationsService;
  assistantResponseMessageId: ObjectId;
  conversationId: ObjectId;
}) {
  if (updateTrace) {
    // Get latest version of conversation
    const updatedConversationForTrace = await conversations.findById({
      _id: conversationId,
    });
    if (updatedConversationForTrace !== null) {
      await updateTrace({
        traceId: assistantResponseMessageId.toHexString(),
        logger: braintrustLogger,
        conversation: updatedConversationForTrace,
      });
    }
  }
}
