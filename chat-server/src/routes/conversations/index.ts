import { Router } from "express";
import { EmbedFunc, FindNearestNeighborsOptions } from "chat-core";
import {
  Llm,
  OpenAiAwaitedResponse,
  OpenAiStreamingResponse,
} from "../../services/llm";
import { DataStreamerServiceInterface } from "../../services/dataStreamer";
import { ConversationsServiceInterface } from "../../services/conversations";
import { EmbeddedContentStore } from "chat-core";
import { makeRateMessageRoute } from "./rateMessage";
import { makeCreateConversationRoute } from "./createConversation";
import { makeAddMessageToConversationRoute } from "./addMessageToConversation";

// TODO: for all non-2XX or 3XX responses, see how/if can better implement
// error handling. can/should we pass stuff to next() and process elsewhere?
export interface ConversationsRouterParams<T, U> {
  llm: Llm<T, U>;
  embed: EmbedFunc;
  dataStreamer: DataStreamerServiceInterface;
  store: EmbeddedContentStore;
  conversations: ConversationsServiceInterface;
  findNearestNeighborsOptions: FindNearestNeighborsOptions;
}

export function makeConversationsRouter({
  llm,
  embed,
  dataStreamer,
  store,
  conversations,
  findNearestNeighborsOptions,
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
      store,
      conversations,
      embed,
      llm,
      dataStreamer,
      findNearestNeighborsOptions,
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
