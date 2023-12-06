import { useContext } from "react";
import { ChatbotContext } from "./ChatbotProvider";

export function useChatbotContext() {
  const chatbotContext = useContext(ChatbotContext);
  if (!chatbotContext) {
    throw new Error("useChatbotContext must be used within a ChatbotProvider");
  }
  return chatbotContext;
}
