import { OpenCloseHandlers, UseChatbotProps } from "./useChatbot";
import { type User } from "./useUser";
import { RenameFields } from "./utils";
export type ChatbotProps = OpenCloseHandlers & RenameFields<UseChatbotProps, {
    chatbotName: "name";
}> & {
    children: React.ReactElement | React.ReactElement[];
    darkMode?: boolean;
    tck?: string;
    user?: User;
};
export declare function Chatbot({ children, serverBaseUrl, shouldStream, user, name, fetchOptions, isExperimental, onOpen, onClose, sortMessageReferences, getClientContext, ...props }: ChatbotProps): import("react/jsx-runtime").JSX.Element;
