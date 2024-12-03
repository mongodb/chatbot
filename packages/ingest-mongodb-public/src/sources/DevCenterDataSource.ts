import { logger, Page } from "mongodb-rag-core";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { strict as assert } from "assert";
import { convert } from "html-to-text";
import {
  DataSource,
  ProjectBase,
  removeMarkdownImagesAndLinks,
} from "mongodb-rag-core/dataSources";

export type DevCenterProjectConfig = ProjectBase & {
  type: "devcenter";
  databaseName: string;
  collectionName: string;
  baseUrl: string;
  connectionUri: string;
};

// This type is based on what's in the DevCenter search_content_prod collection
export type DevCenterEntry = {
  name: string;
  description: string;
  content: string | null;
  calculated_slug: string;
  tags: DevCenterEntryTag[];
  type: string;
};

export interface DevCenterEntryTag {
  name: string;
  type: string;
}

export const makeDevCenterDataSource = async ({
  name,
  databaseName,
  collectionName,
  baseUrl,
  connectionUri,
}: DevCenterProjectConfig): Promise<DataSource> => {
  return {
    name,
    async fetchPages() {
      const client = await new MongoClient(connectionUri).connect();
      try {
        const db = client.db(databaseName);
        const collection = db.collection<DevCenterEntry>(collectionName);
        const documents = collection.find();

        const pages: Page[] = [];
        for await (const document of documents) {
          if (!document.content) {
            logger.warn(
              `Discarding empty content document: ${document.calculated_slug}`
            );
            continue;
          }
          pages.push(makeDevCenterPage(document, name, baseUrl));
        }
        return pages;
      } finally {
        await client.close();
      }
    },
  };
};

export function makeDevCenterPage(
  document: DevCenterEntry,
  name: string,
  baseUrl: string
): Page {
  assert(document.content, "document.content must be defined");
  return {
    title: document.name,
    body: makeDevCenterPageBody({
      title: document.name,
      content: document.content,
    }),
    format: "md",
    sourceName: name,
    metadata: {
      tags: extractTags(document.tags),
      pageDescription: document.description,
      contentType: document.type,
    },
    url: /^https?:\/\//.test(document.calculated_slug)
      ? document.calculated_slug
      : new URL(
          document.calculated_slug.replace(/^\/?/, ""), // Strip leading slash (if present) to not clobber baseUrl path
          baseUrl.replace(/\/?$/, "/") // Add trailing slash to not lose last segment of baseUrl
        ).toString(),
  };
}

/**
  Extract relevant tags from dev center entry tags
 */
export function extractTags(tags: DevCenterEntryTag[]) {
  return tags
    .filter(
      (tag) =>
        tag.type === "L1Product" ||
        tag.type === "Technology" ||
        tag.type === "ProgrammingLanguage"
    )
    .map((tag) => tag.name);
}

export function makeDevCenterPageBody({
  title,
  content,
}: {
  title?: string;
  content: string;
}) {
  const mdTitle = title ? `# ${title}\n\n` : "";
  content = mdTitle + content;
  // Remove HTML <div> and <img> tags
  // Replace all spaces with uncommon character 🎃 b/c html-to-text convert() removes new characters
  // at the beginning of lines. Then re-replace 🎃 with spaces after convert().
  content = convert(content.replaceAll(" ", "🎃"), {
    preserveNewlines: true,
    selectors: [{ selector: "img", format: "skip" }],
  }).replaceAll("🎃", " ");

  content = removeMarkdownImagesAndLinks(content);

  // remove YouTube markdown directives (e.g. `:youtube[]{some content}`)
  content = content.replaceAll(/:youtube\[\]\{(.*)\}/g, "");
  // remove unnecessary newlines
  content = content.replaceAll(/\n{3,}/g, "\n\n");

  return content;
}
