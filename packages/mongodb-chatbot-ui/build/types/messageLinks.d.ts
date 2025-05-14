import { type RichLinkProps } from "@lg-chat/rich-links";
import { type References, SortReferences } from "./references";
import { MessageData } from "./services/conversations";
export type FormatReferencesOptions = {
    tck?: string;
};
export declare function formatReferences(references: References, { tck }?: FormatReferencesOptions): RichLinkProps[];
export declare function getMessageLinks(messageData: MessageData, options?: {
    tck?: string;
}): RichLinkProps[] | undefined;
export declare function makePrioritizeCurrentMongoDbReferenceDomain(): SortReferences;
