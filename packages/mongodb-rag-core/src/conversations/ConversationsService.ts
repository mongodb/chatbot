import { ObjectId } from "mongodb";
import { EmbeddedContent } from "../contentStore";
import { References } from "../References";
import { WithScore } from "../VectorStore";
import { VerifiedAnswer } from "../verifiedAnswers";
import { OpenAI } from "openai";

export type MessageBase = {
  /**
    The role of the message in the conversation.
   */
  role: string;

  /**
    Message that occurs in the conversation.
   */
  content: string;

  /**
    Custom data received from the client to include in the Message persisted to
    the database.
   */
  customData?: Record<string, unknown>;

  /**
    Arbitrary data about the message that should be sent to the client.
   */
  metadata?: Record<string, unknown>;
};

export type SystemMessage = MessageBase & {
  role: "system";
};

export type AssistantMessage = MessageBase & {
  role: "assistant";

  /**
    Set to `true` if the user liked the response, `false` if the user didn't
    like the response. No value if user didn't rate the response. Note that only
    messages with `role: "assistant"` can be rated.
   */
  rating?: boolean;

  /**
    An additional text comment provided by the user to clarify their
    `rating` for the message. If `rating` is undefined, this should be
    too.
   */
  userComment?: string;

  /**
    Further reading links for the message.
   */
  references?: References;

  functionCall?: OpenAI.ChatCompletionMessage.FunctionCall;

  metadata?: AssistantMessageMetadata;
};

export type AssistantMessageMetadata = {
  [k: string]: unknown;

  /**
      If the message came from the verified answers collection, contains the
      metadata about the verified answer.
     */
  verifiedAnswer?: VerifiedAnswerEventData;
};

export type VerifiedAnswerEventData = Pick<
  VerifiedAnswer,
  "_id" | "created" | "updated"
>;

export type FunctionMessage = MessageBase & {
  role: "function";
  name: string;
};

export type UserMessage = MessageBase & {
  role: "user";

  /**
    The content of the message that the LLM will use to generate a response.
    This is only used for the latest user message.
    For previous user messages, the LLM will use the `content` field.
   */
  contentForLlm?: string;

  /**
    The preprocessed content of the message.
    For example, the query used for vector search.
   */
  preprocessedContent?: string;

  /**
    Content found to help generate the message.

    Useful to include for evaluation purposes.
    For example, you might want to assess how faithful the LLM response
    to the found content.
   */
  contextContent?: Partial<WithScore<EmbeddedContent>>[];

  /**
    Whether preprocessor suggested not to answer based on the input.
   */
  rejectQuery?: boolean;

  /**
    The vector representation of the message content.
   */
  embedding?: number[];
};

/**
  Message in the {@link Conversation}.
 */
export type SomeMessage =
  | UserMessage
  | AssistantMessage
  | SystemMessage
  | FunctionMessage;

export type DbMessage<SomeMessage> = SomeMessage & {
  /**
      Unique identifier for the message.
     */
  id: ObjectId;

  /**
      The date the message was created.
     */
  createdAt: Date;
};

/**
  Message stored in the database.
*/
export type Message = DbMessage<SomeMessage>;

export type ConversationCustomData = Record<string, unknown> | undefined;

/**
  Conversation between the user and the chatbot as stored in the database.
 */
export interface Conversation<
  CustomData extends ConversationCustomData = ConversationCustomData
> {
  _id: ObjectId;
  /** Messages in the conversation. */
  messages: Message[];
  /** The date the conversation was created. */
  createdAt: Date;
  /** The hostname that the request originated from. */
  requestOrigin?: string;

  /**
    Custom data to include in the Conversation persisted to the database.
    You can pass this data to the {@link ConversationsService.create()} method.
   */
  customData?: CustomData;
}
export type CreateConversationParams = {
  initialMessages?: SomeMessage[];
  customData?: ConversationCustomData;
};

export type AddMessageParams<T extends SomeMessage> = Omit<T, "createdAt"> & {
  id?: ObjectId;
};

type WithCustomData<T extends Record<string, unknown>> = T & {
  customData?: Record<string, unknown>;
};

export type AddSystemMessageParams = AddMessageParams<SystemMessage>;

export type AddUserMessageParams = AddMessageParams<
  WithCustomData<UserMessage>
>;

export type AddFunctionMessageParams = AddMessageParams<
  WithCustomData<FunctionMessage>
>;

export type AddAssistantMessageParams = AddMessageParams<AssistantMessage>;

export type AddSomeMessageParams = (
  | AddSystemMessageParams
  | AddUserMessageParams
  | AddAssistantMessageParams
  | AddFunctionMessageParams
) & { id?: ObjectId };

export type AddConversationMessageParams = {
  conversationId: ObjectId;
  message: AddSomeMessageParams;
};

export type AddManyConversationMessagesParams = {
  conversationId: ObjectId;
  messages: AddSomeMessageParams[];
};
export interface FindByIdParams {
  _id: ObjectId;
}
export interface RateMessageParams {
  conversationId: ObjectId;
  messageId: ObjectId;
  rating: boolean;
}
export interface CommentMessageParams {
  conversationId: ObjectId;
  messageId: ObjectId;
  comment: string;
}

/**
  Static responses to send in pre-defined edge case scenarios.
 */
export interface ConversationConstants {
  /**
    Response message sent when the user sends a message that the chatbot
    that doesn't match anything in the chatbot's knowledge base.
   */
  NO_RELEVANT_CONTENT: string;
  /**
    Response message sent when the chatbot's LLM is not working.
   */
  LLM_NOT_WORKING: string;
}

/**
  Service for managing {@link Conversation}s.
 */
export interface ConversationsService {
  conversationConstants: ConversationConstants;

  /**
    Create a new {@link Conversation}.
   */
  create: (params?: CreateConversationParams) => Promise<Conversation>;

  /**
    Add a {@link Message} to a {@link Conversation}.
   */
  addConversationMessage: (
    params: AddConversationMessageParams
  ) => Promise<Message>;
  /**
    Add multiple {@link Message} objects to a {@link Conversation}.
   */
  addManyConversationMessages: (
    params: AddManyConversationMessagesParams
  ) => Promise<Message[]>;
  findById: ({ _id }: FindByIdParams) => Promise<Conversation | null>;

  /**
    Rate a {@link Message} in a {@link Conversation}.
   */
  rateMessage: ({
    conversationId,
    messageId,
    rating,
  }: RateMessageParams) => Promise<boolean>;

  /**
    Add a user comment to an assistant {@link Message}.
   */
  commentMessage: ({
    conversationId,
    messageId,
    comment,
  }: CommentMessageParams) => Promise<boolean>;
}

export const defaultConversationConstants: ConversationConstants = {
  NO_RELEVANT_CONTENT: `Unfortunately, I do not know how to respond to your message.

Please try to rephrase your message. Adding more details can help me respond with a relevant answer.`,
  LLM_NOT_WORKING: `Unfortunately, my chat functionality is not working at the moment,
so I cannot respond to your message. Please try again later.

However, here are some links that might provide some helpful information for your message:`,
};
