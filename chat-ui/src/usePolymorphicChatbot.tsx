import { useContext } from "react";
import { PolymorphicChatbotContext } from "./PolymorphicChatbotProvider";

export function usePolymorphicChatbotData() {
  const polymorphicChatbotData = useContext(PolymorphicChatbotContext);
  if(!polymorphicChatbotData) {
    throw new Error("usePolymorphicChatbotData must be used within a PolymorphicChatbotProvider");
  }
  return polymorphicChatbotData;
}
