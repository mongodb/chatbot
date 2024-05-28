import { Reference } from "mongodb-rag-core";
import { MessageDataReference } from "./services/conversations";

export type RichLinkVariant =
  | "Blog"
  | "Code"
  | "Book"
  | "Docs"
  | "Learn"
  | "Video"
  | "Website";

export function referenceType(ref: Reference): RichLinkVariant | undefined {
  const sourceName = ref.metadata?.sourceName ?? null;
  const tags = ref.metadata?.tags ?? [];
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
  Analyzes a reference link to determine which link variant type to use.
  @param reference The reference link to analyze.
  @returns The reference link with the link variant type added.
 */
export function addReferenceLinkVariant(
  reference: Omit<MessageDataReference, "linkVariant">
): MessageDataReference {
  return { ...reference, linkVariant: referenceType(reference) };
}
