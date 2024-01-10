import { DarkModeProps } from "./DarkMode";

export type ChatbotViewProps = DarkModeProps & {
  disclaimer?: React.ReactNode;
  disclaimerHeading?: string;
  initialMessageSuggestedPrompts?: string[];
  initialMessageText?: string;
  inputBarPlaceholder?: string;
  inputBottomText?: string;
  windowTitle?: string;
};
