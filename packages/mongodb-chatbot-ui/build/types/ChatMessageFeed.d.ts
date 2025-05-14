import { MessageData } from "./services/conversations";
import { DarkModeProps } from "./DarkMode";
export type ChatMessageFeedProps = DarkModeProps & {
    className?: HTMLElement["className"];
    disclaimer?: React.ReactNode;
    disclaimerHeading?: string;
    initialMessage?: MessageData | null;
};
export declare function ChatMessageFeed(props: ChatMessageFeedProps): import("react/jsx-runtime").JSX.Element | null;
