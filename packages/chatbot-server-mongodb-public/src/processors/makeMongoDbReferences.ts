import {
  EmbeddedContent,
  MakeReferenceLinksFunc,
  makeDefaultReferenceLinks,
} from "mongodb-chatbot-server";
import { Reference } from "mongodb-rag-core";
import { type RichLinkVariantName } from "@lg-chat/rich-links";

/**
  Returns references that look like:

  ```json
  {
    "url": "https://mongodb.com/docs/manual/reference/operator/query/eq/",
    "title": "$eq",
    "metadata": {
      "sourceName": "snooty-docs",
      "sourceType": "Docs",
      "tags": ["docs", "manual"]
    },
  }
  ```
 */
export const makeMongoDbReferences: MakeReferenceLinksFunc = (
  chunks: EmbeddedContent[]
) => {
  return makeDefaultReferenceLinks(chunks).map(addReferenceSourceType);
};

export type ReferenceVariant = RichLinkVariantName;

/**
  Adds a link variant type to a given reference link, if applicable.
  @param reference The reference link to analyze.
  @returns The reference link with the link variant type added.
 */
export function addReferenceSourceType(reference: Reference): Reference {
  const sourceType = mongodbReferenceType(reference);
  if (!sourceType) {
    return reference;
  }
  return {
    ...reference,
    metadata: {
      ...reference.metadata,
      sourceType,
    },
  };
}

/**
  Analyzes a reference link to determine which link variant type to use.
  @param reference The reference link to analyze.
  @returns The link variant type to use, or undefined if no variant matches.
 */
export function mongodbReferenceType(
  ref: Reference
): ReferenceVariant | undefined {
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
        return "Article";
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
  if (/developer/.test(ref.url)) return "Article";
  if (/mongodb\.com/.test(ref.url)) return "Website";

  return undefined;
}
