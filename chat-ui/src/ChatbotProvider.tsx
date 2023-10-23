import { createContext } from "react";
import { ChatbotProps } from "./Chatbot";
import { ChatbotData } from "./useChatbot";

export type ChatbotContextData = Omit<
  ChatbotProps,
  "children" | "serverBaseUrl" | "shouldStream" | "user"
> &
  ChatbotData;

export const ChatbotContext = createContext<ChatbotContextData | null>(null);

export type ChatbotProviderProps = ChatbotContextData & {
  children: React.ReactNode;
};

export function ChatbotProvider({ children, ...linkData }: ChatbotProviderProps) {
  return (
    <ChatbotContext.Provider value={linkData}>
      {children}
    </ChatbotContext.Provider>
  );
}
