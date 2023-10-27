import { ObjectId } from "chat-core";
import {
  CreateConversationParams,
  FindByIdParams,
  RateMessageParams,
  SomeMessage,
} from "./conversations";

/**
  Conversation between the user and the API chatbot.
 */
export interface ApiConversation {
  _id: ObjectId;
  /** Messages in the conversation. */
  messages: SomeMessage[];
  /** The IP address of the user performing the conversation. */
  ipAddress: string;
  /** The date the conversation was created. */
  createdAt: Date;
}

export type BaseMessage = Omit<
  SomeMessage,
  "id" | "createdAt" | "systemPrompt"
>;

export interface AddApiConversationMessageParams {
  conversationId: ObjectId;
  /**
    Message to append to the conversation.
  */
  message: BaseMessage;
  /**
    New system prompt that replaces the existing system prompt.
    If you want to store the existing system prompt, you must include it in the
    {@link SomeMessage.systemPrompt} field of the `message` property.
   */
  newSystemPrompt?: string;
}

export interface AddApiConversationMessagesParams {
  conversationId: ObjectId;
  /**
    Messages to append to the conversation.
  */
  messages: BaseMessage[];
}

export interface ApiConversationsService {
  create: ({ ipAddress }: CreateConversationParams) => Promise<ApiConversation>;
  addApiConversationMessage: (
    params: AddApiConversationMessageParams
  ) => Promise<SomeMessage>;
  addApiConversationMessages: (
    params: AddApiConversationMessagesParams
  ) => Promise<SomeMessage[]>;
  findById: ({ _id }: FindByIdParams) => Promise<ApiConversation | null>;
  rateMessage: ({
    conversationId,
    messageId,
    rating,
  }: RateMessageParams) => Promise<boolean>;
}
