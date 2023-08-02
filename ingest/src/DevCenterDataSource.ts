import { MongoClient } from "mongodb";
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
            body: makeDevCenterPageBody({
              title: document.name,
              content: document.content,
            }),
            format: "md",
            sourceName: name,
            tags: [], // TODO
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
  const mdLink = /!?\[(.*?)\]\(.*?\)/g;
  return (
    content
      // remove images and links
      .replaceAll(mdLink, (match, text) => {
        // remove images
        if (match.startsWith("!")) {
          return "";
        } else return text;
      })
      // remove unnecessary newlines
      .replaceAll(/\n{3,}/g, "\n\n")
  );
}
