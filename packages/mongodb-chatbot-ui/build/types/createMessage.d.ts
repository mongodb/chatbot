import { type References } from "./references";
import { AssistantMessageMetadata, MessageData } from "./services/conversations";
export declare function createMessageId(): string;
export type CreateMessageArgs = {
    id?: string;
    role: "assistant";
    content: string;
    references?: References;
    metadata?: AssistantMessageMetadata;
} | {
    id?: string;
    role: "user";
    content: string;
};
export default function createMessage(args: CreateMessageArgs): MessageData;
