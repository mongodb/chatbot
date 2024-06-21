import {
  type RichLinkProps,
  type RichLinkVariantName,
} from "@lg-chat/rich-links";
import { References } from "mongodb-rag-core";
import { addQueryParams } from "./utils";

const richLinkVariantNames = [
  "Blog",
  "Book",
  "Code",
  "Docs",
  "Learn",
  "Video",
  "Website",
];

export function isRichLinkVariantName(str: string): str is RichLinkVariantName {
  return richLinkVariantNames.includes(str);
}

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
