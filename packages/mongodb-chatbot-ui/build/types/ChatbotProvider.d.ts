import { ChatbotData } from "./useChatbot";
export declare const ChatbotContext: import("react").Context<ChatbotData | null>;
export type ChatbotProviderProps = ChatbotData & {
    children: React.ReactNode;
};
export declare function ChatbotProvider({ children, ...chatbotData }: ChatbotProviderProps): import("react/jsx-runtime").JSX.Element;
