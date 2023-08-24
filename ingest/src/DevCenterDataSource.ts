import { MongoClient } from "mongodb";
import { convert } from "html-to-text";
import { Page, assertEnvVars, logger } from "chat-core";
import { DataSource } from "./DataSource";
import { ProjectBase } from "./ProjectBase";
import { INGEST_ENV_VARS } from "./IngestEnvVars";

export type DevCenterProjectConfig = ProjectBase & {
  type: "devcenter";
  databaseName: string;
  collectionName: string;
  baseUrl: string;
};

// This type is based on what's in the DevCenter search_content_prod collection
export type DevCenterEntry = {
  name: string;
  description: string;
  content: string | null;
  calculated_slug: string;
};

export const makeDevCenterDataSource = async ({
  name,
  databaseName,
  collectionName,
  baseUrl,
}: DevCenterProjectConfig): Promise<DataSource> => {
  const { DEVCENTER_CONNECTION_URI } = assertEnvVars(INGEST_ENV_VARS);

  return {
    name,
    async fetchPages() {
      const client = await new MongoClient(DEVCENTER_CONNECTION_URI).connect();
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
          pages.push({
            title: document.name,
            body: makeDevCenterPageBody({
              title: document.name,
              content: document.content,
            }),
            format: "md",
            sourceName: name,
            metadata: {
              tags: [], // TODO
            },
            url: /^https?:\/\//.test(document.calculated_slug)
              ? document.calculated_slug
              : new URL(
                  document.calculated_slug.replace(/^\/?/, ""), // Strip leading slash (if present) to not clobber baseUrl path
                  baseUrl.replace(/\/?$/, "/") // Add trailing slash to not lose last segment of baseUrl
                ).toString(),
          });
        }
        return pages;
      } finally {
        await client.close();
      }
    },
  };
};

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

  // remove markdown images and links
  const mdLink = /!?\[(.*?)\]\(.*?\)/g;
  content = content.replaceAll(mdLink, (match, text) => {
    // remove images
    if (match.startsWith("!")) {
      return "";
    } else return text;
  });
  // remove YouTube markdown directives (e.g. `:youtube[]{some content}`)
  content = content.replaceAll(/:youtube\[\]\{(.*)\}/g, "");
  // remove unnecessary newlines
  content = content.replaceAll(/\n{3,}/g, "\n\n");

  return content;
}
