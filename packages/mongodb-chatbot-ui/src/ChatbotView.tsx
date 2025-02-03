import { References } from "./references";
import { ChatMessageFeedProps } from "./ChatMessageFeed";
import { DarkModeProps } from "./DarkMode";

export type ChatbotViewProps = DarkModeProps &
  Omit<ChatMessageFeedProps, "initialMessage"> & {
    fatalErrorMessage?: string;
    initialMessageReferences?: References;
    initialMessageSuggestedPrompts?: string[];
    initialMessageText?: string;
    inputBarId?: string;
    inputBarPlaceholder?: string;
    inputBottomText?: string;
    windowTitle?: string;
  };
