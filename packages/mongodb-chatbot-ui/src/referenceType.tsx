import { Reference } from "mongodb-rag-core";
import { MessageDataReference } from "./services/conversations";
import { RichLinkVariantName } from "@lg-chat/rich-links";

export type ReferenceVariant = RichLinkVariantName;

/**
  Analyzes a reference link to determine which link variant type to use.
  @param reference The reference link to analyze.
  @returns The link variant type to use, or undefined if no variant matches.
 */
export function referenceType(ref: Reference): ReferenceVariant | undefined {
  const sourceName = ref.metadata?.sourceName ?? null;
  if (sourceName) {
    if (/snooty-.+/.test(sourceName)) return "Docs";
    switch (sourceName) {
      case "c":
      case "java-reactive-streams":
      case "pymongo":
      case "prisma":
      case "cxx-driver":
      case "mongoose":
      case "scala":
      case "wired-tiger":
      case "atlas-terraform-provider":
        return "Docs";
      case "mongodb-university":
        return "Learn";
      case "practical-aggregations-book":
        return "Book";
      case "devcenter":
      case "mongodb-corp":
        return "Website";
    }
  }

  const tags = ref.metadata?.tags ?? [];
  for (const tag of tags) {
    switch (tag) {
      case "docs":
        return "Docs";
      case "video":
        return "Video";
      default:
        continue;
    }
  }

  if (/learn\.mongodb\.com/.test(ref.url)) return "Learn";
  if (/docs/.test(ref.url)) return "Docs";
  if (/blog/.test(ref.url)) return "Blog";
  if (/developer/.test(ref.url)) return "Website";

  return undefined;
}

/**
  Adds a link variant type to a given reference link, if applicable.
  @param reference The reference link to analyze.
  @returns The reference link with the link variant type added.
 */
export function addReferenceLinkVariant(
  reference: Omit<MessageDataReference, "linkVariant">
): MessageDataReference {
  return { ...reference, linkVariant: referenceType(reference) };
}
