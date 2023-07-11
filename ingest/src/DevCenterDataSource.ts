import { MongoClient } from "mongodb";
import { Page, logger } from "chat-core";
import { DataSource } from "./DataSource";

// This type is based on what's in the DevCenter search_content_prod collection
export type DevCenterEntry = {
  name: string;
  description: string;
  content: string | null;
  calculated_slug: string;
};

export const makeDevCenterDataSource = async ({
  name,
  connectionUri,
  databaseName,
  collectionName,
  baseUrl,
}: {
  name: string;
  connectionUri: string;
  databaseName: string;
  collectionName: string;
  baseUrl: string;
}): Promise<DataSource> => {
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
          pages.push({
            body: document.content,
            format: "md",
            sourceName: name,
            tags: [], // TODO
            url: /^https?:\/\//.test(document.calculated_slug)
              ? document.calculated_slug
              : new URL(
                  document.calculated_slug,
                  baseUrl.replace(/\/?$/, "/")
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
