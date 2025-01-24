import { Message } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { strict as assert } from "assert";

export function extractSampleMessages({
  messages,
  targetMessageId,
  maxNumMessagesBefore = 5,
  maxNumMessagesAfter = 2,
}: {
  messages: Message[];
  targetMessageId: ObjectId;
  maxNumMessagesBefore?: number;
  maxNumMessagesAfter?: number;
}) {
  const commentIdx = messages.findLastIndex((message) =>
    message.id.equals(targetMessageId)
  );
  assert(
    commentIdx !== -1,
    `Comment for message with ID ${targetMessageId.toHexString()} not found in messages with a comment.`
  );
  const sampleMessagesStartIndex = Math.max(
    0,
    commentIdx - maxNumMessagesBefore
  );
  const sampleMessagesEndIndex = Math.min(
    messages.length,
    commentIdx + maxNumMessagesAfter
  );
  const sampleMessages = messages.slice(
    sampleMessagesStartIndex,
    sampleMessagesEndIndex
  );
  const targetMessageIndex = sampleMessages.findIndex((message) =>
    message.id.equals(targetMessageId)
  );
  return {
    sampleMessages,
    targetMessageIndex,
  };
}
