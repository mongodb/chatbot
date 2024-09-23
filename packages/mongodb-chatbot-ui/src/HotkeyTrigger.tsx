import { useEffect } from "react";
import { useChatbotContext } from "./useChatbotContext";

export type HotkeyTriggerProps = {
  onKey: string;
};

export function HotkeyTrigger({ onKey }: HotkeyTriggerProps) {
  const { openChat } = useChatbotContext();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === onKey) {
        openChat();
      }
    };

    // Add event listener when component mounts
    window.addEventListener("keydown", handleKeyDown);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onKey, openChat]);

  // This component doesn't render anything
  return null;
}
