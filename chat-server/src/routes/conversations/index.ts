import { Router } from "express";
import { EmbedFunc, FindNearestNeighborsOptions } from "chat-core";
import validateRequestSchema from "../../middleware/validateRequestSchema";
import {
  Llm,
  OpenAiAwaitedResponse,
  OpenAiStreamingResponse,
} from "../../services/llm";
import { DataStreamer } from "../../services/dataStreamer";
import { ConversationsService } from "../../services/conversations";
import { EmbeddedContentStore } from "chat-core";
import { RateMessageRequest, makeRateMessageRoute } from "./rateMessage";
import {
  CreateConversationRequest,
  makeCreateConversationRoute,
} from "./createConversation";
import {
  AddMessageRequest,
  makeAddMessageToConversationRoute,
} from "./addMessageToConversation";
import { SearchBooster } from "../../processors/SearchBooster";
import { QueryPreprocessorFunc } from "../../processors/QueryPreprocessorFunc";

// TODO: for all non-2XX or 3XX responses, see how/if can better implement
// error handling. can/should we pass stuff to next() and process elsewhere?
export interface ConversationsRouterParams<T, U> {
  llm: Llm<T, U>;
  embed: EmbedFunc;
  dataStreamer: DataStreamer;
  store: EmbeddedContentStore;
  conversations: ConversationsService;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
  searchBoosters?: SearchBooster[];
  userQueryPreprocessor?: QueryPreprocessorFunc;
}

export function makeConversationsRouter({
  llm,
  embed,
  dataStreamer,
  store,
  conversations,
  findNearestNeighborsOptions,
  searchBoosters,
  userQueryPreprocessor,
}: ConversationsRouterParams<OpenAiStreamingResponse, OpenAiAwaitedResponse>) {
  const conversationsRouter = Router();

  /**
   * Create new conversation.
   */
  conversationsRouter.post(
    "/",
    validateRequestSchema(CreateConversationRequest),
    makeCreateConversationRoute({ conversations })
  );

  /**
   * Create a new message from the user and get response from the LLM.
   */
  conversationsRouter.post(
    "/:conversationId/messages",
    validateRequestSchema(AddMessageRequest),
    makeAddMessageToConversationRoute({
      store,
      conversations,
      llm,
      dataStreamer,
      embed,
      findNearestNeighborsOptions,
      searchBoosters,
      userQueryPreprocessor,
    })
  );

  /**
   * Rate a message.
   */
  conversationsRouter.post(
    "/:conversationId/messages/:messageId/rating",
    validateRequestSchema(RateMessageRequest),
    makeRateMessageRoute({ conversations })
  );

  return conversationsRouter;
}
