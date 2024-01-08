import { DarkModeProps } from "./DarkMode";

export type ChatbotViewProps = DarkModeProps & {
  disclaimer?: React.ReactNode;
  initialMessageSuggestedPrompts?: string[];
  initialMessageText?: string;
  inputBarPlaceholder?: string;
};
