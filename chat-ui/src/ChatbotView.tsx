import { DarkModeProps } from "./DarkMode";

export type ChatbotViewProps = DarkModeProps & {
  initialMessageSuggestedPrompts?: string[];
  initialMessageText?: string;
  showDisclaimer?: boolean;
};
