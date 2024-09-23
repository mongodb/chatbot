import { isRichLinkVariantName, type RichLinkProps } from "@lg-chat/rich-links";
import { References } from "mongodb-rag-core";
import { addQueryParams } from "./utils";

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
