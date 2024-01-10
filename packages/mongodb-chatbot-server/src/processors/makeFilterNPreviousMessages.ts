import { FilterPreviousMessages } from "./FilterPreviousMessages";
import { strict as assert } from "assert";
/**
  Creates a filter that only includes the previous n messages in the conversations.
  The first message in the conversation **must** be the system prompt.
  @param n - Number of previous messages to include.
 */
export const makeFilterNPreviousMessages = (
  n: number
): FilterPreviousMessages => {
  return async (conversation) => {
    assert(
      conversation.messages[0]?.role === "system",
      "First message must be system prompt"
    );
    // Always include the system prompt.
    const systemPrompt = conversation.messages[0];

    // Get the n latest messages.
    const nLatestMessages = conversation.messages.slice(1).slice(-n);

    return [systemPrompt, ...nLatestMessages];
  };
};
