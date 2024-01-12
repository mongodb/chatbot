import { FilterPreviousMessages } from "./FilterPreviousMessages";

/**
  Only include the initial system prompt.
 */
export const filterOnlySystemPrompt: FilterPreviousMessages = async (
  conversation
) => {
  const systemPrompt = conversation.messages.find((m) => m.role === "system");
  return systemPrompt ? [systemPrompt] : [];
};
