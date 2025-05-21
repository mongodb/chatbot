import { ObjectId } from "mongodb";
import { DbMessage, SomeMessage } from "mongodb-rag-core";
import { Pii } from "./redactPii";

export type ScrubbedMessage<
  Analysis extends Record<string, unknown> | undefined = undefined,
> = Omit<DbMessage<SomeMessage>, "id"> & {
  /**
    The ID, which should match the ID of the original message within the
    conversation.
   */
  _id: ObjectId;

  /**
    The ID of the original conversation.
   */
  conversationId: ObjectId;

  /**
    The ordinal number of this message in relation to other messages in the original conversation.
   */
  index: number;

  /**
    An LLM-populated analysis of the original message that should be devoid of
    any possible PII.
   */
  analysis?: Analysis;

  /**
    For messages with the "user" role, the rating field of the subsequent
    "assistant" response in the original conversation.

    This can be convenient when comparing questions with their answer quality.
   */
  responseRating?: boolean;

  /**
    Indicates whether the original message had a user comment.
    This is true if the original message had a userComment field (even if empty),
    and false otherwise.
   */
  userCommented?: boolean;

  userComment?: string;

  /**
    Whether preprocessor suggested not to answer based on the input.
   */
  rejectQuery?: boolean;

  /**
    The vector representation of the message content.
   */
  embedding?: number[];

  /**
    The name of the embedding model used to generate the embedding for this message.
   */
  embeddingModelName?: string;

  /**
    Whether the original message contains any PII.
   */
  pii?: boolean;

  /**
   Any PII redacted from the original message.
   */
  messagePii?: Pii[];

  /**
   Any PII redacted from the original user comment.
   */
  userCommentPii?: Pii[];

  /**
   For 'user' role messages, track information about the subsequent assistant 
   response to the user message.
   */
  response?: Record<string, unknown> | undefined;

  /**
   For 'assistant' role messages, track information about the user request preceding 
   this assistant response.
   */
  request?: Record<string, unknown> | undefined;
};
