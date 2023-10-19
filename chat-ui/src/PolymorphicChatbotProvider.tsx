import { createContext } from "react";
import { ChatbotProps } from "./Chatbot";
import { ChatbotData } from "./useChatbot";

export type PolymorphicChatbotData = Omit<
  ChatbotProps,
  "children" | "serverBaseUrl" | "shouldStream" | "user"
> &
  ChatbotData;

export const PolymorphicChatbotContext = createContext<PolymorphicChatbotData | null>(null);

export type PolymorphicChatbotProviderProps = PolymorphicChatbotData & {
  children: React.ReactNode;
};

export function PolymorphicChatbotProvider({
  children,
  ...linkData
}: PolymorphicChatbotProviderProps) {
  return (
    <PolymorphicChatbotContext.Provider value={linkData}>
      {children}
    </PolymorphicChatbotContext.Provider>
  );
}
