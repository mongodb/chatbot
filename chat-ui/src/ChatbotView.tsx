export type DarkModeProps = {
  darkMode?: boolean;
};

export type ChatbotViewProps = DarkModeProps & {
  initialMessageSuggestedPrompts?: string[];
  initialMessageText?: string;
  showDisclaimer?: boolean;
};
