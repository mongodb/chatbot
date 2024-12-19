import { createContext } from "react";
import { ChatbotData } from "./useChatbot";

export const ChatbotContext = createContext<ChatbotData | null>(null);

export type ChatbotProviderProps = ChatbotData & {
  children: React.ReactNode;
};

export function ChatbotProvider({
  children,
  ...chatbotData
}: ChatbotProviderProps) {
  return (
    <ChatbotContext.Provider value={chatbotData}>
      {children}
    </ChatbotContext.Provider>
  );
}
