import { References } from "mongodb-rag-core";
import { DarkModeProps } from "./DarkMode";

export type ChatbotViewProps = DarkModeProps & {
  className?: HTMLElement["className"];
  disclaimer?: React.ReactNode;
  disclaimerHeading?: string;
  fatalErrorMessage?: string;
  initialMessageReferences?: References;
  initialMessageSuggestedPrompts?: string[];
  initialMessageText?: string;
  inputBarId?: string;
  inputBarPlaceholder?: string;
  inputBottomText?: string;
  shouldRenderHotkeyIndicator?: boolean;
  windowTitle?: string;
};
