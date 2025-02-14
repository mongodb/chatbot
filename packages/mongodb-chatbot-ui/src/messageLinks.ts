import { isRichLinkVariantName, type RichLinkProps } from "@lg-chat/rich-links";
import {
  isReferenceToDomain,
  makePrioritizeReferenceDomain,
  type References,
  SortReferences,
} from "./references";
import { addQueryParams, getCurrentPageUrl } from "./utils";
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

export function makePrioritizeCurrentMongoDbReferenceDomain(): SortReferences {
  const currentDomain = getCurrentPageUrl();
  if (!currentDomain) {
    // If we can't determine the current domain (e.g. on the server) then the sort is a no-op
    return () => 0;
  }
  const prioritizableDomains = [
    new URL("https://mongodb.com/docs"),
    new URL("https://www.mongodb.com/docs"),
    new URL("https://mongodb.com/developer"),
    new URL("https://www.mongodb.com/developer"),
    new URL("https://learn.mongodb.com"),
    new URL("https://mongodb.com"),
    new URL("https://www.mongodb.com"),
  ];
  const applicableDomains = prioritizableDomains.filter((prioritizableDomain) =>
    isReferenceToDomain(currentDomain, prioritizableDomain)
  );
  return makePrioritizeReferenceDomain(applicableDomains);
}
