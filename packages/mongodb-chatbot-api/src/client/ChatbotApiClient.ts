import {
  ConversationsClient,
  ConversationsClientConfig,
  makeConversationsClient,
} from "../conversations/client";

export interface ChatbotApiClient {
  conversations: ConversationsClient;
}

export interface MakeChatbotApiClientArgs {
  conversations: ConversationsClientConfig;
}

export function makeChatbotApiClient(
  args: MakeChatbotApiClientArgs
): ChatbotApiClient {
  return {
    conversations: makeConversationsClient({
      ...args.conversations,
    }),
  };
}
