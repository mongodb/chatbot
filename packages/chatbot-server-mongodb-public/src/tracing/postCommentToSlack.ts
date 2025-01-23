import { AssistantMessage, Conversation, Message } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { WebClient } from "@slack/web-api";
import {
  Surfaces,
  Blocks,
  Elements,
  Bits,
  Utilities,
  Message as BuilderMessage,
} from "slack-block-builder";
import { extractSampleMessages } from "./extractSampleMessages";
import { braintrustLogger } from "mongodb-rag-core/braintrust";
import { extractTracingData } from "./extractTracingData";

export interface PostCommentToSlackParams {
  token: string;
  conversationId: string;
  conversation: Conversation;
  messageWithCommentId: ObjectId;
}
export async function postCommentToSlack({
  token,
  conversationId,
  conversation,
  messageWithCommentId,
}: PostCommentToSlackParams) {
  const client = new WebClient(token);
  const blocks = makeSlackMessageText(conversation, messageWithCommentId);
  client.chat.postMessage({
    channel: conversationId,
    blocks,
  });
}

// TODO
function makeSlackMessageText(
  messages: Message[],
  messageWithCommentId: ObjectId
) {
  const {
    isVerifiedAnswer,
    llmDoesNotKnow,
    rejectQuery,
    tags,
    numRetrievedChunks,
  } = extractTracingData(messages, messageWithCommentId);
  const { sampleMessages, targetMessageIndex } = extractSampleMessages({
    messages,
    targetMessageId: messageWithCommentId,
  });
  const { rating, userComment } = extractFeedback(
    sampleMessages[targetMessageIndex] as AssistantMessage
  );
  return [];
}

function extractFeedback(assistantMessage: AssistantMessage) {
  return {
    rating: assistantMessage.rating,
    userComment: assistantMessage.userComment,
  };
}
