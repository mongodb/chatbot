import { FilterPreviousMessages } from "./FilterPreviousMessages";

/**
  Only include the initial system prompt.
 */
export const filterOnlySystemPrompt: FilterPreviousMessages = (
  conversation
) => {
  const systemPrompt = conversation.messages.find((m) => m.role === "system");
  return systemPrompt ? [systemPrompt] : [];
};
