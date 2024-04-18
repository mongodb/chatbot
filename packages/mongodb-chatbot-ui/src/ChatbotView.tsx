import { DarkModeProps } from "./DarkMode";

export type ChatbotViewProps = DarkModeProps & {
  className?: HTMLElement["className"];
  disclaimer?: React.ReactNode;
  disclaimerHeading?: string;
  fatalErrorMessage?: string;
  initialMessageSuggestedPrompts?: string[];
  initialMessageText?: string;
  inputBarId?: string;
  inputBarPlaceholder?: string;
  inputBottomText?: string;
  windowTitle?: string;
};
