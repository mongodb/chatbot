import { createContext } from "react";
import { ChatbotData } from "./useChatbot";

export const ChatbotContext = createContext<ChatbotData | null>(null);

export type ChatbotProviderProps = ChatbotData & {
  children: React.ReactNode;
};

export function ChatbotProvider({ children, ...linkData }: ChatbotProviderProps) {
  return (
    <ChatbotContext.Provider value={linkData}>
      {children}
    </ChatbotContext.Provider>
  );
}
