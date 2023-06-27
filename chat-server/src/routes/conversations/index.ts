import { Router } from "express";
import { EmbedFunc } from "chat-core";
import {
  LlmProvider,
  OpenAiAwaitedResponse,
  OpenAiStreamingResponse,
} from "../../services/llm";
import { DataStreamerServiceInterface } from "../../services/dataStreamer";
import { ConversationsServiceInterface } from "../../services/conversations";
import { ContentServiceInterface } from "chat-core";
import { makeRateMessageRoute } from "./rateMessage";
import { makeCreateConversationRoute } from "./createConversation";
import { makeAddMessageToConversationRoute } from "./addMessageToConversation";

// TODO: for all non-2XX or 3XX responses, see how/if can better implement
// error handling. can/should we pass stuff to next() and process elsewhere?
export interface ConversationsRouterParams<T, U> {
  llm: LlmProvider<T, U>;
  embed: EmbedFunc;
  dataStreamer: DataStreamerServiceInterface;
  content: ContentServiceInterface;
  conversations: ConversationsServiceInterface;
}
export function makeConversationsRouter({
  llm,
  embed,
  dataStreamer,
  content,
  conversations,
}: ConversationsRouterParams<OpenAiStreamingResponse, OpenAiAwaitedResponse>) {
  const conversationsRouter = Router();

  /**
   * Create new conversation.
   */
  conversationsRouter.post("/", makeCreateConversationRoute({ conversations }));

  /**
   * Create a new message from the user and get response from the LLM.
   */
  conversationsRouter.post(
    "/:conversationId/messages",
    makeAddMessageToConversationRoute({
      content,
      conversations,
      embed,
      llm,
      dataStreamer,
    })
  );

  /**
   * Rate a message.
   */
  conversationsRouter.post(
    "/:conversationId/messages/:messageId/rating",
    makeRateMessageRoute({ conversations })
  );

  return conversationsRouter;
}
