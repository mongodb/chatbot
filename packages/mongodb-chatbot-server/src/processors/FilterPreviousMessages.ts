import { Conversation, Message } from "mongodb-rag-core";

/**
  Filters which previous conversation messages are sent to the LLM
  along with the user prompt.
  For example, you may only want to send the system prompt to the LLM
  with the user message or the system prompt and X prior messages.
 */
export type FilterPreviousMessages = (
  conversation: Conversation
) => Promise<Message[]>;
