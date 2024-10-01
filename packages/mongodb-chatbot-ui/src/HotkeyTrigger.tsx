import { useEffect } from "react";
import { useChatbotContext } from "./useChatbotContext";

export type HotkeyTriggerProps = {
  onKey: string;
};

export function HotkeyTrigger({ onKey }: HotkeyTriggerProps) {
  const { open, openChat } = useChatbotContext();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === onKey) {
        openChat();
      }
    };

    if (!open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onKey, open, openChat]);

  // This component doesn't render anything
  return null;
}
