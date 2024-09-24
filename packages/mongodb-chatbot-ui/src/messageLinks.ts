import { isRichLinkVariantName, type RichLinkProps } from "@lg-chat/rich-links";
import { References } from "mongodb-rag-core";
import { addQueryParams } from "./utils";
import { MessageData } from "./services/conversations";

export type FormatReferencesOptions = {
  tck?: string;
};

export function formatReferences(
  references: References,
  { tck }: FormatReferencesOptions = {}
): RichLinkProps[] {
  return references.map((reference) => {
    const richLinkProps = {
      href: tck ? addQueryParams(reference.url, { tck }) : reference.url,
      children: reference.title,
    };
    const { sourceType } = reference.metadata ?? {};
    if (sourceType && isRichLinkVariantName(sourceType)) {
      return {
        ...richLinkProps,
        variant: sourceType,
      };
    }
    return richLinkProps;
  });
}

export function getMessageLinks(
  messageData: MessageData,
  options: { tck?: string } = {}
): RichLinkProps[] | undefined {
  return messageData.references && messageData.references.length > 0
    ? formatReferences(messageData.references, { tck: options.tck })
    : undefined;
}
