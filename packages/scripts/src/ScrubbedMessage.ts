import { ObjectId } from "mongodb";
import { Message } from "mongodb-chatbot-server";
import { MessageAnalysis } from "./MessageAnalysis";

export type ScrubbedMessage = Omit<
  Message,
  "content" | "preprocessedContent" | "id" | "userComment"
> & {
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
    The IP address of the user in the conversation.
   */
  ipAddress: string;

  /**
    The ordinal number of this message in relation to other messages in the original conversation.
   */
  index: number;

  /**
    An LLM-populated analysis of the original message that should be devoid of
    any possible PII.
   */
  analysis?: MessageAnalysis;

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
};
