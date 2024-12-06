import { useEffect } from "react";
import { useChatbotContext } from "./useChatbotContext";
import { useHotkeyContext } from "./HotkeyContext";

export type HotkeyTriggerProps = {
  onKey: string;
};

export function HotkeyTrigger({ onKey }: HotkeyTriggerProps) {
  const { open, openChat } = useChatbotContext();
  const hotkeyContext = useHotkeyContext();

  useEffect(() => {
    hotkeyContext.setHotkey(onKey);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === onKey) {
        openChat();
      }
    };

    // Add event listener when component mounts
    if (!open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      hotkeyContext.setHotkey(null);
    };
  }, [hotkeyContext, onKey, open, openChat]);

  // This component doesn't render anything
  return null;
}
