import { Conversation, ConversationsService } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";

export type UpdateTraceFuncParams = {
  reqId: string;
  traceId: string;
  conversation: Conversation;
};

export type UpdateTraceFunc = (params: UpdateTraceFuncParams) => Promise<void>;

export async function updateTraceIfExists({
  updateTrace,
  reqId,
  conversations,
  assistantResponseMessageId,
  conversationId,
}: {
  updateTrace?: UpdateTraceFunc;
  reqId: string;
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
        reqId,
        traceId: assistantResponseMessageId.toHexString(),
        conversation: updatedConversationForTrace,
      });
    }
  }
}
