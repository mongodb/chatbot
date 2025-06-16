import { FilterPreviousMessages } from "./FilterPreviousMessages";
/**
  Creates a filter that only includes the previous n messages in the conversations.
  @param n - Number of previous messages to include.
 */
export const makeFilterNPreviousMessages = (
  n: number
): FilterPreviousMessages => {
  return async (conversation) => {
    // Get the n latest messages.
    return conversation.messages.slice(-n);
  };
};
